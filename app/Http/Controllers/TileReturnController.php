<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\QuotationItem;
use App\Models\Stock;
use App\Models\Tile;
use App\Models\TileReturn;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TileReturnController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', \App\Models\TileReturn::class);

        $returns = TileReturn::query()
            ->with(['customer', 'returnTile', 'exchangeTile'])
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->search, fn ($q) => $q->where(function ($query) use ($request) {
                $query->where('receipt_number', 'like', "%{$request->search}%")
                    ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$request->search}%"));
            }))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('tile-returns/index', [
            'returns' => $returns,
            'filters' => $request->only(['type', 'search']),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', \App\Models\TileReturn::class);

        $customers = Customer::orderBy('name')->get(['id', 'name']);
        $tiles = Tile::with(['brand', 'size'])->orderBy('tile_code')->get();

        $customerTileIds = [];
        if ($request->filled('customer_id')) {
            $customerTileIds = $this->getCustomerTileIds((int) $request->customer_id);
        }

        return Inertia::render('tile-returns/create', [
            'customers' => $customers,
            'tiles' => $tiles,
            'customerTileIds' => $customerTileIds,
            'customerId' => $request->customer_id,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', \App\Models\TileReturn::class);

        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'type' => ['required', 'in:return,exchange'],
            'return_tile_id' => ['required', 'exists:tiles,id'],
            'return_no_of_boxes' => ['nullable', 'integer', 'min:0'],
            'return_no_of_tiles' => ['nullable', 'integer', 'min:0'],
            'return_payment_method' => ['required', 'string', 'in:Cash,Card,Bank Transfer,Cheque'],
            'return_notes' => ['nullable', 'string'],
            'exchange_tile_id' => ['nullable', 'required_if:type,exchange', 'exists:tiles,id'],
            'exchange_no_of_boxes' => ['nullable', 'integer', 'min:0'],
            'exchange_no_of_tiles' => ['nullable', 'integer', 'min:0'],
            'payment_status' => ['nullable', 'required_if:type,exchange', 'in:paid_by_customer,refund_to_customer,no_difference'],
            'exchange_payment_method' => ['nullable', 'required_if:type,exchange', 'string', 'in:Cash,Card,Bank Transfer,Cheque'],
            'exchange_remarks' => ['nullable', 'string'],
        ]);

        $returnBoxes = (int) ($validated['return_no_of_boxes'] ?? 0);
        $returnTiles = (int) ($validated['return_no_of_tiles'] ?? 0);
        $returnTotalAmount = $this->computeReturnAmount(
            (int) $validated['customer_id'],
            (int) $validated['return_tile_id'],
            $returnBoxes,
            $returnTiles
        );

        $data = [
            'tenant_id' => $request->user()->tenant_id,
            'receipt_number' => $this->generateReceiptNumber(),
            'type' => $validated['type'],
            'customer_id' => $validated['customer_id'],
            'return_tile_id' => $validated['return_tile_id'],
            'return_no_of_boxes' => $returnBoxes,
            'return_no_of_tiles' => $returnTiles,
            'return_total_amount' => $returnTotalAmount,
            'return_payment_method' => $validated['return_payment_method'],
            'return_notes' => $validated['return_notes'] ?? null,
        ];

        if ($validated['type'] === 'exchange') {
            $exchangeBoxes = (int) ($validated['exchange_no_of_boxes'] ?? 0);
            $exchangeTiles = (int) ($validated['exchange_no_of_tiles'] ?? 0);
            $exchangeTotalAmount = $this->calculateTileAmount(
                (int) $validated['exchange_tile_id'],
                $exchangeBoxes,
                $exchangeTiles
            );
            $paymentDifference = $exchangeTotalAmount - $returnTotalAmount;

            $data['exchange_tile_id'] = $validated['exchange_tile_id'];
            $data['exchange_no_of_boxes'] = $exchangeBoxes;
            $data['exchange_no_of_tiles'] = $exchangeTiles;
            $data['exchange_total_amount'] = $exchangeTotalAmount;
            $data['payment_difference'] = $paymentDifference;
            $data['payment_status'] = $validated['payment_status'];
            $data['exchange_payment_method'] = $validated['exchange_payment_method'];
            $data['exchange_remarks'] = $validated['exchange_remarks'] ?? null;
        }

        $record = TileReturn::create($data);

        $tenantId = $request->user()->tenant_id;

        if ($record->type === 'exchange' && $record->exchange_tile_id) {
            $this->adjustStockForExchange($record, $tenantId);
        } else {
            $this->adjustStockForReturn(
                $record->return_tile_id,
                $record->return_no_of_boxes,
                $record->return_no_of_tiles,
                'return',
                $record->receipt_number,
                'Tile return recorded.',
                $tenantId
            );
        }

        return redirect()->route('tile-returns.show', $record)
            ->with('success', 'Return processed. Receipt: '.$record->receipt_number);
    }

    public function show(TileReturn $tileReturn): Response
    {
        $this->authorize('view', $tileReturn);

        $tileReturn->load(['customer', 'returnTile.brand', 'returnTile.size', 'exchangeTile.brand', 'exchangeTile.size']);

        return Inertia::render('tile-returns/show', [
            'tileReturn' => $tileReturn,
        ]);
    }

    public function customerTiles(Request $request): \Illuminate\Http\JsonResponse
    {
        $customerId = $request->validate(['customer_id' => 'required|exists:customers,id'])['customer_id'];
        $tileIds = $this->getCustomerTileIds((int) $customerId);

        return response()->json(['tile_ids' => $tileIds]);
    }

    public function calculateReturnAmount(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'return_tile_id' => 'required|exists:tiles,id',
            'return_no_of_boxes' => 'nullable|integer|min:0',
            'return_no_of_tiles' => 'nullable|integer|min:0',
        ]);

        $amount = $this->computeReturnAmount(
            (int) $validated['customer_id'],
            (int) $validated['return_tile_id'],
            (int) ($validated['return_no_of_boxes'] ?? 0),
            (int) ($validated['return_no_of_tiles'] ?? 0)
        );

        return response()->json(['amount' => $amount]);
    }

    private function getCustomerTileIds(int $customerId): array
    {
        return QuotationItem::query()
            ->where('item_type', 'tile')
            ->whereHas('quotation', fn ($q) => $q->where('type', 'invoice')->where('customer_id', $customerId))
            ->whereNotNull('tile_id')
            ->pluck('tile_id')
            ->unique()
            ->values()
            ->all();
    }

    private function getCustomerInvoiceItem(?int $customerId, ?int $tileId): ?QuotationItem
    {
        if (! $customerId || ! $tileId) {
            return null;
        }

        return QuotationItem::query()
            ->where('item_type', 'tile')
            ->where('tile_id', $tileId)
            ->whereHas('quotation', fn ($q) => $q->where('type', 'invoice')->where('customer_id', $customerId))
            ->with('quotation')
            ->latest('quotation_items.id')
            ->first();
    }

    private function computeReturnAmount(int $customerId, int $tileId, int $boxes, int $looseTiles): float
    {
        $invoiceItem = $this->getCustomerInvoiceItem($customerId, $tileId);
        $tile = Tile::find($tileId);

        $pricePerBox = (float) ($invoiceItem?->price_per_box ?? $tile?->price_per_box ?? 0);
        $tilesPerBox = max((int) ($tile?->no_of_tiles_per_box ?? 1), 1);
        $pricePerTile = $tilesPerBox > 0 ? $pricePerBox / $tilesPerBox : 0;

        return round(($boxes * $pricePerBox) + ($looseTiles * $pricePerTile), 2);
    }

    private function calculateTileAmount(?int $tileId, int $boxes, int $looseTiles): float
    {
        if (! $tileId) {
            return 0;
        }

        $tile = Tile::find($tileId);
        if (! $tile) {
            return 0;
        }

        $pricePerBox = (float) ($tile->price_per_box ?? 0);
        $tilesPerBox = max((int) ($tile->no_of_tiles_per_box ?? 1), 1);
        $pricePerTile = $pricePerBox / $tilesPerBox;

        return round(($boxes * $pricePerBox) + ($looseTiles * $pricePerTile), 2);
    }

    private function generateReceiptNumber(): string
    {
        $latest = TileReturn::query()->withoutGlobalScopes()->latest('id')->first();
        $number = $latest ? $latest->id + 1 : 1;

        return 'RT-'.str_pad((string) $number, 6, '0', STR_PAD_LEFT);
    }

    private function adjustStockForExchange(TileReturn $tileReturn, int $tenantId): void
    {
        $this->adjustStockForReturn(
            $tileReturn->return_tile_id,
            $tileReturn->return_no_of_boxes,
            $tileReturn->return_no_of_tiles,
            'exchange-return',
            $tileReturn->receipt_number,
            'Exchange return processed.',
            $tenantId
        );

        $this->adjustStockForIssue(
            $tileReturn->exchange_tile_id,
            (int) ($tileReturn->exchange_no_of_boxes ?? 0),
            (int) ($tileReturn->exchange_no_of_tiles ?? 0),
            $tileReturn->receipt_number,
            $tenantId
        );
    }

    private function adjustStockForReturn(
        int $tileId,
        int $boxes,
        int $looseTiles,
        string $action,
        string $reference,
        string $notes = '',
        ?int $tenantId = null
    ): void {
        $tenantId = $tenantId ?? auth()->user()?->tenant_id;

        $stock = Stock::where('tile_id', $tileId)->first();

        if (! $stock) {
            $stock = Stock::create([
                'tenant_id' => $tenantId,
                'tile_id' => $tileId,
                'in_stock' => 0,
                'minimum_stock_level' => 0,
            ]);
        }

        $tile = Tile::find($tileId);
        $tilePerBox = max($tile?->no_of_tiles_per_box ?? 1, 1);

        $additionalBoxes = intdiv($looseTiles, $tilePerBox);
        $remainingLoose = $looseTiles % $tilePerBox;
        $boxesToAdd = $boxes + $additionalBoxes;

        $before = $stock->in_stock;
        $stock->increment('in_stock', $boxesToAdd);
        $after = $before + $boxesToAdd;

        $stock->logs()->create([
            'tenant_id' => $tenantId,
            'tile_id' => $stock->tile_id,
            'action' => $action,
            'quantity_before' => $before,
            'quantity_change' => $boxesToAdd,
            'quantity_after' => $after,
            'reference' => $reference,
            'notes' => trim($notes.($remainingLoose > 0 ? " (Remaining loose tiles: {$remainingLoose})" : '')),
        ]);
    }

    private function adjustStockForIssue(?int $tileId, int $boxes, int $looseTiles, string $reference, ?int $tenantId = null): void
    {
        if (! $tileId) {
            return;
        }

        $stock = Stock::where('tile_id', $tileId)->first();

        if (! $stock) {
            return;
        }

        $tile = Tile::find($tileId);
        $tilePerBox = max($tile?->no_of_tiles_per_box ?? 1, 1);

        $additionalBoxes = intdiv($looseTiles, $tilePerBox);
        $boxesToRemove = $boxes + $additionalBoxes;

        $before = $stock->in_stock;
        $after = max($before - $boxesToRemove, 0);

        $stock->update(['in_stock' => $after]);

        $tenantId = $tenantId ?? auth()->user()?->tenant_id;
        $stock->logs()->create([
            'tenant_id' => $tenantId,
            'tile_id' => $stock->tile_id,
            'action' => 'exchange-issue',
            'quantity_before' => $before,
            'quantity_change' => -$boxesToRemove,
            'quantity_after' => $after,
            'reference' => $reference,
            'notes' => 'Exchange issued to customer.',
        ]);
    }
}
