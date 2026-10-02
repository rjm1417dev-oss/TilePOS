<?php

namespace App\Jobs;

use App\Mail\OverduePayablesMail;
use App\Models\AccountsPayable;
use App\Models\Tenant;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendOverduePayablesJob implements ShouldQueue
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

        $overdue = AccountsPayable::withoutGlobalScopes()
            ->where('tenant_id', $this->tenantId)
            ->where('remaining_amount', '>', 0)
            ->where('created_at', '<', Carbon::now()->subDays(30))
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(remaining_amount), 0) as total')
            ->first();

        if (! $overdue || $overdue->count == 0) {
            return;
        }

        $businessName = $tenant->business_name ?? config('app.name');
        $total = (float) $overdue->total;
        $count = (int) $overdue->count;
        $message = "Overdue Payables: {$count} item(s) totaling Rs ".number_format($total, 2).'. Please review.';

        $emails = collect([$tenant->business_email])
            ->merge($tenant->users->pluck('email'))
            ->filter()
            ->unique();

        foreach ($emails as $email) {
            Mail::to($email)->send(new OverduePayablesMail($count, $total, $businessName));
        }

        if (config('services.whatsapp.enabled') && $tenant->business_phone) {
            $whatsapp->send($tenant->business_phone, $message);
        }
    }
}
