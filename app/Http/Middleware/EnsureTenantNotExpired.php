<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantNotExpired
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user || $user->isSuperAdmin()) {
            return $next($request);
        }

        $tenantId = $user->tenant_id;
        if (! $tenantId) {
            return $next($request);
        }

        if ($request->routeIs('subscription.expired')) {
            return $next($request);
        }

        $tenant = Tenant::find($tenantId);
        if ($tenant && $tenant->isExpired()) {
            return redirect()->route('subscription.expired');
        }

        return $next($request);
    }
}
