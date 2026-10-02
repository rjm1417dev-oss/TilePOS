<?php

namespace App\Jobs;

use App\Mail\OverdueReceivablesMail;
use App\Models\AccountsReceivable;
use App\Models\Tenant;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendOverdueReceivablesJob implements ShouldQueue
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

        $overdue = AccountsReceivable::withoutGlobalScopes()
            ->where('tenant_id', $this->tenantId)
            ->where('remaining_amount', '>', 0)
            ->whereHas('quotation', fn ($q) => $q->whereNotNull('due_date')->where('due_date', '<', Carbon::now()))
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(remaining_amount), 0) as total')
            ->first();

        if (! $overdue || $overdue->count == 0) {
            return;
        }

        $businessName = $tenant->business_name ?? config('app.name');
        $total = (float) $overdue->total;
        $count = (int) $overdue->count;
        $message = "Overdue Receivables: {$count} item(s) totaling Rs ".number_format($total, 2).'. Please follow up.';

        $emails = collect([$tenant->business_email])
            ->merge($tenant->users->pluck('email'))
            ->filter()
            ->unique();

        foreach ($emails as $email) {
            Mail::to($email)->send(new OverdueReceivablesMail($count, $total, $businessName));
        }

        if (config('services.whatsapp.enabled') && $tenant->business_phone) {
            $whatsapp->send($tenant->business_phone, $message);
        }
    }
}
