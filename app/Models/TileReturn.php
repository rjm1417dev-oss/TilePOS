<?php

namespace App\Models;

use App\Scopes\TenantScope;
use App\Traits\HasTenantId;
use App\Traits\LogsTenantActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TileReturn extends Model
{
    use HasFactory, HasTenantId, LogsTenantActivity;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    protected $fillable = [
        'tenant_id',
        'receipt_number',
        'type',
        'customer_id',
        'return_tile_id',
        'return_no_of_boxes',
        'return_no_of_tiles',
        'return_total_amount',
        'return_payment_method',
        'return_notes',
        'exchange_tile_id',
        'exchange_no_of_boxes',
        'exchange_no_of_tiles',
        'exchange_total_amount',
        'payment_difference',
        'payment_status',
        'exchange_payment_method',
        'exchange_remarks',
    ];

    protected $casts = [
        'return_total_amount' => 'float',
        'exchange_total_amount' => 'float',
        'payment_difference' => 'float',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function returnTile(): BelongsTo
    {
        return $this->belongsTo(Tile::class, 'return_tile_id');
    }

    public function exchangeTile(): BelongsTo
    {
        return $this->belongsTo(Tile::class, 'exchange_tile_id');
    }
}
