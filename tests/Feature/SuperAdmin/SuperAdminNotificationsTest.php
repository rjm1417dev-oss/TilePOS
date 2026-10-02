<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\FailedLoginAttempt;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperAdminNotificationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    public function test_super_admin_sees_super_admin_notifications_not_tenant_notifications(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        FailedLoginAttempt::create([
            'email' => 'test@test.com',
            'ip_address' => '127.0.0.1',
            'attempted_at' => now(),
        ]);

        $response = $this->actingAs($superAdmin)->get(route('super-admin.dashboard'));

        $response->assertOk();
        $notifications = $response->original->getData()['page']['props']['notifications'];
        $this->assertGreaterThan(0, $notifications['unreadCount']);
        $types = array_column($notifications['items'], 'type');
        $this->assertContains('failed_logins', $types);
        $this->assertNotContains('low_stock', $types);
        $this->assertNotContains('payables', $types);
        $this->assertNotContains('receivables', $types);
    }

    public function test_super_admin_sees_new_tenants_notification(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        Tenant::create([
            'business_name' => 'New Tenant',
            'business_email' => 'new@test.com',
            'password' => 'password',
            'is_active' => true,
            'created_at' => now(),
        ]);

        $response = $this->actingAs($superAdmin)->get(route('super-admin.dashboard'));

        $response->assertOk();
        $notifications = $response->original->getData()['page']['props']['notifications'];
        $types = array_column($notifications['items'], 'type');
        $this->assertContains('new_tenants', $types);
    }

    public function test_super_admin_sees_expiring_trials_notification(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        Tenant::create([
            'business_name' => 'Expiring Tenant',
            'business_email' => 'exp@test.com',
            'password' => 'password',
            'is_active' => true,
            'trial_ends_at' => Carbon::now()->addDays(3),
            'subscription_status' => 'trial',
        ]);

        $response = $this->actingAs($superAdmin)->get(route('super-admin.dashboard'));

        $response->assertOk();
        $notifications = $response->original->getData()['page']['props']['notifications'];
        $types = array_column($notifications['items'], 'type');
        $this->assertContains('expiring_trials', $types);
    }

    public function test_tenant_user_does_not_see_super_admin_notifications(): void
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

        FailedLoginAttempt::create([
            'email' => 'test@test.com',
            'ip_address' => '127.0.0.1',
            'attempted_at' => now(),
        ]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertOk();
        $notifications = $response->original->getData()['page']['props']['notifications'];
        $types = array_column($notifications['items'] ?? [], 'type');
        $this->assertNotContains('failed_logins', $types);
        $this->assertNotContains('new_tenants', $types);
        $this->assertNotContains('expiring_trials', $types);
    }
}
