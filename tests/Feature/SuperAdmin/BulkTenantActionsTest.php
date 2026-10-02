<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BulkTenantActionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    public function test_super_admin_can_bulk_activate_tenants(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $t1 = Tenant::create([
            'business_name' => 'Tenant 1',
            'business_email' => 't1@test.com',
            'password' => 'password',
            'is_active' => false,
        ]);
        $t2 = Tenant::create([
            'business_name' => 'Tenant 2',
            'business_email' => 't2@test.com',
            'password' => 'password',
            'is_active' => false,
        ]);

        $response = $this->actingAs($superAdmin)->post(
            route('super-admin.tenants.bulk-activate'),
            ['tenant_ids' => [$t1->id, $t2->id]]
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertTrue($t1->fresh()->is_active);
        $this->assertTrue($t2->fresh()->is_active);
    }

    public function test_super_admin_can_bulk_deactivate_tenants(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $t1 = Tenant::create([
            'business_name' => 'Tenant 1',
            'business_email' => 't1@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);
        $t2 = Tenant::create([
            'business_name' => 'Tenant 2',
            'business_email' => 't2@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $response = $this->actingAs($superAdmin)->post(
            route('super-admin.tenants.bulk-deactivate'),
            ['tenant_ids' => [$t1->id, $t2->id]]
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $this->assertFalse($t1->fresh()->is_active);
        $this->assertFalse($t2->fresh()->is_active);
    }

    public function test_super_admin_can_bulk_export_tenants(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $t1 = Tenant::create([
            'business_name' => 'Tenant 1',
            'business_email' => 't1@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $response = $this->actingAs($superAdmin)->post(
            route('super-admin.tenants.bulk-export'),
            ['tenant_ids' => [$t1->id]]
        );

        $response->assertOk();
        $response->assertHeader('content-type', 'application/zip');
    }

    public function test_bulk_activate_only_affects_inactive_tenants(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $t1 = Tenant::create([
            'business_name' => 'Tenant 1',
            'business_email' => 't1@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);
        $t2 = Tenant::create([
            'business_name' => 'Tenant 2',
            'business_email' => 't2@test.com',
            'password' => 'password',
            'is_active' => false,
        ]);

        $this->actingAs($superAdmin)->post(
            route('super-admin.tenants.bulk-activate'),
            ['tenant_ids' => [$t1->id, $t2->id]]
        );

        $this->assertTrue($t1->fresh()->is_active);
        $this->assertTrue($t2->fresh()->is_active);
    }
}
