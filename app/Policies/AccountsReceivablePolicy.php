<?php

namespace App\Policies;

use App\Models\AccountsReceivable;
use App\Models\User;

class AccountsReceivablePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('accounts_receivables.view');
    }

    public function view(User $user, AccountsReceivable $accountsReceivable): bool
    {
        return $user->can('accounts_receivables.view');
    }

    public function create(User $user): bool
    {
        return $user->can('accounts_receivables.create');
    }

    public function update(User $user, AccountsReceivable $accountsReceivable): bool
    {
        return $user->can('accounts_receivables.edit');
    }

    public function delete(User $user, AccountsReceivable $accountsReceivable): bool
    {
        return $user->can('accounts_receivables.delete');
    }
}
