<?php

namespace App\Http\Middleware;

use App\Models\AccountsPayable;
use App\Models\AccountsReceivable;
use App\Models\FailedLoginAttempt;
use App\Models\FeatureFlag;
use App\Models\Stock;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
                'isSuperAdmin' => $request->user()?->isSuperAdmin() ?? false,
                'tenant' => $this->getAuthTenant($request),
                'permissions' => $request->user()
                    ? ($request->user()->isSuperAdmin()
                        ? \Spatie\Permission\Models\Permission::pluck('name')->toArray()
                        : $request->user()->getAllPermissions()->pluck('name')->toArray())
                    : [],
                'enabledFeatures' => $this->getEnabledFeatures($request),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'impersonating' => [
                'active' => $request->session()->has('impersonator_id'),
            ],
            'notifications' => $this->getNotifications($request),
        ];
    }

    /**
     * Get enabled feature flag keys for the current tenant.
     *
     * @return list<string>
     */
    protected function getEnabledFeatures(Request $request): array
    {
        $user = $request->user();
        if (! $user || $user->isSuperAdmin()) {
            return ['tiles', 'quotations', 'tile_returns', 'accounts_payable', 'accounts_receivable'];
        }

        $tenantId = $user->tenant_id;
        $keys = ['tiles', 'quotations', 'tile_returns', 'accounts_payable', 'accounts_receivable'];
        $enabled = [];
        foreach ($keys as $key) {
            if (FeatureFlag::isEnabled($key, $tenantId)) {
                $enabled[] = $key;
            }
        }

        return $enabled;
    }

    /**
     * Get notification data. Super admins see platform alerts; tenant users see tenant alerts.
     *
     * @return array<string, mixed>
     */
    protected function getNotifications(Request $request): array
    {
        if (! $request->user()) {
            return ['items' => [], 'unreadCount' => 0];
        }

        if ($request->user()->isSuperAdmin()) {
            return $this->getSuperAdminNotifications($request);
        }

        return $this->getTenantNotifications($request);
    }

    /**
     * Get super admin notifications: failed logins, new tenants, expiring trials.
     * Tenant notifications (low stock, payables, receivables) are not shown to super admins.
     *
     * @return array<string, mixed>
     */
    protected function getSuperAdminNotifications(Request $request): array
    {
        $readTypes = $request->session()->get('notification_read_types', []);
        $items = [];
        $unreadCount = 0;

        $since = Carbon::now()->subHours(24);
        $failedLoginCount = FailedLoginAttempt::where('attempted_at', '>=', $since)->count();
        if ($failedLoginCount > 0) {
            $unread = ! in_array('failed_logins', $readTypes);
            $items[] = [
                'type' => 'failed_logins',
                'title' => 'Suspicious Login Activity',
                'message' => $failedLoginCount.' failed login(s) in the last 24 hours',
                'href' => route('super-admin.dashboard'),
                'icon' => 'alert-triangle',
                'unread' => $unread,
            ];
            $unread && $unreadCount++;
        }

        $newTenantsCount = Tenant::where('created_at', '>=', Carbon::now()->subDays(7))->count();
        if ($newTenantsCount > 0) {
            $unread = ! in_array('new_tenants', $readTypes);
            $items[] = [
                'type' => 'new_tenants',
                'title' => 'New Tenants',
                'message' => "{$newTenantsCount} new tenant(s) in the last 7 days",
                'href' => route('super-admin.tenants.index'),
                'icon' => 'users',
                'unread' => $unread,
            ];
            $unread && $unreadCount++;
        }

        $expiringCount = Tenant::whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '>=', Carbon::now())
            ->where('trial_ends_at', '<=', Carbon::now()->addDays(7))
            ->whereIn('subscription_status', ['active', 'trial'])
            ->count();
        if ($expiringCount > 0) {
            $unread = ! in_array('expiring_trials', $readTypes);
            $items[] = [
                'type' => 'expiring_trials',
                'title' => 'Expiring Trials',
                'message' => "{$expiringCount} trial(s) expiring in the next 7 days",
                'href' => route('super-admin.tenants.index'),
                'icon' => 'calendar-clock',
                'unread' => $unread,
            ];
            $unread && $unreadCount++;
        }

        return [
            'items' => $items,
            'unreadCount' => $unreadCount,
        ];
    }

    /**
     * Get tenant notifications: low stock, payables, receivables.
     *
     * @return array<string, mixed>
     */
    protected function getTenantNotifications(Request $request): array
    {
        $lowStockCount = Stock::where(function ($q) {
            $q->whereColumn('in_stock', '<=', 'minimum_stock_level')
                ->orWhere('in_stock', '<=', 0);
        })->count();

        $payablesSummary = AccountsPayable::where('remaining_amount', '>', 0)
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(remaining_amount), 0) as total')
            ->first();

        $receivablesSummary = AccountsReceivable::where('remaining_amount', '>', 0)
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(remaining_amount), 0) as total')
            ->first();

        $readTypes = $request->session()->get('notification_read_types', []);
        $items = [];
        $unreadCount = 0;

        if ($lowStockCount > 0) {
            $unread = ! in_array('low_stock', $readTypes);
            $items[] = [
                'type' => 'low_stock',
                'title' => 'Low Stock Alert',
                'message' => "{$lowStockCount} item(s) below minimum stock level",
                'href' => route('stocks.index'),
                'icon' => 'box',
                'unread' => $unread,
            ];
            $unread && $unreadCount++;
        }

        if ($payablesSummary->count > 0) {
            $unread = ! in_array('payables', $readTypes);
            $items[] = [
                'type' => 'payables',
                'title' => 'Outstanding Payables',
                'message' => number_format($payablesSummary->total, 2).' total across '.$payablesSummary->count.' item(s)',
                'href' => route('accounts-payables.index'),
                'icon' => 'credit-card',
                'unread' => $unread,
            ];
            $unread && $unreadCount++;
        }

        if ($receivablesSummary->count > 0) {
            $unread = ! in_array('receivables', $readTypes);
            $items[] = [
                'type' => 'receivables',
                'title' => 'Outstanding Receivables',
                'message' => number_format($receivablesSummary->total, 2).' total across '.$receivablesSummary->count.' item(s)',
                'href' => route('accounts-receivables.index'),
                'icon' => 'receipt',
                'unread' => $unread,
            ];
            $unread && $unreadCount++;
        }

        return [
            'items' => $items,
            'unreadCount' => $unreadCount,
        ];
    }

    /**
     * Get the current tenant for shared Inertia auth data.
     */
    protected function getAuthTenant(Request $request): ?array
    {
        $user = $request->user();

        if (! $user || $user->isSuperAdmin()) {
            return null;
        }

        $tenant = $user->tenant;

        if (! $tenant) {
            return null;
        }

        return [
            'id' => $tenant->id,
            'business_name' => $tenant->business_name,
            'logo' => $tenant->logo,
        ];
    }
}
