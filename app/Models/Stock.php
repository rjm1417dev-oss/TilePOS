<?php

namespace App\Models;

use App\Scopes\TenantScope;
use App\Traits\HasTenantId;
use App\Traits\LogsTenantActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Stock extends Model
{
    use HasFactory, HasTenantId, LogsTenantActivity;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    protected $fillable = [
        'tenant_id',
        'tile_id',
        'supplier_id',
        'in_stock',
        'minimum_stock_level',
        'stock_reference',
        'stock_location',
    ];

    protected function casts(): array
    {
        return [
            'in_stock' => 'integer',
            'minimum_stock_level' => 'integer',
        ];
    }

    public function tile(): BelongsTo
    {
        return $this->belongsTo(Tile::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function accountsPayables(): HasMany
    {
        return $this->hasMany(AccountsPayable::class, 'stock_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(StockLog::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function getStockStatusAttribute(): string
    {
        if ($this->in_stock <= 0) {
            return 'out_of_stock';
        }
        if ($this->in_stock <= $this->minimum_stock_level) {
            return 'low_stock';
        }

        return 'in_stock';
    }
}
