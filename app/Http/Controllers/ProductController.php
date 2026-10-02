<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\ProductUpdateRequest;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        $products = Product::query()
            ->with('brand')
            ->when($request->search, fn ($q) => $q->where('product_name', 'like', "%{$request->search}%")
                ->orWhereHas('brand', fn ($b) => $b->where('brand_name', 'like', "%{$request->search}%")))
            ->when($request->brand_id, fn ($q) => $q->where('brand_id', $request->brand_id))
            ->orderBy('product_name')
            ->paginate(15)
            ->withQueryString();

        $brands = Brand::orderBy('brand_name')->get(['id', 'brand_name']);

        return Inertia::render('products/index', [
            'products' => $products,
            'brands' => $brands,
            'filters' => $request->only(['search', 'brand_id']),
        ]);
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): Response
    {
        $this->authorize('create', Product::class);

        $brands = Brand::orderBy('brand_name')->get(['id', 'brand_name']);

        return Inertia::render('products/create', [
            'brands' => $brands,
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(ProductStoreRequest $request): RedirectResponse
    {
        $this->authorize('create', Product::class);

        $data = $request->validated();

        if ($request->hasFile('product_image')) {
            $data['product_image'] = $request->file('product_image')->store('products', 'public');
        }

        Product::create($data);

        return redirect()->route('products.index')
            ->with('success', 'Product created successfully.');
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);

        $product->load('brand');
        $brands = Brand::orderBy('brand_name')->get(['id', 'brand_name']);

        return Inertia::render('products/edit', [
            'product' => $product,
            'brands' => $brands,
        ]);
    }

    /**
     * Update the specified product.
     */
    public function update(ProductUpdateRequest $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);

        $data = $request->validated();

        if ($request->hasFile('product_image')) {
            if ($product->product_image) {
                Storage::disk('public')->delete($product->product_image);
            }
            $data['product_image'] = $request->file('product_image')->store('products', 'public');
        }

        $product->update($data);

        return redirect()->route('products.index')
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);

        if ($product->product_image) {
            Storage::disk('public')->delete($product->product_image);
        }

        $product->delete();

        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }
}
