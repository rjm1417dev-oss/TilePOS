<?php

namespace App\Http\Controllers;

use App\Jobs\SendQuotationSentJob;
use App\Models\AccountsReceivable;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Stock;
use App\Models\Tile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class QuotationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Quotation::class);

        $query = Quotation::with(['customer', 'items.tile', 'items.product']);

        if ($request->type && in_array($request->type, ['quotation', 'invoice'])) {
            $query->where('type', $request->type);
        }

        $items = $query
            ->when($request->search, fn ($q) => $q->where('quotation_number', 'like', "%{$request->search}%")
                ->orWhere('customer_name', 'like', "%{$request->search}%")
                ->orWhere('customer_phone', 'like', "%{$request->search}%"))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('order-quotation/index', [
            'items' => $items,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Quotation::class);

        $tiles = Tile::with(['brand', 'size'])
            ->withSum('stocks as available_boxes', 'in_stock')
            ->get();
        $products = Product::with('brand')->get();
        $customers = Customer::orderBy('name')->get();

        return Inertia::render('order-quotation/create', [
            'tiles' => $tiles,
            'products' => $products,
            'customers' => $customers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Quotation::class);

        $validated = $request->validate([
            'type' => ['required', 'in:quotation,invoice'],
            'customer_id' => ['nullable', 'exists:customers,id'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'customer_address' => ['nullable', 'string'],
            'customer_cnic' => ['nullable', 'string', 'max:20'],
            'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_type' => ['required', 'in:tile,product'],
            'items.*.tile_id' => ['nullable', 'required_if:items.*.item_type,tile', 'exists:tiles,id'],
            'items.*.product_id' => ['nullable', 'required_if:items.*.item_type,product', 'exists:products,id'],
            'items.*.item_name' => ['required', 'string'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.subtotal' => ['required', 'numeric', 'min:0'],
            'items.*.boxes_required' => ['nullable', 'integer', 'min:0'],
            'items.*.loose_tiles' => ['nullable', 'integer', 'min:0'],
            'items.*.room_type' => ['nullable', 'string', 'max:100'],
            'items.*.surface_type' => ['nullable', 'string', 'max:100'],
            'items.*.total_area' => ['nullable', 'numeric', 'min:0'],
        ]);

        $type = $validated['type'];
        $items = $validated['items'];

        if ($type === 'invoice') {
            foreach ($items as $index => $item) {
                if (($item['item_type'] ?? '') === 'tile' && isset($item['tile_id'])) {
                    $boxesRequired = (int) ($item['boxes_required'] ?? 0);
                    if ($boxesRequired > 0) {
                        $available = Stock::where('tile_id', $item['tile_id'])->sum('in_stock');
                        if ($available < $boxesRequired) {
                            return redirect()->back()
                                ->withInput()
                                ->withErrors([
                                    'items' => "Insufficient stock for \"{$item['item_name']}\". Required: {$boxesRequired} boxes, available: {$available} boxes.",
                                ]);
                        }
                    }
                }
            }
        }

        $subtotal = collect($items)->sum('subtotal');
        $discountPct = (float) ($validated['discount_percentage'] ?? 0);
        $discountAmt = (float) ($validated['discount_amount'] ?? 0);
        $taxPct = (float) ($validated['tax_percentage'] ?? 0);

        $afterDiscount = $subtotal - $discountAmt - ($subtotal * $discountPct / 100);
        $taxAmt = $afterDiscount * $taxPct / 100;
        $totalAmount = $afterDiscount + $taxAmt;
        $paidAmount = (float) ($validated['paid_amount'] ?? 0);
        $remainingAmount = $totalAmount - $paidAmount;

        $quotation = DB::transaction(function () use ($validated, $type, $items, $discountPct, $discountAmt, $taxPct, $taxAmt, $totalAmount, $paidAmount, $remainingAmount) {
            $tenantId = Auth::user()?->tenant_id;
            $customerId = $validated['customer_id'] ?? null;
            $customerName = $validated['customer_name'] ?? null;

            if ($customerName && trim($customerName) !== '') {
                if ($customerId) {
                    $customer = Customer::withoutGlobalScopes()
                        ->where('tenant_id', $tenantId)
                        ->find($customerId);
                    if ($customer) {
                        $customer->update([
                            'name' => trim($customerName),
                            'phone' => $validated['customer_phone'] ?? null,
                            'address' => $validated['customer_address'] ?? null,
                            'cnic' => $validated['customer_cnic'] ?? null,
                        ]);
                    }
                } else {
                    $customer = Customer::create([
                        'tenant_id' => $tenantId,
                        'name' => trim($customerName),
                        'phone' => $validated['customer_phone'] ?? null,
                        'address' => $validated['customer_address'] ?? null,
                        'cnic' => $validated['customer_cnic'] ?? null,
                    ]);
                    $customerId = $customer->id;
                }
            }

            $quotation = Quotation::create([
                'tenant_id' => $tenantId,
                'type' => $type,
                'items_count' => count($items),
                'customer_id' => $customerId,
                'customer_name' => $customerName ?? null,
                'customer_phone' => $validated['customer_phone'] ?? null,
                'customer_address' => $validated['customer_address'] ?? null,
                'customer_cnic' => $validated['customer_cnic'] ?? null,
                'discount_percentage' => $discountPct,
                'discount_amount' => $discountAmt,
                'tax_percentage' => $taxPct,
                'tax_amount' => $taxAmt,
                'total_amount' => $totalAmount,
                'paid_amount' => $paidAmount,
                'remaining_amount' => $remainingAmount,
                'notes' => $validated['notes'] ?? null,
                'invoice_date' => now(),
                'due_date' => now()->addDays(30),
            ]);

            foreach ($items as $index => $item) {
                QuotationItem::create([
                    'tenant_id' => $quotation->tenant_id,
                    'quotation_id' => $quotation->id,
                    'item_type' => $item['item_type'],
                    'tile_id' => $item['item_type'] === 'tile' ? $item['tile_id'] : null,
                    'product_id' => $item['item_type'] === 'product' ? $item['product_id'] : null,
                    'item_name' => $item['item_name'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['subtotal'],
                    'boxes_required' => $item['boxes_required'] ?? null,
                    'loose_tiles' => $item['loose_tiles'] ?? 0,
                    'room_type' => $item['room_type'] ?? null,
                    'surface_type' => $item['surface_type'] ?? null,
                    'total_area' => $item['total_area'] ?? null,
                    'sort_order' => $index,
                ]);
            }

            if ($type === 'invoice') {
                foreach ($items as $item) {
                    if ($item['item_type'] === 'tile' && isset($item['tile_id'])) {
                        $boxes = (int) ($item['boxes_required'] ?? 0);
                        $loose = (int) ($item['loose_tiles'] ?? 0);
                        if ($boxes > 0 || $loose > 0) {
                            $stocks = Stock::where('tile_id', $item['tile_id'])->get();
                            $tile = Tile::find($item['tile_id']);
                            $tilesPerBox = $tile?->no_of_tiles_per_box ?? 0;
                            $tilesToDeduct = $boxes * $tilesPerBox + $loose;
                            foreach ($stocks as $stock) {
                                $deduct = min($tilesToDeduct, $stock->in_stock);
                                if ($deduct > 0) {
                                    $stock->decrement('in_stock', $deduct);
                                    $tilesToDeduct -= $deduct;
                                }
                                if ($tilesToDeduct <= 0) {
                                    break;
                                }
                            }
                        }
                    }
                }

                if ($remainingAmount > 0) {
                    AccountsReceivable::create([
                        'tenant_id' => $quotation->tenant_id,
                        'quotation_id' => $quotation->id,
                        'customer_name' => $quotation->customer_name,
                        'customer_phone' => $quotation->customer_phone,
                        'total_amount' => $quotation->total_amount,
                        'paid_amount' => $quotation->paid_amount,
                        'remaining_amount' => $quotation->remaining_amount,
                    ]);
                }
            }

            return $quotation;
        });

        SendQuotationSentJob::dispatch($quotation->id);

        return redirect()->route('quotations.show', $quotation)
            ->with('success', $type === 'invoice' ? 'Order created successfully.' : 'Quotation created successfully.');
    }

    public function show(Quotation $quotation): Response
    {
        $this->authorize('view', $quotation);

        $quotation->load(['customer', 'items.tile.brand', 'items.tile.size', 'items.product.brand']);

        return Inertia::render('order-quotation/show', [
            'quotation' => $quotation,
        ]);
    }
}
