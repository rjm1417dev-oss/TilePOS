<?php

namespace App\Models;

use App\Scopes\TenantScope;
use App\Traits\HasTenantId;
use App\Traits\LogsTenantActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountsReceivable extends Model
{
    use HasFactory, HasTenantId, LogsTenantActivity;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    protected $fillable = [
        'tenant_id',
        'quotation_id',
        'tile_id',
        'tile_code_display',
        'customer_name',
        'customer_phone',
        'total_amount',
        'paid_amount',
        'remaining_amount',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'float',
            'paid_amount' => 'float',
            'remaining_amount' => 'float',
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

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
