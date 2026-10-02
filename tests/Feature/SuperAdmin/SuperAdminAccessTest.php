<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SuperAdminAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    public function test_super_admin_can_access_super_admin_dashboard(): void
    {
        $user = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $response = $this->actingAs($user)->get(route('super-admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('super-admin/dashboard')
            ->has('analytics')
            ->has('analytics.tenantGrowth')
            ->has('analytics.revenueByTenant')
            ->has('analytics.trialConversions')
            ->has('analytics.churn')
            ->has('analytics.revenueTrend')
        );
    }

    public function test_super_admin_can_access_tenants_list(): void
    {
        $user = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $response = $this->actingAs($user)->get(route('super-admin.tenants.index'));

        $response->assertOk();
    }

    public function test_tenant_user_cannot_access_super_admin_routes(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_super_admin' => false,
        ]);

        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $adminRole = Role::create(['name' => 'Admin', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $user->assignRole($adminRole);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('super-admin.dashboard'));

        $response->assertForbidden();
    }

    public function test_guest_cannot_access_super_admin_routes(): void
    {
        $response = $this->get(route('super-admin.dashboard'));

        $response->assertRedirect(route('login'));
    }
}
