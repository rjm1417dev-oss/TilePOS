<?php

namespace App\Jobs;

use App\Mail\LowStockAlertMail;
use App\Models\Stock;
use App\Models\Tenant;
use App\Services\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendLowStockAlertJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $tenantId,
    ) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $tenant = Tenant::with('users')->find($this->tenantId);
        if (! $tenant) {
            return;
        }

        $count = Stock::withoutGlobalScopes()
            ->where('tenant_id', $this->tenantId)
            ->where(function ($q) {
                $q->whereColumn('in_stock', '<=', 'minimum_stock_level')
                    ->orWhere('in_stock', '<=', 0);
            })
            ->count();

        if ($count === 0) {
            return;
        }

        $businessName = $tenant->business_name ?? config('app.name');
        $message = "Low Stock Alert: {$count} item(s) below minimum level. Please check your stock.";

        $emails = collect([$tenant->business_email])
            ->merge($tenant->users->pluck('email'))
            ->filter()
            ->unique();

        foreach ($emails as $email) {
            Mail::to($email)->send(new LowStockAlertMail($count, $businessName));
        }

        if (config('services.whatsapp.enabled') && $tenant->business_phone) {
            $whatsapp->send($tenant->business_phone, $message);
        }
    }
}
