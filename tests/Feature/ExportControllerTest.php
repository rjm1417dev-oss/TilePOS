<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ExportControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    public function test_guests_cannot_access_export_page(): void
    {
        $response = $this->get(route('export.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_user_with_export_create_permission_can_access_export_page(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Exporter', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('export.create');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('export.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('export/index')
            ->has('exportTypes')
        );
    }

    public function test_user_can_download_products_csv(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        Product::create([
            'tenant_id' => $tenant->id,
            'product_name' => 'Test Product',
            'sale_price' => 1500,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Exporter', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('export.create');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('export.download', ['type' => 'products', 'format' => 'csv']));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        $this->assertStringContainsString('product_name', $content);
        $this->assertStringContainsString('Test Product', $content);
    }

    public function test_user_can_download_customers_csv(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        Customer::create([
            'tenant_id' => $tenant->id,
            'name' => 'Acme Corp',
            'phone' => '0300-1234567',
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Exporter', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('export.create');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('export.download', ['type' => 'customers', 'format' => 'csv']));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();
        $this->assertStringContainsString('name', $content);
        $this->assertStringContainsString('Acme Corp', $content);
    }

    public function test_user_without_permission_cannot_export(): void
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
        $role->givePermissionTo('customers.view');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('export.download', ['type' => 'customers', 'format' => 'csv']));

        $response->assertForbidden();
    }

    public function test_invalid_export_type_returns_404(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Exporter', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('export.create');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('export.download', ['type' => 'invalid-type', 'format' => 'csv']));

        $response->assertNotFound();
    }
}
