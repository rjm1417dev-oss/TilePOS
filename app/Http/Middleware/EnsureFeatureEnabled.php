<?php

namespace App\Http\Middleware;

use App\Models\FeatureFlag;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFeatureEnabled
{
    public function handle(Request $request, Closure $next, string $featureKey): Response
    {
        $user = $request->user();
        if (! $user || $user->isSuperAdmin()) {
            return $next($request);
        }

        $tenantId = $user->tenant_id;
        if (! FeatureFlag::isEnabled($featureKey, $tenantId)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'This feature is not available for your account.'], 403);
            }

            abort(403, 'This feature is not available for your account.');
        }

        return $next($request);
    }
}
