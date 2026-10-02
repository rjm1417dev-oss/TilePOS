<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogsFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
    }

    public function test_super_admin_can_view_activity_logs_with_filters(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $tenant1 = Tenant::create([
            'business_name' => 'Acme Corp',
            'business_email' => 'acme@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $tenant2 = Tenant::create([
            'business_name' => 'Beta Inc',
            'business_email' => 'beta@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        $user2 = User::factory()->create(['tenant_id' => $tenant2->id]);

        activity()
            ->causedBy($user1)
            ->event('created')
            ->log('Test activity tenant1');

        activity()
            ->causedBy($user2)
            ->event('updated')
            ->log('Test activity tenant2');

        $response = $this->actingAs($superAdmin)->get(
            route('super-admin.activity-logs.index')
        );

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('super-admin/activity-logs/index')
            ->has('activityLogs')
            ->has('filters')
            ->has('filterOptions')
            ->has('filterOptions.tenants')
            ->has('filterOptions.users')
            ->has('filterOptions.subjectTypes')
            ->has('filterOptions.events')
        );
    }

    public function test_tenant_filter_returns_only_tenant_activities(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $tenant1 = Tenant::create([
            'business_name' => 'Acme Corp',
            'business_email' => 'acme@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $tenant2 = Tenant::create([
            'business_name' => 'Beta Inc',
            'business_email' => 'beta@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        $user2 = User::factory()->create(['tenant_id' => $tenant2->id]);

        activity()->causedBy($user1)->event('created')->log('Acme activity');
        activity()->causedBy($user2)->event('created')->log('Beta activity');

        $response = $this->actingAs($superAdmin)->get(
            route('super-admin.activity-logs.index', ['tenant_id' => $tenant1->id])
        );

        $response->assertOk();
        $logs = $response->original->getData()['page']['props']['activityLogs'];
        $this->assertCount(1, $logs);
        $this->assertStringContainsString('Acme', $logs[0]['description']);
    }

    public function test_user_filter_returns_only_user_activities(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'test@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user1 = User::factory()->create(['tenant_id' => $tenant->id]);
        $user2 = User::factory()->create(['tenant_id' => $tenant->id]);

        activity()->causedBy($user1)->event('created')->log('User1 activity');
        activity()->causedBy($user2)->event('created')->log('User2 activity');

        $response = $this->actingAs($superAdmin)->get(
            route('super-admin.activity-logs.index', ['user_id' => $user1->id])
        );

        $response->assertOk();
        $logs = $response->original->getData()['page']['props']['activityLogs'];
        $this->assertCount(1, $logs);
        $this->assertStringContainsString('User1', $logs[0]['description']);
    }

    public function test_date_range_filter_returns_only_activities_in_range(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'test@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        activity()->causedBy($user)->event('created')->log('Old activity');
        $oldActivity = \Spatie\Activitylog\Models\Activity::latest()->first();
        $oldActivity->update(['created_at' => Carbon::now()->subDays(10)]);

        activity()->causedBy($user)->event('created')->log('Recent activity');

        $dateFrom = Carbon::now()->subDays(2)->format('Y-m-d');
        $dateTo = Carbon::now()->addDay()->format('Y-m-d');

        $response = $this->actingAs($superAdmin)->get(
            route('super-admin.activity-logs.index', [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ])
        );

        $response->assertOk();
        $logs = $response->original->getData()['page']['props']['activityLogs'];
        $this->assertCount(1, $logs);
        $this->assertStringContainsString('Recent', $logs[0]['description']);
    }

    public function test_event_filter_returns_matching_activities(): void
    {
        $superAdmin = User::factory()->create([
            'is_super_admin' => true,
            'tenant_id' => null,
        ]);

        $tenant = Tenant::create([
            'business_name' => 'Test Tenant',
            'business_email' => 'test@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        activity()->causedBy($user)->event('created')->log('Created activity');
        activity()->causedBy($user)->event('updated')->log('Updated activity');

        $response = $this->actingAs($superAdmin)->get(
            route('super-admin.activity-logs.index', ['event' => 'updated'])
        );

        $response->assertOk();
        $logs = $response->original->getData()['page']['props']['activityLogs'];
        $this->assertCount(1, $logs);
        $this->assertStringContainsString('Updated', $logs[0]['description']);
    }
}
