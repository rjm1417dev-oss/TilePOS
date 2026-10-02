<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait HasTenantId
{
    protected static function bootHasTenantId(): void
    {
        static::creating(function ($model) {
            if (empty($model->tenant_id) && Auth::check() && ! Auth::user()->is_super_admin) {
                $model->tenant_id = Auth::user()->tenant_id;
            }
        });
    }
}
