<?php

namespace Tests\Feature;

use App\Models\FeatureFlag;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\FeatureFlagSeeder;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class FeatureFlagAndExpiredTenantTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(FeatureFlagSeeder::class);
    }

    public function test_user_gets_403_when_feature_flag_is_disabled(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        FeatureFlag::where('key', 'tiles')->whereNull('tenant_id')->update(['enabled' => false]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Admin', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('tiles.view');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('tiles.index'));

        $response->assertForbidden();
    }

    public function test_user_can_access_when_feature_flag_is_enabled(): void
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
        $role->givePermissionTo('tiles.view');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('tiles.index'));

        $response->assertOk();
    }

    public function test_expired_tenant_is_redirected_to_subscription_expired_page(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Expired Tenant',
            'business_email' => 'expired@test.com',
            'password' => 'password',
            'is_active' => true,
            'trial_ends_at' => now()->subDay(),
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Member', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $role->givePermissionTo('customers.view');
        $user->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertRedirect(route('subscription.expired'));
    }

    public function test_expired_tenant_can_access_subscription_expired_page(): void
    {
        $tenant = Tenant::create([
            'business_name' => 'Expired Tenant',
            'business_email' => 'expired@test.com',
            'password' => 'password',
            'is_active' => true,
            'trial_ends_at' => now()->subDay(),
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        $response = $this->actingAs($user)->get(route('subscription.expired'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('subscription-expired'));
    }
}
