<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ImportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    public function test_guests_cannot_access_import_page(): void
    {
        $response = $this->get(route('import.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_user_with_import_create_permission_can_access_import_page(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Importer', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('import.create');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('import.index'));

        $response->assertOk();
    }

    public function test_user_can_import_customers_from_csv(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Admin', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('import.create');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $csv = "name,phone,cnic,address,notes\n";
        $csv .= "Acme Corp,0300-1234567,,123 Main St,Sample\n";
        $csv .= "Beta LLC,042-9876543,12345-1234567-1,456 Oak Ave,\n";

        $file = UploadedFile::fake()->createWithContent('customers.csv', $csv);

        $response = $this->actingAs($user)->post(route('import.store'), [
            'type' => 'customers',
            'file' => $file,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('import_result');
        $this->assertSame(2, session('import_result')['created']);

        $this->assertDatabaseHas('customers', [
            'tenant_id' => $tenant->id,
            'name' => 'Acme Corp',
            'phone' => '0300-1234567',
        ]);
        $this->assertDatabaseHas('customers', [
            'tenant_id' => $tenant->id,
            'name' => 'Beta LLC',
            'phone' => '042-9876543',
        ]);
    }

    public function test_user_without_permission_cannot_import(): void
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

        $csv = "name,phone\nCustomer One,123\n";
        $file = UploadedFile::fake()->createWithContent('test.csv', $csv);

        $response = $this->actingAs($user)->post(route('import.store'), [
            'type' => 'customers',
            'file' => $file,
        ]);

        $response->assertForbidden();
    }

    public function test_download_template_returns_csv(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Importer', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('import.create');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('import.template', ['type' => 'customers']));

        $response->assertOk();
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type') ?? '');
    }
}
