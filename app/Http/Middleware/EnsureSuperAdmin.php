<?php

namespace App\Http\Middleware;

use App\Services\SystemSettings;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->isSuperAdmin()) {
            abort(403, 'Super Admin access required.');
        }

        $whitelist = SystemSettings::superAdminIpWhitelist();
        if (! empty($whitelist) && ! in_array($request->ip(), $whitelist)) {
            abort(403, 'Access denied. Your IP is not whitelisted.');
        }

        if (SystemSettings::forceSuperAdmin2fa() && ! $request->user()->two_factor_confirmed_at) {
            if (! $request->routeIs('super-admin.settings.two-factor')
                && ! $request->routeIs('settings.two-factor.*')
                && ! $request->routeIs('user-password.confirm*')) {
                return redirect()->route('super-admin.settings.two-factor');
            }
        }

        return $next($request);
    }
}
