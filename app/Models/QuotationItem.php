<?php

namespace App\Models;

use App\Scopes\TenantScope;
use App\Traits\HasTenantId;
use App\Traits\LogsTenantActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuotationItem extends Model
{
    use HasTenantId, LogsTenantActivity;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    protected $fillable = [
        'tenant_id',
        'quotation_id',
        'item_type',
        'tile_id',
        'product_id',
        'room_type',
        'surface_type',
        'length',
        'width',
        'height',
        'unit',
        'total_area',
        'total_area_m2',
        'tiles_needed',
        'wastage_percentage',
        'wastage_tiles',
        'total_tiles_with_wastage',
        'boxes_required',
        'loose_tiles',
        'price_per_box',
        'item_name',
        'quantity',
        'unit_price',
        'subtotal',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'length' => 'decimal:2',
            'width' => 'decimal:2',
            'height' => 'decimal:2',
            'total_area' => 'decimal:2',
            'total_area_m2' => 'decimal:2',
            'price_per_box' => 'decimal:2',
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    public function tile(): BelongsTo
    {
        return $this->belongsTo(Tile::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function getDisplayNameAttribute(): string
    {
        if ($this->item_type === 'tile' && $this->tile) {
            $brand = $this->tile->brand?->brand_name ?? '';
            $size = $this->tile->size?->size_in_inches ?? '';

            return ($this->tile->tile_code ?? 'N/A').
                ($brand ? ' - '.$brand : '').
                ($size ? ' ('.$size.')' : '');
        }

        if ($this->item_type === 'product' && $this->product) {
            return $this->product->product_name ?? 'N/A';
        }

        return $this->item_name ?? 'N/A';
    }

    public function getQuantityDisplayAttribute(): string
    {
        if ($this->item_type === 'tile') {
            $display = ($this->boxes_required ?? 0).' box'.(($this->boxes_required ?? 0) != 1 ? 'es' : '');
            if (($this->loose_tiles ?? 0) > 0) {
                $display .= ', '.($this->loose_tiles ?? 0).' loose tile'.($this->loose_tiles != 1 ? 's' : '');
            }

            return $display;
        }

        return ($this->quantity ?? 0).' unit'.($this->quantity != 1 ? 's' : '');
    }
}
