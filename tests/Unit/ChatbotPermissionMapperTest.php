<?php

namespace Tests\Unit;

use App\Models\Tenant;
use App\Models\User;
use App\Services\Chatbot\ChatbotPermissionMapper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ChatbotPermissionMapperTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app()[\Spatie\Permission\PermissionRegistrar::class]->setPermissionsTeamId(null);

        foreach ([
            'brands.view', 'sizes.view', 'tiles.view', 'customers.view', 'quotations.view', 'reports.view',
        ] as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
    }

    public function test_maps_tenant_view_permissions_to_tables(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_super_admin' => false,
        ]);

        app()[\Spatie\Permission\PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);

        $role = Role::firstOrCreate(['name' => 'Manager', 'tenant_id' => $tenant->id, 'guard_name' => 'web']);
        $role->givePermissionTo(['brands.view', 'customers.view', 'quotations.view']);
        $user->assignRole($role);

        $allowed = ChatbotPermissionMapper::forUser($user);

        $this->assertContains('brands', $allowed);
        $this->assertContains('customers', $allowed);
        $this->assertContains('quotations', $allowed);
        $this->assertContains('quotation_items', $allowed);
        $this->assertNotContains('stocks', $allowed);
        $this->assertNotContains('suppliers', $allowed);
    }

    public function test_returns_super_admin_management_and_aggregate_tables(): void
    {
        $allowed = ChatbotPermissionMapper::forSuperAdmin();

        $this->assertContains('tenants', $allowed);
        $this->assertContains('users', $allowed);
        $this->assertContains('activity_log', $allowed);
        $this->assertContains('roles', $allowed);
        $this->assertContains('permissions', $allowed);

        $this->assertContains('quotations', $allowed);
        $this->assertContains('customers', $allowed);
        $this->assertContains('stocks', $allowed);
    }
}
