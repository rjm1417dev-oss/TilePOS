<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeatureFlag extends Model
{
    protected $fillable = ['key', 'enabled', 'tenant_id'];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public static function isEnabled(string $key, ?int $tenantId = null): bool
    {
        $global = static::where('key', $key)->whereNull('tenant_id')->first();
        if ($global) {
            return $global->enabled;
        }
        if ($tenantId) {
            $tenant = static::where('key', $key)->where('tenant_id', $tenantId)->first();

            return $tenant?->enabled ?? true;
        }

        return true;
    }
}
