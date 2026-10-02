<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('roles.view');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->can('roles.view') && $role->tenant_id === $user->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->can('roles.create');
    }

    public function update(User $user, Role $role): bool
    {
        return $user->can('roles.edit') && $role->tenant_id === $user->tenant_id;
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->can('roles.delete') && $role->tenant_id === $user->tenant_id;
    }
}
