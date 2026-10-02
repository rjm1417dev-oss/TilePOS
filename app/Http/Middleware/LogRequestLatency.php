<?php

namespace App\Http\Middleware;

use App\Models\RequestLatencyLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogRequestLatency
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);
        $response = $next($request);
        $duration = (int) round((microtime(true) - $start) * 1000);

        $path = $request->path();
        if (str_starts_with($path, 'dashboard') || str_starts_with($path, 'super-admin')) {
            try {
                RequestLatencyLog::create([
                    'path' => '/'.$path,
                    'duration_ms' => $duration,
                    'status_code' => $response->getStatusCode(),
                    'created_at' => now(),
                ]);
            } catch (\Throwable) {
                // Silently ignore logging failures
            }
        }

        return $response;
    }
}
