<?php

namespace App\Policies;

use App\Models\TileReturn;
use App\Models\User;

class TileReturnPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tile_returns.view');
    }

    public function view(User $user, TileReturn $tileReturn): bool
    {
        return $user->can('tile_returns.view')
            && $tileReturn->tenant_id === $user->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->can('tile_returns.create');
    }

    public function update(User $user): bool
    {
        return $user->can('tile_returns.edit');
    }

    public function delete(User $user): bool
    {
        return $user->can('tile_returns.delete');
    }
}
