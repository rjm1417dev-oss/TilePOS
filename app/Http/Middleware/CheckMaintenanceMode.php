<?php

namespace App\Http\Middleware;

use App\Services\SystemSettings;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    protected array $except = [
        'login',
        'logout',
        'forgot-password',
        'reset-password/*',
        'email/verify/*',
        'register',
        'two-factor-challenge',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (! SystemSettings::maintenanceMode()) {
            return $next($request);
        }

        if ($this->inExceptArray($request)) {
            return $next($request);
        }

        if ($request->user()?->isSuperAdmin()) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'System under maintenance.'], 503);
        }

        return response()->view('maintenance', [
            'message' => SystemSettings::maintenanceMessage() ?? 'We are currently performing scheduled maintenance. Please try again later.',
        ], 503);
    }

    protected function inExceptArray(Request $request): bool
    {
        $path = $request->path();
        foreach ($this->except as $pattern) {
            if (str_ends_with($pattern, '/*')) {
                if (str_starts_with($path, substr($pattern, 0, -2))) {
                    return true;
                }
            } elseif ($path === $pattern) {
                return true;
            }
        }

        return false;
    }
}
