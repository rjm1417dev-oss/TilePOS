<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImpersonationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    public function test_super_admin_can_impersonate_tenant_user(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $targetUser = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_super_admin' => false,
        ]);

        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $response = $this->actingAs($superAdmin)->post(
            route('super-admin.tenants.users.impersonate', [$tenant, $targetUser])
        );

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($targetUser);
        $this->assertTrue(session()->has('impersonator_id'));
        $this->assertEquals($superAdmin->id, session('impersonator_id'));
    }

    public function test_stop_impersonation_returns_to_super_admin(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $targetUser = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_super_admin' => false,
        ]);

        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $this->actingAs($superAdmin)->post(
            route('super-admin.tenants.users.impersonate', [$tenant, $targetUser])
        );

        $this->assertAuthenticatedAs($targetUser);
        $this->assertTrue(session()->has('impersonator_id'));

        $response = $this->actingAs($targetUser)->post(route('super-admin.impersonate.stop'));

        $response->assertRedirect(route('super-admin.dashboard'));
        $this->assertAuthenticatedAs($superAdmin);
        $this->assertFalse(session()->has('impersonator_id'));
    }
}
