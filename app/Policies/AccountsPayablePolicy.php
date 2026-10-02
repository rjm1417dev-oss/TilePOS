<?php

namespace App\Policies;

use App\Models\AccountsPayable;
use App\Models\User;

class AccountsPayablePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('accounts_payables.view');
    }

    public function view(User $user, AccountsPayable $accountsPayable): bool
    {
        return $user->can('accounts_payables.view');
    }

    public function create(User $user): bool
    {
        return $user->can('accounts_payables.create');
    }

    public function update(User $user, AccountsPayable $accountsPayable): bool
    {
        return $user->can('accounts_payables.edit');
    }

    public function delete(User $user, AccountsPayable $accountsPayable): bool
    {
        return $user->can('accounts_payables.delete');
    }
}
