<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class RolePolicyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    public function test_user_with_roles_view_permission_can_access_roles_index(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Viewer', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('roles.view');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('roles.index'));

        $response->assertOk();
    }

    public function test_user_without_roles_permission_cannot_access_roles_index(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Member', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('brands.view');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('roles.index'));

        $response->assertForbidden();
    }
}
