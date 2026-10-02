<?php

use App\Http\Middleware\CheckMaintenanceMode;
use App\Http\Middleware\EnsureNotReadOnlyImpersonation;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LogRequestLatency;
use App\Http\Middleware\SetTenantContext;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::middleware('web')
                ->group(base_path('routes/super-admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'superadmin' => EnsureSuperAdmin::class,
            'impersonation.readonly' => EnsureNotReadOnlyImpersonation::class,
            'tenant.not.expired' => \App\Http\Middleware\EnsureTenantNotExpired::class,
            'feature' => \App\Http\Middleware\EnsureFeatureEnabled::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            CheckMaintenanceMode::class,
            HandleInertiaRequests::class,
            SetTenantContext::class,
            LogRequestLatency::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Resource not found.'], 404);
            }

            return response()->view('errors.404', [], 404);
        });

        $exceptions->renderable(function (Throwable $e, $request) {
            if (! $e instanceof Symfony\Component\HttpKernel\Exception\HttpException &&
                ! $e instanceof Illuminate\Auth\AuthenticationException &&
                ! $e instanceof Illuminate\Validation\ValidationException &&
                $request->expectsJson()) {
                return response()->json(['message' => 'Server error.'], 500);
            }

            if (! $e instanceof Symfony\Component\HttpKernel\Exception\HttpException &&
                ! $e instanceof Illuminate\Auth\AuthenticationException &&
                ! $e instanceof Illuminate\Validation\ValidationException &&
                config('app.debug') === false) {
                return response()->view('errors.500', [], 500);
            }
        });
    })->create();
