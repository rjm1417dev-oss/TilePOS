<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\FailedLoginAttempt;
use App\Models\Quotation;
use App\Models\RequestLatencyLog;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $tenants = Tenant::withCount(['quotations', 'tiles', 'stocks'])
            ->get();

        $topTenantsByQuotations = $tenants
            ->sortByDesc('quotations_count')
            ->take(5)
            ->values()
            ->map(fn ($t) => [
                'id' => $t->id,
                'business_name' => $t->business_name,
                'quotations_count' => $t->quotations_count,
                'tiles_count' => $t->tiles_count,
                'stocks_count' => $t->stocks_count,
            ]);

        $since = Carbon::now()->subHours(24);
        $failedLogins = FailedLoginAttempt::where('attempted_at', '>=', $since)
            ->selectRaw('ip_address, email, count(*) as attempts')
            ->groupBy('ip_address', 'email')
            ->havingRaw('count(*) >= 3')
            ->orderByDesc('attempts')
            ->limit(10)
            ->get();

        $latencyData = RequestLatencyLog::where('created_at', '>=', Carbon::now()->subHours(1))
            ->selectRaw('path, avg(duration_ms) as avg_ms, count(*) as requests')
            ->groupBy('path')
            ->orderByRaw('avg(duration_ms) desc')
            ->limit(10)
            ->get();

        $stats = [
            'tenants_total' => Tenant::count(),
            'tenants_active' => Tenant::where('is_active', true)->count(),
            'quotations_total' => Quotation::count(),
            'failed_logins_24h' => FailedLoginAttempt::where('attempted_at', '>=', $since)->count(),
        ];

        $analytics = $this->buildAnalytics();

        return Inertia::render('super-admin/dashboard', [
            'stats' => $stats,
            'topTenantsByQuotations' => $topTenantsByQuotations,
            'securityAlerts' => $failedLogins,
            'latencyData' => $latencyData,
            'analytics' => $analytics,
        ]);
    }

    protected function buildAnalytics(): array
    {
        $months = 12;
        $from = Carbon::now()->subMonths($months);

        $tenantGrowth = Tenant::query()
            ->where('created_at', '>=', $from)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month")
            ->selectRaw('COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->map(fn ($v) => (int) $v)
            ->toArray();

        $labels = collect();
        for ($i = $months - 1; $i >= 0; $i--) {
            $labels->push(Carbon::now()->subMonths($i)->format('Y-m'));
        }
        $tenantGrowthLabels = $labels->toArray();
        $tenantGrowthValues = $labels->map(fn ($l) => $tenantGrowth[$l] ?? 0)->toArray();

        $revenueByTenant = Quotation::withoutGlobalScopes()
            ->where('type', 'invoice')
            ->where('invoice_date', '>=', $from)
            ->select('tenant_id')
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total')
            ->groupBy('tenant_id')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(function ($r) {
                $tenant = Tenant::find($r->tenant_id);

                return [
                    'tenant_id' => $r->tenant_id,
                    'tenant_name' => $tenant?->business_name ?? 'Unknown',
                    'revenue' => (float) $r->total,
                ];
            })
            ->values()
            ->toArray();

        $trialStarted = Tenant::whereNotNull('trial_ends_at')->count();
        $trialConverted = Tenant::whereNotNull('trial_ends_at')
            ->where('subscription_status', 'active')
            ->count();
        $trialChurned = Tenant::whereNotNull('trial_ends_at')
            ->whereIn('subscription_status', ['cancelled', 'expired'])
            ->count();
        $trialConversionRate = $trialStarted > 0
            ? round(100 * $trialConverted / $trialStarted, 1)
            : 0;

        $churnedTotal = Tenant::whereIn('subscription_status', ['cancelled', 'expired'])->count();
        $churnByMonth = Tenant::query()
            ->whereIn('subscription_status', ['cancelled', 'expired'])
            ->where('updated_at', '>=', $from)
            ->selectRaw("DATE_FORMAT(updated_at, '%Y-%m') as month")
            ->selectRaw('COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->map(fn ($v) => (int) $v)
            ->toArray();
        $churnLabels = $labels->toArray();
        $churnValues = $labels->map(fn ($l) => $churnByMonth[$l] ?? 0)->toArray();

        $revenueByMonth = Quotation::withoutGlobalScopes()
            ->where('type', 'invoice')
            ->where('invoice_date', '>=', $from)
            ->selectRaw("DATE_FORMAT(invoice_date, '%Y-%m') as month")
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month')
            ->map(fn ($v) => (float) $v)
            ->toArray();
        $revenueTrendValues = $labels->map(fn ($l) => $revenueByMonth[$l] ?? 0)->toArray();

        return [
            'tenantGrowth' => [
                'labels' => $tenantGrowthLabels,
                'values' => $tenantGrowthValues,
            ],
            'revenueByTenant' => $revenueByTenant,
            'trialConversions' => [
                'started' => $trialStarted,
                'converted' => $trialConverted,
                'churned' => $trialChurned,
                'conversionRate' => $trialConversionRate,
            ],
            'churn' => [
                'total' => $churnedTotal,
                'labels' => $churnLabels,
                'values' => $churnValues,
            ],
            'revenueTrend' => [
                'labels' => $labels->toArray(),
                'values' => $revenueTrendValues,
            ],
        ];
    }
}
