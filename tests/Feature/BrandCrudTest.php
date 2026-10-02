<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class BrandCrudTest extends TestCase
{
    use RefreshDatabase;

    protected Tenant $tenant;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);

        $this->tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);

        app()[PermissionRegistrar::class]->setPermissionsTeamId($this->tenant->id);
        $adminRole = Role::create([
            'name' => 'Admin',
            'guard_name' => 'web',
            'tenant_id' => $this->tenant->id,
        ]);
        $adminRole->syncPermissions(\App\Support\Permissions::all());
        $this->user->assignRole($adminRole);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);
    }

    public function test_user_can_view_brands_index(): void
    {
        $response = $this->actingAs($this->user)->get(route('brands.index'));

        $response->assertOk();
    }

    public function test_user_can_create_brand(): void
    {
        $response = $this->actingAs($this->user)->post(route('brands.store'), [
            'brand_name' => 'Test Brand',
            'brand_description' => 'A test brand description',
        ]);

        $response->assertRedirect(route('brands.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('brands', [
            'brand_name' => 'Test Brand',
            'tenant_id' => $this->tenant->id,
        ]);
    }

    public function test_user_can_update_brand(): void
    {
        $brand = Brand::withoutGlobalScopes()->create([
            'tenant_id' => $this->tenant->id,
            'brand_name' => 'Original Name',
            'brand_description' => null,
        ]);

        $response = $this->actingAs($this->user)->put(route('brands.update', $brand), [
            'brand_name' => 'Updated Name',
            'brand_description' => 'Updated description',
        ]);

        $response->assertRedirect(route('brands.index'));
        $response->assertSessionHas('success');

        $brand->refresh();
        $this->assertEquals('Updated Name', $brand->brand_name);
        $this->assertEquals('Updated description', $brand->brand_description);
    }

    public function test_user_can_delete_brand(): void
    {
        $brand = Brand::withoutGlobalScopes()->create([
            'tenant_id' => $this->tenant->id,
            'brand_name' => 'To Delete',
            'brand_description' => null,
        ]);

        $response = $this->actingAs($this->user)->delete(route('brands.destroy', $brand));

        $response->assertRedirect(route('brands.index'));
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('brands', ['id' => $brand->id]);
    }

    public function test_user_without_brand_permission_cannot_create_brand(): void
    {
        app()[PermissionRegistrar::class]->setPermissionsTeamId($this->tenant->id);
        $memberRole = Role::create([
            'name' => 'Member',
            'guard_name' => 'web',
            'tenant_id' => $this->tenant->id,
        ]);
        $memberRole->givePermissionTo('brands.view');
        $this->user->syncRoles([$memberRole]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($this->user)->post(route('brands.store'), [
            'brand_name' => 'Unauthorized Brand',
            'brand_description' => null,
        ]);

        $response->assertForbidden();
    }
}
