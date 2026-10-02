<?php

namespace App\Http\Controllers;

use App\Models\AccountsPayable;
use App\Models\AccountsReceivable;
use App\Models\Brand;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\Size;
use App\Models\Stock;
use App\Models\Supplier;
use App\Models\Tile;
use App\Models\TileReturn;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * @return array<string, array{label: string, description: string}>
     */
    protected const EXPORT_TYPES = [
        'products' => ['label' => 'Products', 'description' => 'Products with brand and sale price'],
        'customers' => ['label' => 'Customers', 'description' => 'Customer names, contacts, and addresses'],
        'suppliers' => ['label' => 'Suppliers', 'description' => 'Supplier details and contacts'],
        'quotations' => ['label' => 'Quotations & Invoices', 'description' => 'All quotations and invoices'],
        'tiles' => ['label' => 'Tiles', 'description' => 'Tiles with brand, size, and pricing'],
        'stocks' => ['label' => 'Stock', 'description' => 'Inventory levels and locations'],
        'brands' => ['label' => 'Brands', 'description' => 'Brand catalog'],
        'sizes' => ['label' => 'Sizes', 'description' => 'Size catalog'],
        'accounts-payables' => ['label' => 'Payables', 'description' => 'Outstanding payables'],
        'accounts-receivables' => ['label' => 'Receivables', 'description' => 'Outstanding receivables'],
        'tile-returns' => ['label' => 'Tile Returns', 'description' => 'Returns and exchanges'],
    ];

    public function index(): Response|RedirectResponse
    {
        if (! Auth::user()->can('export.create')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $types = collect(self::EXPORT_TYPES)->map(fn ($config, $key) => [
            'value' => $key,
            'label' => $config['label'],
            'description' => $config['description'],
        ])->values()->all();

        return Inertia::render('export/index', [
            'exportTypes' => $types,
        ]);
    }

    public function download(Request $request): StreamedResponse|RedirectResponse
    {
        if (! Auth::user()->can('export.create')) {
            abort(403);
        }

        $tenantId = Auth::user()->tenant_id;
        if (! $tenantId) {
            return redirect()->route('super-admin.dashboard');
        }

        $type = $request->string('type')->toString();
        if (! array_key_exists($type, self::EXPORT_TYPES)) {
            abort(404, 'Invalid export type');
        }

        $format = $request->string('format', 'csv')->toString();
        if ($format !== 'csv') {
            abort(400, 'Only CSV format is supported');
        }

        $rows = $this->buildExportData($type);

        $filename = "export-{$type}-".now()->format('Y-m-d').'.csv';

        return response()->streamDownload(
            function () use ($rows) {
                $out = fopen('php://output', 'w');
                if (! empty($rows)) {
                    fputcsv($out, array_keys($rows[0]));
                    foreach ($rows as $row) {
                        fputcsv($out, array_map(fn ($v) => $v ?? '', $row));
                    }
                } else {
                    fputcsv($out, ['(no records)']);
                }
                fclose($out);
            },
            $filename,
            [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            ]
        );
    }

    /**
     * @return list<array<string, string|int|float|null>>
     */
    protected function buildExportData(string $type): array
    {
        return match ($type) {
            'products' => $this->exportProducts(),
            'customers' => $this->exportCustomers(),
            'suppliers' => $this->exportSuppliers(),
            'quotations' => $this->exportQuotations(),
            'tiles' => $this->exportTiles(),
            'stocks' => $this->exportStocks(),
            'brands' => $this->exportBrands(),
            'sizes' => $this->exportSizes(),
            'accounts-payables' => $this->exportAccountsPayables(),
            'accounts-receivables' => $this->exportAccountsReceivables(),
            'tile-returns' => $this->exportTileReturns(),
            default => [],
        };
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportProducts(): array
    {
        return Product::query()
            ->with('brand')
            ->get()
            ->map(fn ($p) => [
                'product_name' => $p->product_name,
                'brand_name' => $p->brand?->brand_name,
                'sale_price' => $p->sale_price,
            ])
            ->toArray();
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportCustomers(): array
    {
        return Customer::query()
            ->get()
            ->map(fn ($c) => [
                'name' => $c->name,
                'phone' => $c->phone,
                'cnic' => $c->cnic,
                'address' => $c->address,
                'notes' => $c->notes,
            ])
            ->toArray();
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportSuppliers(): array
    {
        return Supplier::query()
            ->get()
            ->map(fn ($s) => [
                'supplier_name' => $s->supplier_name,
                'contact_person' => $s->contact_person,
                'phone' => $s->phone,
                'alternate_phone' => $s->alternate_phone,
                'cnic' => $s->cnic,
            ])
            ->toArray();
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportQuotations(): array
    {
        return Quotation::query()
            ->orderBy('invoice_date', 'desc')
            ->get()
            ->map(fn ($q) => [
                'quotation_number' => $q->quotation_number,
                'type' => $q->type,
                'customer_name' => $q->customer_name,
                'customer_phone' => $q->customer_phone,
                'invoice_date' => $q->invoice_date?->format('Y-m-d'),
                'due_date' => $q->due_date?->format('Y-m-d'),
                'total_amount' => $q->total_amount,
                'paid_amount' => $q->paid_amount,
                'remaining_amount' => $q->remaining_amount,
                'payment_method' => $q->payment_method,
                'notes' => $q->notes,
                'created_at' => $q->created_at?->toIso8601String(),
            ])
            ->toArray();
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportTiles(): array
    {
        return Tile::query()
            ->with(['brand', 'size'])
            ->get()
            ->map(fn ($t) => [
                'tile_code' => $t->tile_code,
                'brand_name' => $t->brand?->brand_name,
                'size_in_inches' => $t->size?->size_in_inches,
                'packing_m2' => $t->packing_m2,
                'cost_per_m2' => $t->cost_per_m2,
                'price_per_box' => $t->price_per_box,
                'no_of_tiles_per_box' => $t->no_of_tiles_per_box,
            ])
            ->toArray();
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportStocks(): array
    {
        return Stock::query()
            ->with(['tile', 'supplier'])
            ->get()
            ->map(fn ($s) => [
                'tile_code' => $s->tile?->tile_code,
                'supplier_name' => $s->supplier?->supplier_name,
                'in_stock' => $s->in_stock,
                'minimum_stock_level' => $s->minimum_stock_level,
                'stock_reference' => $s->stock_reference,
                'stock_location' => $s->stock_location,
            ])
            ->toArray();
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportBrands(): array
    {
        return Brand::query()
            ->get()
            ->map(fn ($b) => [
                'brand_name' => $b->brand_name,
                'brand_description' => $b->brand_description,
            ])
            ->toArray();
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportSizes(): array
    {
        return Size::query()
            ->get()
            ->map(fn ($s) => [
                'size_in_inches' => $s->size_in_inches,
                'description' => $s->description,
            ])
            ->toArray();
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportAccountsPayables(): array
    {
        return AccountsPayable::query()
            ->with(['tile', 'stock.supplier'])
            ->get()
            ->map(fn ($ap) => [
                'stock_reference' => $ap->stock_reference,
                'tile_code' => $ap->tile?->tile_code,
                'supplier_name' => $ap->stock?->supplier?->supplier_name,
                'purchased_price' => $ap->purchased_price,
                'paid_amount' => $ap->paid_amount,
                'remaining_amount' => $ap->remaining_amount,
                'created_at' => $ap->created_at?->toIso8601String(),
            ])
            ->toArray();
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportAccountsReceivables(): array
    {
        return AccountsReceivable::query()
            ->with('quotation')
            ->get()
            ->map(fn ($ar) => [
                'customer_name' => $ar->customer_name,
                'quotation_number' => $ar->quotation?->quotation_number,
                'total_amount' => $ar->total_amount,
                'paid_amount' => $ar->paid_amount,
                'remaining_amount' => $ar->remaining_amount,
                'due_date' => $ar->quotation?->due_date?->format('Y-m-d'),
                'created_at' => $ar->created_at?->toIso8601String(),
            ])
            ->toArray();
    }

    /** @return list<array<string, string|int|float|null>> */
    protected function exportTileReturns(): array
    {
        return TileReturn::query()
            ->with(['customer', 'returnTile', 'exchangeTile'])
            ->get()
            ->map(fn ($tr) => [
                'receipt_number' => $tr->receipt_number,
                'type' => $tr->type,
                'customer_name' => $tr->customer?->name,
                'return_tile_code' => $tr->returnTile?->tile_code,
                'return_boxes' => $tr->return_no_of_boxes,
                'return_tiles' => $tr->return_no_of_tiles,
                'return_amount' => $tr->return_total_amount,
                'exchange_tile_code' => $tr->exchangeTile?->tile_code,
                'exchange_boxes' => $tr->exchange_no_of_boxes,
                'exchange_tiles' => $tr->exchange_no_of_tiles,
                'exchange_amount' => $tr->exchange_total_amount,
                'payment_difference' => $tr->payment_difference,
                'payment_status' => $tr->payment_status,
                'created_at' => $tr->created_at?->toIso8601String(),
            ])
            ->toArray();
    }
}
