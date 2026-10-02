<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountsReceivableStoreRequest;
use App\Http\Requests\AccountsReceivableUpdateRequest;
use App\Models\AccountsReceivable;
use App\Models\Tile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountsReceivableController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AccountsReceivable::class);

        $receivables = AccountsReceivable::query()
            ->with('tile')
            ->when($request->search, fn ($q) => $q->where('customer_name', 'like', "%{$request->search}%")
                ->orWhere('customer_phone', 'like', "%{$request->search}%")
                ->orWhere('tile_code_display', 'like', "%{$request->search}%")
                ->orWhereHas('tile', fn ($t) => $t->where('tile_code', 'like', "%{$request->search}%")))
            ->when($request->tile_id, fn ($q) => $q->where('tile_id', $request->tile_id))
            ->when($request->payment_status === 'pending', fn ($q) => $q->whereRaw('remaining_amount > 0 AND paid_amount < (total_amount / 2)'))
            ->when($request->payment_status === 'partial', fn ($q) => $q->whereRaw('remaining_amount > 0 AND paid_amount >= (total_amount / 2)'))
            ->when($request->payment_status === 'completed', fn ($q) => $q->where('remaining_amount', '<=', 0))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        $tiles = Tile::orderBy('tile_code')->get(['id', 'tile_code']);

        return Inertia::render('accounts-receivables/index', [
            'receivables' => $receivables,
            'tiles' => $tiles,
            'filters' => $request->only(['search', 'tile_id', 'payment_status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', AccountsReceivable::class);

        $tiles = Tile::with(['brand', 'size'])
            ->orderBy('tile_code')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'tile_code' => $t->tile_code,
                'label' => ($t->tile_code ?? '').' - '.($t->brand?->brand_name ?? '').' ('.($t->size?->size_in_inches ?? '').')',
            ]);

        return Inertia::render('accounts-receivables/create', [
            'tiles' => $tiles,
        ]);
    }

    public function store(AccountsReceivableStoreRequest $request): RedirectResponse
    {
        $this->authorize('create', AccountsReceivable::class);

        $data = $request->validated();
        $data['remaining_amount'] = max((float) $data['total_amount'] - (float) $data['paid_amount'], 0);

        AccountsReceivable::create($data);

        return redirect()->route('accounts-receivables.index')
            ->with('success', 'Accounts receivable created successfully.');
    }

    public function edit(AccountsReceivable $accountsReceivable): Response
    {
        $this->authorize('update', $accountsReceivable);

        $accountsReceivable->load('tile');
        $tiles = Tile::with(['brand', 'size'])
            ->orderBy('tile_code')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'tile_code' => $t->tile_code,
                'label' => ($t->tile_code ?? '').' - '.($t->brand?->brand_name ?? '').' ('.($t->size?->size_in_inches ?? '').')',
            ]);

        return Inertia::render('accounts-receivables/edit', [
            'receivable' => $accountsReceivable,
            'tiles' => $tiles,
        ]);
    }

    public function update(AccountsReceivableUpdateRequest $request, AccountsReceivable $accountsReceivable): RedirectResponse
    {
        $this->authorize('update', $accountsReceivable);

        $data = $request->validated();
        $data['remaining_amount'] = max((float) $data['total_amount'] - (float) $data['paid_amount'], 0);

        $accountsReceivable->update($data);

        return redirect()->route('accounts-receivables.index')
            ->with('success', 'Accounts receivable updated successfully.');
    }

    public function destroy(AccountsReceivable $accountsReceivable): RedirectResponse
    {
        $this->authorize('delete', $accountsReceivable);

        $accountsReceivable->delete();

        return redirect()->route('accounts-receivables.index')
            ->with('success', 'Accounts receivable deleted successfully.');
    }
}
