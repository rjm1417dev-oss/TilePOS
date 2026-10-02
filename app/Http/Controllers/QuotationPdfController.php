<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class QuotationPdfController extends Controller
{
    public function download(Quotation $quotation)
    {
        $this->authorize('view', $quotation);

        try {
            $quotation->load([
                'tenant',
                'items.tile.brand',
                'items.tile.size',
                'items.product.brand',
            ]);

            $subtotal = $quotation->items->sum('subtotal');

            $html = view('pdf.receipt', [
                'quotation' => $quotation,
                'subtotal' => $subtotal,
                'logoBase64' => $quotation->tenant?->logo,
            ])->render();

            $tempDir = sys_get_temp_dir().'/receipt-pdf-'.uniqid();
            mkdir($tempDir, 0755, true);
            $tempFile = $tempDir.'/index.html';

            try {
                file_put_contents($tempFile, $html);

                $nodeBinary = config('browsershot.node_binary') ?: 'node';
                $scriptPath = base_path('scripts/receipt-pdf.mjs');
                $chromePath = config('browsershot.chrome_path');

                $process = new Process(
                    [$nodeBinary, $scriptPath, $tempFile],
                    base_path(),
                    [
                        'BROWSERSHOT_CHROME_PATH' => $chromePath,
                    ],
                    null,
                    60
                );

                $process->mustRun();

                $pdf = $process->getOutput();

                $fileName = ($quotation->type === 'invoice' ? 'Invoice' : 'Quotation').'_'.$quotation->quotation_number.'.pdf';

                $disposition = request()->query('inline') ? 'inline' : 'attachment';

                return response()->streamDownload(
                    function () use ($pdf) {
                        echo $pdf;
                    },
                    $fileName,
                    ['Content-Type' => 'application/pdf'],
                    $disposition,
                );
            } finally {
                @unlink($tempFile);
                @rmdir($tempDir);
            }
        } catch (\Exception $e) {
            Log::error('PDF Generation Error: '.$e->getMessage(), [
                'quotation_id' => $quotation->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to generate PDF. Please try again.',
                'message' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }
}
