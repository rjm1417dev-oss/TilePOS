<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierStoreRequest;
use App\Http\Requests\SupplierUpdateRequest;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    /**
     * Display a listing of suppliers.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Supplier::class);

        $suppliers = Supplier::query()
            ->when($request->search, fn ($q) => $q->where('supplier_name', 'like', "%{$request->search}%")
                ->orWhere('contact_person', 'like', "%{$request->search}%")
                ->orWhere('phone', 'like', "%{$request->search}%")
                ->orWhere('cnic', 'like', "%{$request->search}%"))
            ->orderBy('supplier_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('suppliers/index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Quick-create a supplier (returns JSON for inline use in other forms).
     */
    public function quickStore(Request $request): JsonResponse
    {
        $this->authorize('create', Supplier::class);

        $validated = $request->validate([
            'supplier_name' => ['required', 'string', 'max:255'],
            'contact_person' => ['required', 'string', 'max:255'],
            'cnic' => ['nullable', 'string', 'max:20'],
            'phone' => ['required', 'string', 'max:20'],
            'alternate_phone' => ['nullable', 'string', 'max:20'],
        ]);

        $supplier = Supplier::create($validated);

        return response()->json([
            'supplier' => [
                'id' => $supplier->id,
                'supplier_name' => $supplier->supplier_name,
                'contact_person' => $supplier->contact_person,
            ],
        ]);
    }

    /**
     * Show the form for creating a new supplier.
     */
    public function create(): Response
    {
        $this->authorize('create', Supplier::class);

        return Inertia::render('suppliers/create');
    }

    /**
     * Store a newly created supplier.
     */
    public function store(SupplierStoreRequest $request): RedirectResponse
    {
        $this->authorize('create', Supplier::class);

        Supplier::create($request->validated());

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier created successfully.');
    }

    /**
     * Show the form for editing the specified supplier.
     */
    public function edit(Supplier $supplier): Response
    {
        $this->authorize('update', $supplier);

        return Inertia::render('suppliers/edit', [
            'supplier' => $supplier,
        ]);
    }

    /**
     * Update the specified supplier.
     */
    public function update(SupplierUpdateRequest $request, Supplier $supplier): RedirectResponse
    {
        $this->authorize('update', $supplier);

        $supplier->update($request->validated());

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier updated successfully.');
    }

    /**
     * Remove the specified supplier.
     */
    public function destroy(Supplier $supplier): RedirectResponse
    {
        $this->authorize('delete', $supplier);

        $supplier->delete();

        return redirect()->route('suppliers.index')
            ->with('success', 'Supplier deleted successfully.');
    }
}
