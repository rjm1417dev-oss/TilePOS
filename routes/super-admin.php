<?php

use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\SuperAdmin\ActivityLogsController;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\ExportController;
use App\Http\Controllers\SuperAdmin\ImpersonateController;
use App\Http\Controllers\SuperAdmin\OmniSearchController;
use App\Http\Controllers\SuperAdmin\PermissionController;
use App\Http\Controllers\SuperAdmin\RoleController;
use App\Http\Controllers\SuperAdmin\SettingsController;
use App\Http\Controllers\SuperAdmin\SuperAdminUserController;
use App\Http\Controllers\SuperAdmin\TenantController;
use App\Http\Controllers\SuperAdmin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('super-admin/impersonate/stop', [ImpersonateController::class, 'stop'])
        ->name('super-admin.impersonate.stop');
});

Route::middleware(['auth', 'verified', 'superadmin'])->prefix('super-admin')->name('super-admin.')->group(function () {
    Route::post('chatbot/message', [ChatbotController::class, 'superAdminMessage'])
        ->name('chatbot.message')
        ->middleware('throttle:chatbot');

    Route::get('/', fn () => redirect()->route('super-admin.dashboard'));
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('omni-search', OmniSearchController::class)->name('omni-search');
    Route::post('tenants/{tenant}/toggle-active', [TenantController::class, 'toggleActive'])->name('tenants.toggle-active');
    Route::post('tenants/bulk-activate', [TenantController::class, 'bulkActivate'])->name('tenants.bulk-activate');
    Route::post('tenants/bulk-deactivate', [TenantController::class, 'bulkDeactivate'])->name('tenants.bulk-deactivate');
    Route::post('tenants/bulk-export', [ExportController::class, 'bulkTenantData'])->name('tenants.bulk-export');
    Route::post('tenants/{tenant}/impersonate', [ImpersonateController::class, 'start'])->name('tenants.impersonate');
    Route::post('tenants/{tenant}/users/{user}/impersonate', [ImpersonateController::class, 'startUser'])->name('tenants.users.impersonate');
    Route::get('tenants/{tenant}/export', [ExportController::class, 'tenantData'])->name('tenants.export');
    Route::get('settings', fn () => redirect()->route('super-admin.settings.profile'))->name('settings.index');
    Route::get('settings/profile', [SettingsController::class, 'profile'])->name('settings.profile');
    Route::get('settings/password', [SettingsController::class, 'password'])->name('settings.password');
    $twoFactorRoute = Route::get('settings/two-factor', [SettingsController::class, 'twoFactor'])->name('settings.two-factor');
    if (\Laravel\Fortify\Features::optionEnabled(\Laravel\Fortify\Features::twoFactorAuthentication(), 'confirmPassword')) {
        $twoFactorRoute->middleware('password.confirm');
    }
    Route::get('settings/appearance', [SettingsController::class, 'appearance'])->name('settings.appearance');
    Route::get('settings/global', [SettingsController::class, 'global'])->name('settings.global');
    Route::get('settings/data-privacy', [SettingsController::class, 'dataPrivacy'])->name('settings.data-privacy');
    Route::put('settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::put('settings/retention', [SettingsController::class, 'updateRetention'])->name('settings.retention.update');
    Route::post('settings/test-smtp', [SettingsController::class, 'testSmtp'])->name('settings.test-smtp');
    Route::put('settings/feature-flags', [SettingsController::class, 'updateFeatureFlags'])->name('settings.feature-flags');
    Route::get('export/logs', [ExportController::class, 'activityLogs'])->name('export.logs');
    Route::get('export/database', [ExportController::class, 'databaseBackup'])->name('export.database');
    Route::get('activity-logs', [ActivityLogsController::class, 'index'])->name('activity-logs.index');
    Route::get('permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::post('permissions', [PermissionController::class, 'store'])->name('permissions.store');
    Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');
    Route::resource('tenants', TenantController::class);
    Route::resource('tenants.roles', RoleController::class)->shallow(false)->except(['show']);
    Route::get('tenants/{tenant}/users/{user}/export-data', [UserController::class, 'exportData'])->name('tenants.users.export-data');
    Route::resource('tenants.users', UserController::class)->shallow(false)->except(['show']);
    Route::resource('super-admins', SuperAdminUserController::class)->parameters(['super-admins' => 'super_admin_user'])->except(['show']);
});
