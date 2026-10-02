<?php

namespace App\Http\Controllers;

use App\Http\Requests\SizeStoreRequest;
use App\Http\Requests\SizeUpdateRequest;
use App\Models\Size;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SizeController extends Controller
{
    /**
     * Display a listing of sizes.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Size::class);

        $sizes = Size::query()
            ->when($request->search, fn ($q) => $q->where('size_in_inches', 'like', "%{$request->search}%")
                ->orWhere('description', 'like', "%{$request->search}%"))
            ->orderBy('size_in_inches')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('sizes/index', [
            'sizes' => $sizes,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new size.
     */
    public function create(): Response
    {
        $this->authorize('create', Size::class);

        return Inertia::render('sizes/create');
    }

    /**
     * Store a newly created size.
     */
    public function store(SizeStoreRequest $request): RedirectResponse
    {
        $this->authorize('create', Size::class);

        Size::create($request->validated());

        return redirect()->route('sizes.index')
            ->with('success', 'Size created successfully.');
    }

    /**
     * Show the form for editing the specified size.
     */
    public function edit(Size $size): Response
    {
        $this->authorize('update', $size);

        return Inertia::render('sizes/edit', [
            'size' => $size,
        ]);
    }

    /**
     * Update the specified size.
     */
    public function update(SizeUpdateRequest $request, Size $size): RedirectResponse
    {
        $this->authorize('update', $size);

        $size->update($request->validated());

        return redirect()->route('sizes.index')
            ->with('success', 'Size updated successfully.');
    }

    /**
     * Remove the specified size.
     */
    public function destroy(Size $size): RedirectResponse
    {
        $this->authorize('delete', $size);

        $size->delete();

        return redirect()->route('sizes.index')
            ->with('success', 'Size deleted successfully.');
    }
}
