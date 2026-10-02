<?php

namespace App\Policies;

use App\Models\Tile;
use App\Models\User;

class TilePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tiles.view');
    }

    public function view(User $user, Tile $tile): bool
    {
        return $user->can('tiles.view');
    }

    public function create(User $user): bool
    {
        return $user->can('tiles.create');
    }

    public function update(User $user, Tile $tile): bool
    {
        return $user->can('tiles.edit');
    }

    public function delete(User $user, Tile $tile): bool
    {
        return $user->can('tiles.delete');
    }
}
