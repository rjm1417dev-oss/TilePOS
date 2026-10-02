<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ReportAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    public function test_guests_cannot_access_reports(): void
    {
        $response = $this->get(route('reports.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_user_with_reports_view_permission_can_access_reports_index(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Reporter', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('reports.view');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('reports.index'));

        $response->assertOk();
    }

    public function test_user_with_reports_view_can_access_profit_loss(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Reporter', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('reports.view');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('reports.profit-loss'));

        $response->assertOk();
    }

    public function test_user_without_reports_permission_cannot_access_reports(): void
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

        $response = $this->actingAs($user)->get(route('reports.index'));

        $response->assertForbidden();
    }

    public function test_user_without_tenant_redirects_to_super_admin_dashboard(): void
    {
        $user = User::factory()->create([
            'tenant_id' => null,
            'is_super_admin' => true,
        ]);

        $response = $this->actingAs($user)->get(route('reports.index'));

        $response->assertRedirect(route('super-admin.dashboard'));
    }
}
