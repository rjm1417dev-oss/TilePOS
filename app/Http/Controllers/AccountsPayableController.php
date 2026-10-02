<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountsPayableStoreRequest;
use App\Http\Requests\AccountsPayableUpdateRequest;
use App\Models\AccountsPayable;
use App\Models\Tile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountsPayableController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AccountsPayable::class);

        $payables = AccountsPayable::query()
            ->with('tile')
            ->when($request->search, fn ($q) => $q->where('stock_reference', 'like', "%{$request->search}%")
                ->orWhereHas('tile', fn ($t) => $t->where('tile_code', 'like', "%{$request->search}%")))
            ->when($request->tile_id, fn ($q) => $q->where('tile_id', $request->tile_id))
            ->when($request->payment_status === 'pending', fn ($q) => $q->whereRaw('remaining_amount > 0 AND paid_amount < (purchased_price / 2)'))
            ->when($request->payment_status === 'partial', fn ($q) => $q->whereRaw('remaining_amount > 0 AND paid_amount >= (purchased_price / 2)'))
            ->when($request->payment_status === 'completed', fn ($q) => $q->where('remaining_amount', '<=', 0))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        $tiles = Tile::orderBy('tile_code')->get(['id', 'tile_code']);

        return Inertia::render('accounts-payables/index', [
            'payables' => $payables,
            'tiles' => $tiles,
            'filters' => $request->only(['search', 'tile_id', 'payment_status']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', AccountsPayable::class);

        $tiles = Tile::with(['brand', 'size'])
            ->orderBy('tile_code')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'tile_code' => $t->tile_code,
                'label' => ($t->tile_code ?? '').' - '.($t->brand?->brand_name ?? '').' ('.($t->size?->size_in_inches ?? '').')',
            ]);

        return Inertia::render('accounts-payables/create', [
            'tiles' => $tiles,
        ]);
    }

    public function store(AccountsPayableStoreRequest $request): RedirectResponse
    {
        $this->authorize('create', AccountsPayable::class);

        $data = $request->validated();
        $data['remaining_amount'] = max((float) $data['purchased_price'] - (float) $data['paid_amount'], 0);

        AccountsPayable::create($data);

        return redirect()->route('accounts-payables.index')
            ->with('success', 'Accounts payable created successfully.');
    }

    public function edit(AccountsPayable $accountsPayable): Response
    {
        $this->authorize('update', $accountsPayable);

        $accountsPayable->load('tile');
        $tiles = Tile::with(['brand', 'size'])
            ->orderBy('tile_code')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'tile_code' => $t->tile_code,
                'label' => ($t->tile_code ?? '').' - '.($t->brand?->brand_name ?? '').' ('.($t->size?->size_in_inches ?? '').')',
            ]);

        return Inertia::render('accounts-payables/edit', [
            'payable' => $accountsPayable,
            'tiles' => $tiles,
        ]);
    }

    public function update(AccountsPayableUpdateRequest $request, AccountsPayable $accountsPayable): RedirectResponse
    {
        $this->authorize('update', $accountsPayable);

        $data = $request->validated();
        $data['remaining_amount'] = max((float) $data['purchased_price'] - (float) $data['paid_amount'], 0);

        $accountsPayable->update($data);

        return redirect()->route('accounts-payables.index')
            ->with('success', 'Accounts payable updated successfully.');
    }

    public function destroy(AccountsPayable $accountsPayable): RedirectResponse
    {
        $this->authorize('delete', $accountsPayable);

        $accountsPayable->delete();

        return redirect()->route('accounts-payables.index')
            ->with('success', 'Accounts payable deleted successfully.');
    }
}
