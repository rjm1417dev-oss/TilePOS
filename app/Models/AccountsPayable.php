<?php

namespace App\Models;

use App\Scopes\TenantScope;
use App\Traits\HasTenantId;
use App\Traits\LogsTenantActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountsPayable extends Model
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
        'stock_reference',
        'purchased_price',
        'paid_amount',
        'remaining_amount',
    ];

    protected function casts(): array
    {
        return [
            'purchased_price' => 'float',
            'paid_amount' => 'float',
            'remaining_amount' => 'float',
        ];
    }

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
