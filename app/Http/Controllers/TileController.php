<?php

namespace App\Http\Controllers;

use App\Http\Requests\TileStoreRequest;
use App\Http\Requests\TileUpdateRequest;
use App\Models\Brand;
use App\Models\Size;
use App\Models\Tile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TileController extends Controller
{
    /**
     * Display a listing of tiles.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Tile::class);

        $tiles = Tile::query()
            ->with(['brand', 'size'])
            ->when($request->search, fn ($q) => $q->where('tile_code', 'like', "%{$request->search}%")
                ->orWhereHas('brand', fn ($b) => $b->where('brand_name', 'like', "%{$request->search}%"))
                ->orWhereHas('size', fn ($s) => $s->where('size_in_inches', 'like', "%{$request->search}%")))
            ->when($request->brand_id, fn ($q) => $q->where('brand_id', $request->brand_id))
            ->when($request->size_id, fn ($q) => $q->where('size_id', $request->size_id))
            ->orderBy('tile_code')
            ->paginate(15)
            ->withQueryString();

        $brands = Brand::orderBy('brand_name')->get(['id', 'brand_name']);
        $sizes = Size::orderBy('size_in_inches')->get(['id', 'size_in_inches']);

        return Inertia::render('tiles/index', [
            'tiles' => $tiles,
            'brands' => $brands,
            'sizes' => $sizes,
            'filters' => $request->only(['search', 'brand_id', 'size_id']),
        ]);
    }

    /**
     * Show the form for creating a new tile.
     */
    public function create(): Response
    {
        $this->authorize('create', Tile::class);

        $brands = Brand::orderBy('brand_name')->get(['id', 'brand_name']);
        $sizes = Size::orderBy('size_in_inches')->get(['id', 'size_in_inches']);

        return Inertia::render('tiles/create', [
            'brands' => $brands,
            'sizes' => $sizes,
        ]);
    }

    /**
     * Store a newly created tile.
     */
    public function store(TileStoreRequest $request): RedirectResponse
    {
        $this->authorize('create', Tile::class);

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('tiles', 'public');
        }

        $data['price_per_box'] = $this->calculatePricePerBox(
            (float) ($data['packing_m2'] ?? 0),
            (float) ($data['cost_per_m2'] ?? 0)
        );

        Tile::create($data);

        return redirect()->route('tiles.index')
            ->with('success', 'Tile created successfully.');
    }

    /**
     * Show the form for editing the specified tile.
     */
    public function edit(Tile $tile): Response
    {
        $this->authorize('update', $tile);

        $tile->load(['brand', 'size']);
        $brands = Brand::orderBy('brand_name')->get(['id', 'brand_name']);
        $sizes = Size::orderBy('size_in_inches')->get(['id', 'size_in_inches']);

        return Inertia::render('tiles/edit', [
            'tile' => $tile,
            'brands' => $brands,
            'sizes' => $sizes,
        ]);
    }

    /**
     * Update the specified tile.
     */
    public function update(TileUpdateRequest $request, Tile $tile): RedirectResponse
    {
        $this->authorize('update', $tile);

        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($tile->image) {
                Storage::disk('public')->delete($tile->image);
            }
            $data['image'] = $request->file('image')->store('tiles', 'public');
        }

        $data['price_per_box'] = $this->calculatePricePerBox(
            (float) ($data['packing_m2'] ?? 0),
            (float) ($data['cost_per_m2'] ?? 0)
        );

        $tile->update($data);

        return redirect()->route('tiles.index')
            ->with('success', 'Tile updated successfully.');
    }

    /**
     * Remove the specified tile.
     */
    public function destroy(Tile $tile): RedirectResponse
    {
        $this->authorize('delete', $tile);

        if ($tile->image) {
            Storage::disk('public')->delete($tile->image);
        }

        $tile->delete();

        return redirect()->route('tiles.index')
            ->with('success', 'Tile deleted successfully.');
    }

    private function calculatePricePerBox(float $packingM2, float $costPerM2): float
    {
        return round($packingM2 * $costPerM2, 2);
    }
}
