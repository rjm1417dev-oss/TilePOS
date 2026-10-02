<?php

namespace App\Models;

use App\Scopes\TenantScope;
use App\Traits\HasTenantId;
use App\Traits\LogsTenantActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockLog extends Model
{
    use HasFactory, HasTenantId, LogsTenantActivity;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    protected $fillable = [
        'tenant_id',
        'stock_id',
        'tile_id',
        'action',
        'quantity_before',
        'quantity_change',
        'quantity_after',
        'reference',
        'notes',
    ];

    protected $casts = [
        'quantity_before' => 'integer',
        'quantity_change' => 'integer',
        'quantity_after' => 'integer',
    ];

    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }

    public function tile(): BelongsTo
    {
        return $this->belongsTo(Tile::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
