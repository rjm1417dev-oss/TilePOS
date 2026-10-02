<?php

namespace App\Policies;

use App\Models\Size;
use App\Models\User;

class SizePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('sizes.view');
    }

    public function view(User $user, Size $size): bool
    {
        return $user->can('sizes.view');
    }

    public function create(User $user): bool
    {
        return $user->can('sizes.create');
    }

    public function update(User $user, Size $size): bool
    {
        return $user->can('sizes.edit');
    }

    public function delete(User $user, Size $size): bool
    {
        return $user->can('sizes.delete');
    }
}
