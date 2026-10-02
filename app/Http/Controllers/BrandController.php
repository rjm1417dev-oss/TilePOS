<?php

namespace App\Http\Controllers;

use App\Http\Requests\BrandStoreRequest;
use App\Http\Requests\BrandUpdateRequest;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /**
     * Display a listing of brands.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Brand::class);

        $brands = Brand::query()
            ->when($request->search, fn ($q) => $q->where('brand_name', 'like', "%{$request->search}%")
                ->orWhere('brand_description', 'like', "%{$request->search}%"))
            ->orderBy('brand_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('brands/index', [
            'brands' => $brands,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new brand.
     */
    public function create(): Response
    {
        $this->authorize('create', Brand::class);

        return Inertia::render('brands/create');
    }

    /**
     * Store a newly created brand.
     */
    public function store(BrandStoreRequest $request): RedirectResponse
    {
        $this->authorize('create', Brand::class);

        $data = $request->validated();

        if ($request->hasFile('brand_logo')) {
            $data['brand_logo'] = $request->file('brand_logo')->store('brands', 'public');
        }

        Brand::create($data);

        return redirect()->route('brands.index')
            ->with('success', 'Brand created successfully.');
    }

    /**
     * Show the form for editing the specified brand.
     */
    public function edit(Brand $brand): Response
    {
        $this->authorize('update', $brand);

        return Inertia::render('brands/edit', [
            'brand' => $brand,
        ]);
    }

    /**
     * Update the specified brand.
     */
    public function update(BrandUpdateRequest $request, Brand $brand): RedirectResponse
    {
        $this->authorize('update', $brand);

        $data = $request->validated();

        if ($request->hasFile('brand_logo')) {
            if ($brand->brand_logo) {
                Storage::disk('public')->delete($brand->brand_logo);
            }
            $data['brand_logo'] = $request->file('brand_logo')->store('brands', 'public');
        }

        $brand->update($data);

        return redirect()->route('brands.index')
            ->with('success', 'Brand updated successfully.');
    }

    /**
     * Remove the specified brand.
     */
    public function destroy(Brand $brand): RedirectResponse
    {
        $this->authorize('delete', $brand);

        if ($brand->brand_logo) {
            Storage::disk('public')->delete($brand->brand_logo);
        }

        $brand->delete();

        return redirect()->route('brands.index')
            ->with('success', 'Brand deleted successfully.');
    }
}
