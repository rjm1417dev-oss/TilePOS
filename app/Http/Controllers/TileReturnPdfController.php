<?php

namespace App\Http\Controllers;

use App\Models\TileReturn;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class TileReturnPdfController extends Controller
{
    public function download(TileReturn $tileReturn)
    {
        try {
            $tileReturn->load([
                'tenant',
                'customer',
                'returnTile.brand',
                'returnTile.size',
                'exchangeTile.brand',
                'exchangeTile.size',
            ]);

            $html = view('pdf.tile-return-receipt', [
                'tileReturn' => $tileReturn,
            ])->render();

            $tempDir = sys_get_temp_dir().'/tile-return-pdf-'.uniqid();
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

                $typeLabel = $tileReturn->type === 'exchange' ? 'Exchange' : 'Return';
                $fileName = "{$typeLabel}_{$tileReturn->receipt_number}.pdf";

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
            Log::error('Tile Return PDF Generation Error: '.$e->getMessage(), [
                'tile_return_id' => $tileReturn->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to generate PDF. Please try again.',
                'message' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }
}
