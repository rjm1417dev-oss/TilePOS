<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockStoreRequest;
use App\Http\Requests\StockUpdateRequest;
use App\Models\AccountsPayable;
use App\Models\Stock;
use App\Models\Supplier;
use App\Models\Tile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Stock::class);

        $stocks = Stock::query()
            ->with(['tile.brand', 'tile.size', 'supplier'])
            ->when($request->search, fn ($q) => $q->where('stock_reference', 'like', "%{$request->search}%")
                ->orWhere('stock_location', 'like', "%{$request->search}%")
                ->orWhereHas('tile', fn ($t) => $t->where('tile_code', 'like', "%{$request->search}%"))
                ->orWhereHas('supplier', fn ($s) => $s->where('supplier_name', 'like', "%{$request->search}%")))
            ->when($request->tile_id, fn ($q) => $q->where('tile_id', $request->tile_id))
            ->when($request->stock_status === 'low_stock', fn ($q) => $q->whereRaw('in_stock <= minimum_stock_level')->where('in_stock', '>', 0))
            ->when($request->stock_status === 'out_of_stock', fn ($q) => $q->where('in_stock', '<=', 0))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        $tiles = Tile::with(['brand', 'size'])
            ->orderBy('tile_code')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'tile_code' => $t->tile_code,
                'label' => ($t->tile_code ?? '').' - '.($t->brand?->brand_name ?? '').' ('.($t->size?->size_in_inches ?? '').')',
            ]);

        return Inertia::render('stocks/index', [
            'stocks' => $stocks,
            'tiles' => $tiles,
            'filters' => $request->only(['search', 'tile_id', 'stock_status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Stock::class);

        $tiles = Tile::with(['brand', 'size'])
            ->orderBy('tile_code')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'tile_code' => $t->tile_code,
                'label' => ($t->tile_code ?? '').' - '.($t->brand?->brand_name ?? '').' ('.($t->size?->size_in_inches ?? '').')',
                'price_per_box' => (float) ($t->price_per_box ?? 0),
                'cost_per_m2' => (float) ($t->cost_per_m2 ?? 0),
                'packing_m2' => (float) ($t->packing_m2 ?? 0),
            ]);

        $suppliers = Supplier::orderBy('supplier_name')->get()
            ->map(fn ($s) => ['id' => $s->id, 'supplier_name' => $s->supplier_name, 'label' => $s->supplier_name.($s->cnic ? " ({$s->cnic})" : '')]);

        return Inertia::render('stocks/create', [
            'tiles' => $tiles,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(StockStoreRequest $request): RedirectResponse
    {
        $this->authorize('create', Stock::class);

        $data = $request->validated();
        $newStock = (int) ($data['new_stock'] ?? 0);
        $purchasedPrice = (float) ($data['purchased_price'] ?? 0);
        $paidAmount = (float) ($data['paid_amount'] ?? 0);
        $remainingAmount = max($purchasedPrice - $paidAmount, 0);

        $existingStock = Stock::where('tile_id', $data['tile_id'])->latest()->first();
        $currentStock = $existingStock?->in_stock ?? 0;
        $inStock = $currentStock + $newStock;

        $supplier = Supplier::find($data['supplier_id']);
        $stockReference = $supplier?->supplier_name ?? '';

        $stock = Stock::create([
            'tile_id' => $data['tile_id'],
            'supplier_id' => $data['supplier_id'],
            'in_stock' => $inStock,
            'minimum_stock_level' => $data['minimum_stock_level'],
            'stock_reference' => $stockReference,
            'stock_location' => $data['stock_location'],
        ]);

        if ($newStock > 0 && ($purchasedPrice > 0 || $paidAmount > 0)) {
            AccountsPayable::create([
                'stock_id' => $stock->id,
                'tile_id' => $stock->tile_id,
                'stock_reference' => $stockReference,
                'purchased_price' => $purchasedPrice,
                'paid_amount' => $paidAmount,
                'remaining_amount' => $remainingAmount,
            ]);
        }

        return redirect()->route('stocks.index')
            ->with('success', 'Stock added successfully.');
    }

    public function edit(Stock $stock): Response
    {
        $this->authorize('update', $stock);

        $stock->load(['tile.brand', 'tile.size', 'supplier']);

        $suppliers = Supplier::orderBy('supplier_name')->get()
            ->map(fn ($s) => ['id' => $s->id, 'supplier_name' => $s->supplier_name, 'label' => $s->supplier_name.($s->cnic ? " ({$s->cnic})" : '')]);

        $tile = $stock->tile;
        $pricePerBox = $tile ? (float) ($tile->price_per_box ?? 0) : 0;
        $costPerBox = $pricePerBox > 0
            ? $pricePerBox
            : ($tile && $tile->cost_per_m2 && $tile->packing_m2
                ? (float) $tile->cost_per_m2 * (float) $tile->packing_m2
                : 0);

        return Inertia::render('stocks/edit', [
            'stock' => $stock,
            'suppliers' => $suppliers,
            'cost_per_box' => $costPerBox,
        ]);
    }

    public function update(StockUpdateRequest $request, Stock $stock): RedirectResponse
    {
        $this->authorize('update', $stock);

        $data = $request->validated();
        $newStock = (int) ($data['new_stock'] ?? 0);
        $purchasedPrice = (float) ($data['purchased_price'] ?? 0);
        $paidAmount = (float) ($data['paid_amount'] ?? 0);
        $remainingAmount = max($purchasedPrice - $paidAmount, 0);

        $supplier = Supplier::find($data['supplier_id']);
        $stockReference = $supplier?->supplier_name ?? '';

        $stock->update([
            'in_stock' => $stock->in_stock + $newStock,
            'supplier_id' => $data['supplier_id'],
            'minimum_stock_level' => $data['minimum_stock_level'],
            'stock_reference' => $stockReference,
            'stock_location' => $data['stock_location'],
        ]);

        if ($newStock > 0 && ($purchasedPrice > 0 || $paidAmount > 0)) {
            AccountsPayable::create([
                'stock_id' => $stock->id,
                'tile_id' => $stock->tile_id,
                'stock_reference' => $stockReference,
                'purchased_price' => $purchasedPrice,
                'paid_amount' => $paidAmount,
                'remaining_amount' => $remainingAmount,
            ]);
        }

        return redirect()->route('stocks.index')
            ->with('success', 'Stock updated successfully.');
    }

    public function destroy(Stock $stock): RedirectResponse
    {
        $this->authorize('delete', $stock);

        $stock->delete();

        return redirect()->route('stocks.index')
            ->with('success', 'Stock deleted successfully.');
    }
}
