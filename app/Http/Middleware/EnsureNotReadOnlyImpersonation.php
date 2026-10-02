<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotReadOnlyImpersonation
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->get('impersonating_read_only') && ! in_array($request->method(), ['GET', 'HEAD'])) {
            abort(403, 'Read-only mode. You cannot make changes while impersonating.');
        }

        return $next($request);
    }
}
