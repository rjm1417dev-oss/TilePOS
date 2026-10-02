<?php

namespace Tests\Feature;

use App\Jobs\SendLowStockAlertJob;
use App\Jobs\SendOverduePayablesJob;
use App\Jobs\SendOverdueReceivablesJob;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class NotificationAlertsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatch_alerts_command_dispatches_jobs_for_active_tenants(): void
    {
        Queue::fake();

        Tenant::query()->update(['is_active' => false]);
        Tenant::create([
            'business_name' => 'Test',
            'business_email' => 'test@test.com',
            'password' => 'password',
            'is_active' => true,
        ]);

        $this->artisan('notifications:dispatch-alerts')
            ->assertSuccessful();

        Queue::assertPushed(SendLowStockAlertJob::class, 1);
        Queue::assertPushed(SendOverduePayablesJob::class, 1);
        Queue::assertPushed(SendOverdueReceivablesJob::class, 1);
    }

    public function test_dispatch_alerts_skips_inactive_tenants(): void
    {
        Queue::fake();

        Tenant::query()->update(['is_active' => false]);

        $this->artisan('notifications:dispatch-alerts')
            ->assertSuccessful();

        Queue::assertNotPushed(SendLowStockAlertJob::class);
    }
}
