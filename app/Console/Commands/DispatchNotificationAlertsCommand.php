<?php

namespace App\Console\Commands;

use App\Jobs\SendLowStockAlertJob;
use App\Jobs\SendOverduePayablesJob;
use App\Jobs\SendOverdueReceivablesJob;
use App\Models\Tenant;
use Illuminate\Console\Command;

class DispatchNotificationAlertsCommand extends Command
{
    protected $signature = 'notifications:dispatch-alerts';

    protected $description = 'Dispatch low stock, overdue payables, and overdue receivables alerts for all tenants';

    public function handle(): int
    {
        $tenants = Tenant::where('is_active', true)->pluck('id');

        foreach ($tenants as $tenantId) {
            SendLowStockAlertJob::dispatch($tenantId);
            SendOverduePayablesJob::dispatch($tenantId);
            SendOverdueReceivablesJob::dispatch($tenantId);
        }

        $this->info('Dispatched alerts for '.$tenants->count().' tenant(s).');

        return self::SUCCESS;
    }
}
