<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Tenant extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'business_name',
        'business_email',
        'business_phone',
        'business_address',
        'logo',
        'password',
        'is_active',
        'trial_ends_at',
        'subscription_status',
        'maintenance_mode',
        'maintenance_message',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'trial_ends_at' => 'datetime',
            'maintenance_mode' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function isExpired(): bool
    {
        if ($this->subscription_status === 'cancelled' || $this->subscription_status === 'expired') {
            return true;
        }

        return $this->trial_ends_at && $this->trial_ends_at->isPast();
    }

    public function quotations(): HasMany
    {
        return $this->hasMany(Quotation::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function brands(): HasMany
    {
        return $this->hasMany(Brand::class);
    }

    public function sizes(): HasMany
    {
        return $this->hasMany(Size::class);
    }

    public function tiles(): HasMany
    {
        return $this->hasMany(Tile::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function suppliers(): HasMany
    {
        return $this->hasMany(Supplier::class);
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function accountsPayables(): HasMany
    {
        return $this->hasMany(AccountsPayable::class);
    }

    public function accountsReceivables(): HasMany
    {
        return $this->hasMany(AccountsReceivable::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function roles(): HasMany
    {
        return $this->hasMany(\Spatie\Permission\Models\Role::class, 'tenant_id');
    }
}
