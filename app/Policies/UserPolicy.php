<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->can('users.view') && $model->tenant_id === $user->tenant_id;
    }

    public function create(User $user): bool
    {
        return $user->can('users.create');
    }

    public function update(User $user, User $model): bool
    {
        return $user->can('users.edit') && $model->tenant_id === $user->tenant_id;
    }

    public function delete(User $user, User $model): bool
    {
        return $user->can('users.delete') && $model->tenant_id === $user->tenant_id;
    }
}
