<?php

namespace App\Services\Chatbot;

use App\Models\User;

class ChatbotPermissionMapper
{
    /**
     * Mapping from tenant `.view` permissions to database tables needed to
     * answer questions about that feature.
     *
     * @var array<string, list<string>>
     */
    protected static array $tenantPermissionTables = [
        'brands.view' => ['brands'],
        'sizes.view' => ['sizes'],
        'tiles.view' => ['tiles', 'brands', 'sizes'],
        'products.view' => ['products', 'tiles', 'brands', 'sizes'],
        'suppliers.view' => ['suppliers'],
        'stocks.view' => ['stocks', 'stock_logs', 'tiles', 'products'],
        'accounts_payables.view' => ['accounts_payables', 'suppliers'],
        'accounts_receivables.view' => ['accounts_receivables', 'customers'],
        'customers.view' => ['customers'],
        'quotations.view' => ['quotations', 'quotation_items', 'customers', 'tiles', 'products'],
        'tile_returns.view' => ['tile_returns', 'customers', 'tiles', 'products'],
        'users.view' => ['users', 'roles'],
        'roles.view' => ['roles', 'permissions'],
        'reports.view' => [
            'brands', 'sizes', 'tiles', 'products', 'suppliers', 'stocks', 'stock_logs',
            'customers', 'quotations', 'quotation_items', 'accounts_payables',
            'accounts_receivables', 'tile_returns', 'users',
        ],
    ];

    /**
     * Tables that cover super-admin management features.
     *
     * @var list<string>
     */
    protected static array $superAdminManagementTables = [
        'tenants',
        'users',
        'roles',
        'permissions',
        'activity_log',
        'system_settings',
    ];

    /**
     * Business tables a super-admin may query for system-wide aggregate
     * metrics (totals, counts, revenue) across all tenants.
     *
     * @var list<string>
     */
    protected static array $superAdminAggregateTables = [
        'brands',
        'sizes',
        'tiles',
        'products',
        'suppliers',
        'stocks',
        'stock_logs',
        'customers',
        'quotations',
        'quotation_items',
        'accounts_payables',
        'accounts_receivables',
        'tile_returns',
    ];

    /**
     * Get allowed tables for a tenant user based on their view permissions.
     *
     * @return list<string>
     */
    public static function forUser(User $user): array
    {
        $allowed = [];

        foreach (self::$tenantPermissionTables as $permission => $tables) {
            if ($user->can($permission)) {
                foreach ($tables as $table) {
                    $allowed[$table] = true;
                }
            }
        }

        return array_keys($allowed);
    }

    /**
     * Get allowed tables for a super admin.
     *
     * @return list<string>
     */
    public static function forSuperAdmin(): array
    {
        return array_values(array_unique(array_merge(
            self::$superAdminManagementTables,
            self::$superAdminAggregateTables
        )));
    }
}
