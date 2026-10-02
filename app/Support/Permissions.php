<?php

namespace App\Support;

class Permissions
{
    /**
     * All permissions available in the system. Used for seeding and Admin role.
     *
     * @return list<string>
     */
    public static function all(): array
    {
        return [
            'brands.view', 'brands.create', 'brands.edit', 'brands.delete',
            'sizes.view', 'sizes.create', 'sizes.edit', 'sizes.delete',
            'tiles.view', 'tiles.create', 'tiles.edit', 'tiles.delete',
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
            'stocks.view', 'stocks.create', 'stocks.edit', 'stocks.delete',
            'accounts_payables.view', 'accounts_payables.create', 'accounts_payables.edit', 'accounts_payables.delete',
            'accounts_receivables.view', 'accounts_receivables.create', 'accounts_receivables.edit', 'accounts_receivables.delete',
            'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
            'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete',
            'tile_returns.view', 'tile_returns.create', 'tile_returns.edit', 'tile_returns.delete',
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'permissions.view', 'permissions.create',
            'reports.view',
            'import.create',
            'export.create',
        ];
    }
}
