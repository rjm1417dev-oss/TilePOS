<?php

namespace App\Http\Controllers;

use App\Models\AccountsPayable;
use App\Models\AccountsReceivable;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Stock;
use App\Models\Tile;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        if (! Auth::user()->can('reports.view')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        return Inertia::render('reports/index');
    }

    public function profitLoss(Request $request): Response|RedirectResponse
    {
        if (! Auth::user()->can('reports.view')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $period = $request->string('period', 'monthly')->toString();
        $months = (int) $request->integer('months', 12);

        $data = $this->buildProfitLossData($tenantId, $period, $months);

        return Inertia::render('reports/profit-loss', [
            'data' => $data,
            'filters' => ['period' => $period, 'months' => $months],
        ]);
    }

    public function payablesAging(Request $request): Response|RedirectResponse
    {
        if (! Auth::user()->can('reports.view')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $data = AccountsPayable::query()
            ->where('remaining_amount', '>', 0)
            ->with(['tile', 'stock.supplier'])
            ->get()
            ->groupBy(function ($ap) {
                $days = Carbon::parse($ap->created_at)->diffInDays(now(), false);
                if ($days <= 30) {
                    return '0-30';
                }
                if ($days <= 60) {
                    return '31-60';
                }
                if ($days <= 90) {
                    return '61-90';
                }

                return '90+';
            });

        $buckets = ['0-30' => 0, '31-60' => 0, '61-90' => 0, '90+' => 0];
        foreach ($data as $bucket => $items) {
            $buckets[$bucket] = $items->sum('remaining_amount');
        }

        return Inertia::render('reports/payables-aging', [
            'buckets' => $buckets,
            'items' => $data->map(fn ($items) => $items->map(fn ($ap) => [
                'id' => $ap->id,
                'stock_reference' => $ap->stock_reference,
                'tile_code' => $ap->tile?->tile_code,
                'supplier' => $ap->stock?->supplier?->supplier_name,
                'purchased_price' => (float) $ap->purchased_price,
                'remaining_amount' => (float) $ap->remaining_amount,
                'created_at' => $ap->created_at->toIso8601String(),
                'days_overdue' => Carbon::parse($ap->created_at)->diffInDays(now(), false),
            ])->values()->toArray())->toArray(),
        ]);
    }

    public function receivablesAging(Request $request): Response|RedirectResponse
    {
        if (! Auth::user()->can('reports.view')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $items = AccountsReceivable::query()
            ->where('remaining_amount', '>', 0)
            ->with(['quotation', 'tile'])
            ->get();

        $data = $items->groupBy(function ($ar) {
            $dueDate = $ar->quotation?->due_date ?? $ar->created_at;
            $days = Carbon::parse($dueDate)->diffInDays(now(), false);
            if ($days <= 30) {
                return '0-30';
            }
            if ($days <= 60) {
                return '31-60';
            }
            if ($days <= 90) {
                return '61-90';
            }

            return '90+';
        });

        $buckets = ['0-30' => 0, '31-60' => 0, '61-90' => 0, '90+' => 0];
        foreach ($data as $bucket => $recs) {
            $buckets[$bucket] = $recs->sum('remaining_amount');
        }

        return Inertia::render('reports/receivables-aging', [
            'buckets' => $buckets,
            'items' => $data->map(fn ($recs) => $recs->map(fn ($ar) => [
                'id' => $ar->id,
                'customer_name' => $ar->customer_name,
                'quotation_number' => $ar->quotation?->quotation_number,
                'total_amount' => (float) $ar->total_amount,
                'remaining_amount' => (float) $ar->remaining_amount,
                'due_date' => $ar->quotation?->due_date?->toIso8601String(),
                'days_overdue' => $ar->quotation?->due_date
                    ? Carbon::parse($ar->quotation->due_date)->diffInDays(now(), false)
                    : 0,
            ])->values()->toArray())->toArray(),
        ]);
    }

    public function salesByProduct(Request $request): Response|RedirectResponse
    {
        if (! Auth::user()->can('reports.view')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $months = (int) $request->integer('months', 12);
        $from = now()->subMonths($months);

        $data = QuotationItem::query()
            ->whereHas('quotation', fn ($q) => $q->where('type', 'invoice')->where('invoice_date', '>=', $from))
            ->select('item_type', 'tile_id', 'product_id', 'item_name')
            ->selectRaw('SUM(subtotal) as total, SUM(quantity) as qty')
            ->groupBy('item_type', 'tile_id', 'product_id', 'item_name')
            ->orderByDesc('total')
            ->limit(50)
            ->get()
            ->map(function ($row) {
                $name = $row->item_name;
                if ($row->item_type === 'tile' && $row->tile_id) {
                    $tile = Tile::withoutGlobalScopes()->find($row->tile_id);
                    $name = $tile?->tile_code ?? $row->item_name;
                }
                if ($row->item_type === 'product' && $row->product_id) {
                    $product = Product::withoutGlobalScopes()->find($row->product_id);
                    $name = $product?->product_name ?? $row->item_name;
                }

                return [
                    'name' => $name,
                    'type' => $row->item_type,
                    'total' => (float) $row->total,
                    'quantity' => (float) $row->qty,
                ];
            });

        return Inertia::render('reports/sales-by-product', [
            'data' => $data,
            'filters' => ['months' => $months],
        ]);
    }

    public function salesByBrand(Request $request): Response|RedirectResponse
    {
        if (! Auth::user()->can('reports.view')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $months = (int) $request->integer('months', 12);
        $from = now()->subMonths($months);

        $tileSales = QuotationItem::query()
            ->where('item_type', 'tile')
            ->whereHas('quotation', fn ($q) => $q->where('type', 'invoice')->where('invoice_date', '>=', $from))
            ->whereNotNull('tile_id')
            ->with('tile.brand')
            ->get()
            ->groupBy(fn ($q) => $q->tile?->brand_id ?? 0)
            ->map(fn ($items, $brandId) => [
                'brand_id' => (int) $brandId,
                'brand_name' => $items->first()?->tile?->brand?->brand_name ?? 'Unknown',
                'total' => $items->sum('subtotal'),
                'quantity' => $items->sum('quantity'),
            ])
            ->sortByDesc('total')
            ->values();

        $productSales = QuotationItem::query()
            ->where('item_type', 'product')
            ->whereHas('quotation', fn ($q) => $q->where('type', 'invoice')->where('invoice_date', '>=', $from))
            ->whereNotNull('product_id')
            ->with('product.brand')
            ->get()
            ->groupBy(fn ($q) => $q->product?->brand_id ?? 0)
            ->map(fn ($items, $brandId) => [
                'brand_id' => (int) $brandId,
                'brand_name' => $items->first()?->product?->brand?->brand_name ?? 'Unknown',
                'total' => $items->sum('subtotal'),
                'quantity' => $items->sum('quantity'),
            ])
            ->sortByDesc('total')
            ->values();

        $combined = collect([...$tileSales, ...$productSales])
            ->groupBy('brand_name')
            ->map(fn ($items) => [
                'brand_name' => $items->first()['brand_name'],
                'total' => $items->sum('total'),
                'quantity' => $items->sum('quantity'),
            ])
            ->sortByDesc('total')
            ->values();

        return Inertia::render('reports/sales-by-brand', [
            'data' => $combined,
            'filters' => ['months' => $months],
        ]);
    }

    public function salesByCustomer(Request $request): Response|RedirectResponse
    {
        if (! Auth::user()->can('reports.view')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $months = (int) $request->integer('months', 12);
        $from = now()->subMonths($months);

        $data = Quotation::query()
            ->where('type', 'invoice')
            ->where('invoice_date', '>=', $from)
            ->select('customer_id', 'customer_name')
            ->selectRaw('COALESCE(SUM(paid_amount), 0) as total_paid, COALESCE(SUM(total_amount), 0) as total_amount, COUNT(*) as order_count')
            ->groupBy('customer_id', 'customer_name')
            ->orderByDesc('total_amount')
            ->limit(50)
            ->get()
            ->map(fn ($row) => [
                'customer_id' => $row->customer_id,
                'customer_name' => $row->customer_name ?? 'Walk-in',
                'total_amount' => (float) $row->total_amount,
                'total_paid' => (float) $row->total_paid,
                'order_count' => (int) $row->order_count,
            ]);

        return Inertia::render('reports/sales-by-customer', [
            'data' => $data,
            'filters' => ['months' => $months],
        ]);
    }

    public function stockValuation(Request $request): Response|RedirectResponse
    {
        if (! Auth::user()->can('reports.view')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $items = Stock::query()
            ->with(['tile.brand', 'tile.size', 'supplier'])
            ->where('in_stock', '>', 0)
            ->get()
            ->map(function ($s) {
                $tile = $s->tile;
                $costPerBox = $tile ? (float) ($tile->cost_per_m2 ?? 0) * (float) ($tile->packing_m2 ?? 1) : 0;
                $valuation = $s->in_stock * $costPerBox;

                return [
                    'id' => $s->id,
                    'tile_code' => $tile?->tile_code,
                    'brand' => $tile?->brand?->brand_name,
                    'in_stock' => $s->in_stock,
                    'cost_per_box' => $costPerBox,
                    'valuation' => $valuation,
                ];
            });

        $total = $items->sum('valuation');

        return Inertia::render('reports/stock-valuation', [
            'items' => $items,
            'total' => $total,
        ]);
    }

    protected function buildProfitLossData(int $tenantId, string $period, int $months): array
    {
        $from = now()->subMonths($months);

        $format = in_array($period, ['monthly', 'daily'], true) ? ($period === 'monthly' ? '%Y-%m' : '%Y-%m-%d') : '%Y-%m';
        $revenueQuery = Quotation::query()
            ->where('type', 'invoice')
            ->where('invoice_date', '>=', $from)
            ->selectRaw('DATE_FORMAT(invoice_date, ?) as period', [$format])
            ->selectRaw('COALESCE(SUM(paid_amount), 0) as amount')
            ->groupBy('period')
            ->orderBy('period');

        $revenue = $revenueQuery->pluck('amount', 'period')->map(fn ($v) => (float) $v)->toArray();

        if ($period === 'monthly') {
            $labels = collect();
            for ($i = $months - 1; $i >= 0; $i--) {
                $labels->push(now()->subMonths($i)->format('Y-m'));
            }
        } else {
            $labels = collect();
            for ($i = min(31, $months * 30); $i >= 0; $i--) {
                $labels->push(now()->subDays($i)->format('Y-m-d'));
            }
        }

        return [
            'labels' => $labels->toArray(),
            'revenue' => $labels->map(fn ($l) => (float) ($revenue[$l] ?? 0))->toArray(),
        ];
    }
}
