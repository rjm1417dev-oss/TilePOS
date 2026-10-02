<?php

namespace App\Policies;

use App\Models\Stock;
use App\Models\User;

class StockPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('stocks.view');
    }

    public function view(User $user, Stock $stock): bool
    {
        return $user->can('stocks.view');
    }

    public function create(User $user): bool
    {
        return $user->can('stocks.create');
    }

    public function update(User $user, Stock $stock): bool
    {
        return $user->can('stocks.edit');
    }

    public function delete(User $user, Stock $stock): bool
    {
        return $user->can('stocks.delete');
    }
}
