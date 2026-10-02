<?php

namespace App\Http\Middleware;

use App\Resolvers\TenantPermissionTeamResolver;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetTenantContext
{
    public function __construct(
        protected TenantPermissionTeamResolver $teamResolver
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->user()?->tenant_id;

        if ($tenantId) {
            $this->teamResolver->setPermissionsTeamId($tenantId);
        }

        return $next($request);
    }
}
