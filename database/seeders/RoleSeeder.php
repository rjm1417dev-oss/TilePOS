<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $tenants = Tenant::all();

        foreach ($tenants as $tenant) {
            app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);

            $admin = Role::firstOrCreate(
                [
                    'name' => 'Admin',
                    'guard_name' => 'web',
                    'tenant_id' => $tenant->id,
                ]
            );

            $admin->syncPermissions(\App\Support\Permissions::all());

            $member = Role::firstOrCreate(
                [
                    'name' => 'Member',
                    'guard_name' => 'web',
                    'tenant_id' => $tenant->id,
                ]
            );

            $member->syncPermissions([
                'brands.view', 'brands.create', 'brands.edit',
                'sizes.view', 'sizes.create', 'sizes.edit',
                'tiles.view', 'tiles.create', 'tiles.edit',
                'products.view', 'products.create', 'products.edit',
                'suppliers.view', 'suppliers.create', 'suppliers.edit',
                'stocks.view', 'stocks.create', 'stocks.edit',
                'accounts_payables.view', 'accounts_payables.create', 'accounts_payables.edit',
                'accounts_receivables.view', 'accounts_receivables.create', 'accounts_receivables.edit',
                'customers.view', 'customers.create', 'customers.edit',
                'quotations.view', 'quotations.create', 'quotations.edit',
                'tile_returns.view', 'tile_returns.create', 'tile_returns.edit',
                'reports.view',
                'import.create',
                'export.create',
            ]);

            User::where('tenant_id', $tenant->id)->whereDoesntHave('roles')->each(
                fn (User $user) => $user->assignRole($admin)
            );
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
