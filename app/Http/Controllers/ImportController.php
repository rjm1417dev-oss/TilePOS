<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportStoreRequest;
use App\Models\Brand;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        if (! Auth::user()->can('import.create')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        return Inertia::render('import/index', [
            'import_result' => session('import_result'),
            'import_error' => session('import_error'),
        ]);
    }

    public function store(ImportStoreRequest $request): RedirectResponse
    {
        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $type = $request->validated('type');
        $path = $request->file('file')->getRealPath();

        $rows = $this->parseCsv($path);
        if (empty($rows)) {
            return redirect()->back()->with([
                'import_error' => 'The CSV file is empty or could not be parsed.',
                'import_result' => null,
            ]);
        }

        $headers = array_shift($rows);
        $recordCount = count($headers);
        $records = [];
        foreach ($rows as $row) {
            $padded = array_pad(array_slice($row, 0, $recordCount), $recordCount, null);
            $records[] = array_combine($headers, $padded);
        }

        $created = 0;
        $skipped = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            if ($type === 'customers') {
                [$created, $skipped, $errors] = $this->importCustomers($records, $headers, $tenantId);
            } elseif ($type === 'suppliers') {
                [$created, $skipped, $errors] = $this->importSuppliers($records, $headers, $tenantId);
            } elseif ($type === 'products') {
                [$created, $skipped, $errors] = $this->importProducts($records, $headers, $tenantId);
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()->with([
                'import_error' => 'Import failed: '.$e->getMessage(),
                'import_result' => null,
            ]);
        }

        return redirect()->back()->with([
            'import_result' => [
                'created' => $created,
                'skipped' => $skipped,
                'errors' => $errors,
            ],
            'import_error' => null,
        ]);
    }

    public function downloadTemplate(string $type): StreamedResponse|RedirectResponse
    {
        if (! Auth::user()->can('import.create')) {
            abort(403);
        }

        if (! in_array($type, ['customers', 'suppliers', 'products'], true)) {
            abort(404);
        }

        $headers = $this->getTemplateHeaders($type);
        $sample = $this->getTemplateSampleRow($type);
        $filename = "import-{$type}-template.csv";

        return response()->streamDownload(function () use ($headers, $sample) {
            $fh = fopen('php://output', 'w');
            fputcsv($fh, $headers);
            fputcsv($fh, $sample);
            fclose($fh);
        }, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * @return array<int, array<int, string>>
     */
    protected function parseCsv(string $path): array
    {
        $rows = [];
        if (($fh = fopen($path, 'r')) === false) {
            return [];
        }
        while (($row = fgetcsv($fh)) !== false) {
            $rows[] = $row;
        }
        fclose($fh);

        return $rows;
    }

    /**
     * @param  array<int, array<string, mixed>>  $records
     * @return array{0: int, 1: int, 2: array<int, string>}
     */
    protected function importCustomers(array $records, array $headers, int $tenantId): array
    {
        $created = 0;
        $skipped = 0;
        $errors = [];
        $rowNum = 1;

        foreach ($records as $row) {
            $rowNum++;
            if (! is_array($row)) {
                $skipped++;

                continue;
            }

            $name = trim((string) ($this->getValue($row, ['name', 'customer_name', 'full_name']) ?? ''));
            if ($name === '') {
                $skipped++;
                $errors[] = "Row {$rowNum}: Name is required";

                continue;
            }

            Customer::withoutGlobalScopes()->updateOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'name' => $name,
                ],
                [
                    'phone' => $this->getValue($row, ['phone', 'mobile', 'contact']),
                    'cnic' => $this->getValue($row, ['cnic', 'cnic_number', 'national_id']),
                    'address' => $this->getValue($row, ['address', 'location']),
                    'notes' => $this->getValue($row, ['notes', 'remarks']),
                ]
            );
            $created++;
        }

        return [$created, $skipped, $errors];
    }

    /**
     * @param  array<int, array<string, mixed>>  $records
     * @return array{0: int, 1: int, 2: array<int, string>}
     */
    protected function importSuppliers(array $records, array $headers, int $tenantId): array
    {
        $created = 0;
        $skipped = 0;
        $errors = [];
        $rowNum = 1;

        foreach ($records as $row) {
            $rowNum++;
            if (! is_array($row)) {
                $skipped++;

                continue;
            }

            $supplierName = trim((string) ($this->getValue($row, ['supplier_name', 'name', 'company_name']) ?? ''));
            if ($supplierName === '') {
                $skipped++;
                $errors[] = "Row {$rowNum}: Supplier name is required";

                continue;
            }

            $phone = trim($this->getValue($row, ['phone', 'mobile', 'contact', 'primary_phone']) ?? '');
            if ($phone === '') {
                $skipped++;
                $errors[] = "Row {$rowNum}: Phone is required";

                continue;
            }

            Supplier::withoutGlobalScopes()->updateOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'supplier_name' => $supplierName,
                ],
                [
                    'contact_person' => $this->getValue($row, ['contact_person', 'contact']) ?: $supplierName,
                    'cnic' => $this->getValue($row, ['cnic', 'cnic_number']),
                    'phone' => $phone,
                    'alternate_phone' => $this->getValue($row, ['alternate_phone', 'secondary_phone']),
                ]
            );
            $created++;
        }

        return [$created, $skipped, $errors];
    }

    /**
     * @param  array<int, array<string, mixed>>  $records
     * @return array{0: int, 1: int, 2: array<int, string>}
     */
    protected function importProducts(array $records, array $headers, int $tenantId): array
    {
        $created = 0;
        $skipped = 0;
        $errors = [];
        $rowNum = 1;

        foreach ($records as $row) {
            $rowNum++;
            if (! is_array($row)) {
                $skipped++;

                continue;
            }

            $productName = trim((string) ($this->getValue($row, ['product_name', 'name', 'title']) ?? ''));
            if ($productName === '') {
                $skipped++;
                $errors[] = "Row {$rowNum}: Product name is required";

                continue;
            }

            $salePrice = $this->getValue($row, ['sale_price', 'price', 'selling_price']);
            if ($salePrice === null || $salePrice === '' || ! is_numeric(str_replace([',', ' '], '', $salePrice))) {
                $skipped++;
                $errors[] = "Row {$rowNum}: Sale price is required and must be numeric";

                continue;
            }
            $salePrice = (float) str_replace([',', ' '], '', $salePrice);

            $brandId = null;
            $brandName = $this->getValue($row, ['brand', 'brand_name']);
            if ($brandName && trim((string) $brandName) !== '') {
                $brand = Brand::withoutGlobalScopes()
                    ->where('tenant_id', $tenantId)
                    ->where('brand_name', 'like', trim($brandName))
                    ->first();
                $brandId = $brand?->id;
            }

            Product::withoutGlobalScopes()->updateOrCreate(
                [
                    'tenant_id' => $tenantId,
                    'product_name' => $productName,
                ],
                [
                    'brand_id' => $brandId,
                    'sale_price' => $salePrice,
                ]
            );
            $created++;
        }

        return [$created, $skipped, $errors];
    }

    /**
     * @param  array<string|int, mixed>  $row
     * @param  array<int, string>  $keys
     */
    protected function getValue(array $row, array $keys): mixed
    {
        foreach ($keys as $key) {
            $normalized = strtolower(str_replace([' ', '-'], '_', $key));
            foreach ($row as $k => $v) {
                if (strtolower(str_replace([' ', '-'], '_', (string) $k)) === $normalized) {
                    return $v;
                }
            }
        }

        return null;
    }

    /** @return list<string> */
    protected function getTemplateHeaders(string $type): array
    {
        return match ($type) {
            'customers' => ['name', 'phone', 'cnic', 'address', 'notes'],
            'suppliers' => ['supplier_name', 'contact_person', 'phone', 'alternate_phone', 'cnic'],
            'products' => ['product_name', 'brand_name', 'sale_price'],
            default => [],
        };
    }

    /** @return list<string> */
    protected function getTemplateSampleRow(string $type): array
    {
        return match ($type) {
            'customers' => ['Acme Corp', '0300-1234567', '12345-1234567-1', '123 Main St, City', 'Sample note'],
            'suppliers' => ['Supplier ABC', 'John Doe', '0300-9876543', '042-1234567', ''],
            'products' => ['Sample Product', 'Brand Name', '1500.00'],
            default => [],
        };
    }
}
