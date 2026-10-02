<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Tenant;
use App\Models\User;
use App\Services\SystemSettings;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class SuperAdminDataPrivacyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    protected function superAdmin(): User
    {
        return User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);
    }

    public function test_super_admin_can_access_data_privacy_page(): void
    {
        $user = $this->superAdmin();

        $response = $this->actingAs($user)->get(route('super-admin.settings.data-privacy'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('super-admin/settings/data-privacy')
            ->has('activity_log_retention_days')
            ->has('failed_login_retention_days')
        );
    }

    public function test_super_admin_can_update_retention_policy(): void
    {
        $user = $this->superAdmin();

        $response = $this->actingAs($user)->put(route('super-admin.settings.retention.update'), [
            'activity_log_retention_days' => 180,
            'failed_login_retention_days' => 60,
        ]);

        $response->assertRedirect();
        $this->assertSame(180, SystemSettings::activityLogRetentionDays());
        $this->assertSame(60, SystemSettings::failedLoginRetentionDays());
    }

    public function test_super_admin_can_export_tenant_user_data(): void
    {
        $admin = $this->superAdmin();
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $targetUser = User::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        activity()
            ->causedBy($targetUser)
            ->event('created')
            ->log('User signed up');

        $response = $this->actingAs($admin)->get(route('super-admin.tenants.users.export-data', [
            $tenant,
            $targetUser,
        ]));

        $response->assertOk();
        $response->assertHeader('content-disposition', 'attachment; filename=user-data-'.$targetUser->id.'-'.now()->format('Y-m-d').'.json');

        $data = json_decode($response->streamedContent(), true);
        $this->assertArrayHasKey('user', $data);
        $this->assertSame('John Doe', $data['user']['name']);
        $this->assertSame('john@example.com', $data['user']['email']);
        $this->assertArrayHasKey('activity_logs', $data);
        $this->assertCount(1, $data['activity_logs']);
    }

    public function test_super_admin_can_delete_tenant_user_and_anonymize_activity_logs(): void
    {
        $admin = $this->superAdmin();
        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'tenant@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        app()[PermissionRegistrar::class]->setPermissionsTeamId($tenant->id);
        $role = Role::create(['name' => 'Member', 'guard_name' => 'web', 'tenant_id' => $tenant->id]);
        $targetUser = User::factory()->create([
            'tenant_id' => $tenant->id,
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
        ]);
        $targetUser->assignRole($role);
        app()[PermissionRegistrar::class]->setPermissionsTeamId(null);

        activity()
            ->causedBy($targetUser)
            ->event('created')
            ->log('User created a post');

        $activityId = Activity::where('causer_id', $targetUser->id)->first()->id;

        $response = $this->actingAs($admin)->delete(route('super-admin.tenants.users.destroy', [
            $tenant,
            $targetUser,
        ]));

        $response->assertRedirect(route('super-admin.tenants.users.index', $tenant));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('users', ['id' => $targetUser->id]);

        $activity = Activity::find($activityId);
        $this->assertNotNull($activity);
        $this->assertNull($activity->causer_id);
        $this->assertNull($activity->causer_type);
    }

    public function test_export_data_returns_404_when_user_not_in_tenant(): void
    {
        $admin = $this->superAdmin();
        $tenant1 = Tenant::create([
            'business_name' => 'Tenant 1',
            'business_email' => 't1@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);
        $tenant2 = Tenant::create([
            'business_name' => 'Tenant 2',
            'business_email' => 't2@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $userInTenant2 = User::factory()->create(['tenant_id' => $tenant2->id]);

        $response = $this->actingAs($admin)->get(route('super-admin.tenants.users.export-data', [
            $tenant1,
            $userInTenant2,
        ]));

        $response->assertNotFound();
    }
}
