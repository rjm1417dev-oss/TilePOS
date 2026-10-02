<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuperAdmin\BulkTenantActionRequest;
use App\Models\Tenant;
use App\Services\DatabaseBackupService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

class ExportController extends Controller
{
    public function tenantData(Tenant $tenant): StreamedResponse
    {
        $zip = new ZipArchive;
        $tempPath = sys_get_temp_dir().'/tenant-export-'.$tenant->id.'-'.uniqid().'.zip';

        if ($zip->open($tempPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Could not create export file.');
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);

        $tiles = $tenant->tiles()->get()->map(fn ($t) => $t->only(['id', 'tile_code', 'tile_name', 'brand_id', 'size_id', 'created_at']));
        $customers = $tenant->customers()->get()->map(fn ($c) => $c->only(['id', 'name', 'phone', 'cnic', 'address', 'created_at']));
        $quotations = $tenant->quotations()->get()->map(fn ($q) => $q->only(['id', 'quotation_number', 'type', 'total_amount', 'created_at']));

        $zip->addFromString('tiles.csv', $this->toCsv($tiles->toArray()));
        $zip->addFromString('customers.csv', $this->toCsv($customers->toArray()));
        $zip->addFromString('quotations.csv', $this->toCsv($quotations->toArray()));

        app()[\Spatie\Permission\PermissionRegistrar::class]->setPermissionsTeamId(null);

        $zip->close();

        return response()->streamDownload(
            function () use ($tempPath) {
                echo file_get_contents($tempPath);
                @unlink($tempPath);
            },
            "tenant-{$tenant->id}-export-".now()->format('Y-m-d').'.zip',
            ['Content-Type' => 'application/zip'],
            'attachment'
        );
    }

    public function bulkTenantData(BulkTenantActionRequest $request): StreamedResponse
    {
        $tenantIds = $request->input('tenant_ids', []);
        $tenants = Tenant::whereIn('id', $tenantIds)->get();

        if ($tenants->isEmpty()) {
            abort(422, 'No valid tenants selected.');
        }

        $tempPath = sys_get_temp_dir().'/bulk-tenant-export-'.uniqid().'.zip';
        $zip = new ZipArchive;

        if ($zip->open($tempPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Could not create export file.');
        }

        foreach ($tenants as $tenant) {
            app()[\Spatie\Permission\PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);

            $prefix = 'tenant-'.$tenant->id.'-'.preg_replace('/[^a-z0-9]/i', '-', $tenant->business_name);
            $tiles = $tenant->tiles()->get()->map(fn ($t) => $t->only(['id', 'tile_code', 'tile_name', 'brand_id', 'size_id', 'created_at']));
            $customers = $tenant->customers()->get()->map(fn ($c) => $c->only(['id', 'name', 'phone', 'cnic', 'address', 'created_at']));
            $quotations = $tenant->quotations()->get()->map(fn ($q) => $q->only(['id', 'quotation_number', 'type', 'total_amount', 'created_at']));

            $zip->addFromString("{$prefix}/tiles.csv", $this->toCsv($tiles->toArray()));
            $zip->addFromString("{$prefix}/customers.csv", $this->toCsv($customers->toArray()));
            $zip->addFromString("{$prefix}/quotations.csv", $this->toCsv($quotations->toArray()));

            app()[\Spatie\Permission\PermissionRegistrar::class]->setPermissionsTeamId(null);
        }

        $zip->close();

        return response()->streamDownload(
            function () use ($tempPath) {
                echo file_get_contents($tempPath);
                @unlink($tempPath);
            },
            'tenants-export-'.now()->format('Y-m-d').'.zip',
            ['Content-Type' => 'application/zip'],
            'attachment'
        );
    }

    public function databaseBackup(DatabaseBackupService $backup): StreamedResponse
    {
        $tempDir = sys_get_temp_dir().'/backup-'.uniqid();
        mkdir($tempDir, 0755, true);

        try {
            $path = $backup->createToFile($tempDir);
            $filename = basename($path);
            $mime = str_ends_with($filename, '.sql')
                ? 'application/sql'
                : 'application/x-sqlite3';

            return response()->streamDownload(
                function () use ($path, $tempDir) {
                    echo file_get_contents($path);
                    @unlink($path);
                    @rmdir($tempDir);
                },
                $filename,
                ['Content-Type' => $mime],
                'attachment'
            );
        } catch (\Throwable $e) {
            @rmdir($tempDir);

            abort(500, $e->getMessage());
        }
    }

    public function activityLogs(Request $request)
    {
        $format = $request->input('format', 'json');
        $since = Carbon::now()->subDays(90);
        $logs = Activity::where('created_at', '>=', $since)
            ->with('causer:id,name,email')
            ->orderByDesc('created_at')
            ->limit(10000)
            ->get();

        if ($format === 'pdf') {
            $html = $this->logsToHtml($logs);
            $dompdf = new \Dompdf\Dompdf;
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            return response()->streamDownload(
                fn () => print $dompdf->output(),
                'activity-logs-'.now()->format('Y-m-d').'.pdf',
                ['Content-Type' => 'application/pdf'],
                'attachment'
            );
        }

        $data = $logs->map(fn ($log) => [
            'created_at' => $log->created_at?->toIso8601String(),
            'causer' => $log->causer?->only(['id', 'name', 'email']),
            'description' => $log->description,
            'subject_type' => $log->subject_type,
            'subject_id' => $log->subject_id,
            'properties' => $log->properties,
            'event' => $log->event,
        ]);

        return response()->streamDownload(
            fn () => print $data->toJson(JSON_PRETTY_PRINT),
            'activity-logs-'.now()->format('Y-m-d').'.json',
            ['Content-Type' => 'application/json'],
            'attachment'
        );
    }

    public function archiveOldLogs(): void
    {
        Activity::where('created_at', '<', Carbon::now()->subDays(90))->delete();
    }

    protected function logsToHtml($logs): string
    {
        $html = '<html><body><h1>Activity Logs</h1><table border="1"><tr><th>Date</th><th>User</th><th>Description</th><th>Subject</th></tr>';
        foreach ($logs as $log) {
            $subject = $log->subject_type ? class_basename($log->subject_type).'#'.$log->subject_id : '—';
            $html .= sprintf(
                '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                $log->created_at?->format('Y-m-d H:i'),
                htmlspecialchars($log->causer?->email ?? '—'),
                htmlspecialchars($log->description ?? ''),
                htmlspecialchars($subject)
            );
        }
        $html .= '</table></body></html>';

        return $html;
    }

    protected function toCsv(array $data): string
    {
        if (empty($data)) {
            return '';
        }
        $columns = array_keys(reset($data));
        $out = fopen('php://temp', 'r+');
        fputcsv($out, $columns);
        foreach ($data as $row) {
            $line = [];
            foreach ($columns as $col) {
                $line[] = is_array($row[$col] ?? null) ? json_encode($row[$col]) : ($row[$col] ?? '');
            }
            fputcsv($out, $line);
        }
        rewind($out);
        $csv = stream_get_contents($out);
        fclose($out);

        return $csv;
    }
}
