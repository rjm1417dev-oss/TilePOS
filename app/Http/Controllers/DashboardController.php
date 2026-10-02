<?php

namespace App\Http\Controllers;

use App\Models\AccountsPayable;
use App\Models\AccountsReceivable;
use App\Models\Customer;
use App\Models\Quotation;
use App\Models\QuotationItem;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if (Auth::user()->isSuperAdmin()) {
            return redirect()->route('super-admin.dashboard');
        }

        $now = Carbon::now();
        $salesPeriod = $request->query('sales_period', 'past_30_days');

        // Financial Stats
        $totalPayables = (float) AccountsPayable::sum('remaining_amount');
        $totalReceivables = (float) AccountsReceivable::sum('remaining_amount');
        $totalEarningsDaily = (float) Quotation::whereBetween('created_at', [$now->copy()->startOfDay(), $now->copy()->endOfDay()])->sum('paid_amount');
        $totalEarningsWeekly = (float) Quotation::whereBetween('created_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()])->sum('paid_amount');
        $totalEarningsMonthly = (float) Quotation::whereBetween('created_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])->sum('paid_amount');
        $totalEarningsYearly = (float) Quotation::whereBetween('created_at', [$now->copy()->startOfYear(), $now->copy()->endOfYear()])->sum('paid_amount');

        $payablesChartData = $this->getPayablesChartData();
        $receivablesChartData = $this->getReceivablesChartData();
        $earningsChartData = $this->getEarningsChartData();

        // Business Stats
        $ordersDaily = Quotation::whereBetween('created_at', [$now->copy()->startOfDay(), $now->copy()->endOfDay()])->count();
        $ordersWeekly = Quotation::whereBetween('created_at', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()])->count();
        $ordersMonthly = Quotation::whereBetween('created_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])->count();
        $ordersYearly = Quotation::whereBetween('created_at', [$now->copy()->startOfYear(), $now->copy()->endOfYear()])->count();

        $regularCustomers = Customer::has('quotations', '>', 1)->count();
        $newCustomers = Customer::whereBetween('created_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])->count();
        $oldCustomers = Customer::where('created_at', '<', $now->copy()->startOfMonth())->count();

        $ordersChartData = $this->getOrdersChartData();
        $customersChartData = $this->getCustomersChartData();

        // Sales Chart
        $salesChartData = $this->getSalesChartData($salesPeriod);

        // Top Selling Tiles
        $topSellingTiles = $this->getTopSellingTiles();

        // Recent Orders
        $recentOrders = Quotation::where('type', 'invoice')
            ->with(['items.tile', 'items.product'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Quotation $q) => [
                'id' => $q->id,
                'quotation_number' => $q->quotation_number,
                'customer_name' => $q->customer_name,
                'total_amount' => (float) $q->total_amount,
                'created_at' => $q->created_at->toIso8601String(),
            ]);

        return Inertia::render('dashboard', [
            'sales_period' => $salesPeriod,
            'financialStats' => [
                'totalPayables' => $totalPayables,
                'totalReceivables' => $totalReceivables,
                'totalEarnings' => [
                    'daily' => $totalEarningsDaily,
                    'weekly' => $totalEarningsWeekly,
                    'monthly' => $totalEarningsMonthly,
                    'yearly' => $totalEarningsYearly,
                ],
                'payablesChartData' => $payablesChartData,
                'receivablesChartData' => $receivablesChartData,
                'earningsChartData' => $earningsChartData,
            ],
            'businessStats' => [
                'orders' => ['daily' => $ordersDaily, 'weekly' => $ordersWeekly, 'monthly' => $ordersMonthly, 'yearly' => $ordersYearly],
                'customers' => ['regular' => $regularCustomers, 'new' => $newCustomers, 'old' => $oldCustomers],
                'ordersChartData' => $ordersChartData,
                'customersChartData' => $customersChartData,
            ],
            'salesChart' => $salesChartData,
            'topSellingTiles' => $topSellingTiles,
            'recentOrders' => $recentOrders,
        ]);
    }

    protected function getPayablesChartData(): array
    {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $data[] = (float) AccountsPayable::whereBetween('created_at', [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()])
                ->sum('remaining_amount');
        }

        return $data;
    }

    protected function getReceivablesChartData(): array
    {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $data[] = (float) AccountsReceivable::whereBetween('created_at', [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()])
                ->sum('remaining_amount');
        }

        return $data;
    }

    protected function getEarningsChartData(): array
    {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $data[] = (float) Quotation::whereBetween('created_at', [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()])
                ->sum('paid_amount');
        }

        return $data;
    }

    protected function getOrdersChartData(): array
    {
        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $data[] = Quotation::whereBetween('created_at', [$date->copy()->startOfDay(), $date->copy()->endOfDay()])->count();
        }

        return $data;
    }

    protected function getCustomersChartData(): array
    {
        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $data[] = Customer::whereBetween('created_at', [$date->copy()->startOfDay(), $date->copy()->endOfDay()])->count();
        }

        return $data;
    }

    protected function getSalesChartData(string $period = 'past_30_days'): array
    {
        $now = Carbon::now();
        $range = match ($period) {
            'today' => [$now->copy()->startOfDay(), $now->copy()->endOfDay()],
            'yesterday' => [$now->copy()->subDay()->startOfDay(), $now->copy()->subDay()->endOfDay()],
            'past_7_days' => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()],
            'past_30_days' => [$now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay()],
            'past_3_months' => [$now->copy()->subMonths(3)->startOfMonth(), $now->copy()->endOfDay()],
            'past_6_months' => [$now->copy()->subMonths(6)->startOfMonth(), $now->copy()->endOfDay()],
            'past_year' => [$now->copy()->subYear()->startOfDay(), $now->copy()->endOfDay()],
            'this_month' => [$now->copy()->startOfMonth(), $now->copy()->endOfDay()],
            'last_month' => [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()],
            'this_year' => [$now->copy()->startOfYear(), $now->copy()->endOfDay()],
            'last_year' => [$now->copy()->subYear()->startOfYear(), $now->copy()->subYear()->endOfYear()],
            default => [$now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay()],
        };

        [$start, $end] = $range;
        $daysDiff = $start->diffInDays($end);

        if ($daysDiff <= 90) {
            $labels = [];
            $values = [];
            for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                $dayEnd = $d->copy()->endOfDay();
                if ($dayEnd->gt($end)) {
                    $dayEnd = $end->copy();
                }
                $labels[] = $d->format('M d');
                $values[] = (float) Quotation::whereBetween('created_at', [$d->copy()->startOfDay(), $dayEnd])->sum('total_amount');
            }
        } elseif ($daysDiff <= 365) {
            $labels = [];
            $values = [];
            $currentMonth = $start->copy()->startOfMonth();
            while ($currentMonth->lte($end)) {
                $monthEnd = $currentMonth->copy()->endOfMonth();
                if ($monthEnd->gt($end)) {
                    $monthEnd = $end->copy();
                }
                $actualStart = $currentMonth->lt($start) ? $start->copy() : $currentMonth->copy();
                $labels[] = $currentMonth->format('M Y');
                $values[] = (float) Quotation::whereBetween('created_at', [$actualStart, $monthEnd])->sum('total_amount');
                $currentMonth->addMonth();
            }
        } else {
            $labels = [];
            $values = [];
            $currentYear = $start->copy()->startOfYear();
            while ($currentYear->lte($end)) {
                $yearEnd = $currentYear->copy()->endOfYear();
                if ($yearEnd->gt($end)) {
                    $yearEnd = $end->copy();
                }
                $actualStart = $currentYear->lt($start) ? $start->copy() : $currentYear->copy();
                $labels[] = $currentYear->format('Y');
                $values[] = (float) Quotation::whereBetween('created_at', [$actualStart, $yearEnd])->sum('total_amount');
                $currentYear->addYear();
            }
        }

        return [
            'labels' => $labels,
            'values' => $values,
        ];
    }

    protected function getTopSellingTiles(): array
    {
        return QuotationItem::query()
            ->where('item_type', 'tile')
            ->whereNotNull('tile_id')
            ->selectRaw('tile_id, SUM(subtotal) as total_sales')
            ->groupBy('tile_id')
            ->orderByDesc('total_sales')
            ->limit(10)
            ->with('tile.brand', 'tile.size')
            ->get()
            ->map(function ($item) {
                $tile = $item->tile;

                return [
                    'tile_id' => $item->tile_id,
                    'tile_code' => $tile?->tile_code ?? 'N/A',
                    'image' => $tile?->image,
                    'brand_name' => $tile?->brand?->brand_name ?? null,
                    'size' => $tile?->size?->size_in_inches ?? null,
                    'total_sales' => (float) $item->total_sales,
                ];
            })
            ->filter(fn ($t) => $t['tile_code'] !== 'N/A' || $t['tile_id'])
            ->values()
            ->toArray();
    }
}
