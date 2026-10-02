<?php

namespace App\Models;

use App\Scopes\TenantScope;
use App\Traits\HasTenantId;
use App\Traits\LogsTenantActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Brand extends Model
{
    /** @use HasFactory<\Database\Factories\BrandFactory> */
    use HasFactory, HasTenantId, LogsTenantActivity, SoftDeletes;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
    }

    protected $fillable = [
        'tenant_id',
        'brand_name',
        'brand_description',
        'brand_logo',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function tiles(): HasMany
    {
        return $this->hasMany(Tile::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
