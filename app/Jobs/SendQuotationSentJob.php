<?php

namespace App\Jobs;

use App\Mail\QuotationSentMail;
use App\Models\Quotation;
use App\Services\WhatsAppService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendQuotationSentJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $quotationId,
    ) {}

    public function handle(WhatsAppService $whatsapp): void
    {
        $quotation = Quotation::withoutGlobalScopes()->with(['tenant', 'tenant.users'])->find($this->quotationId);
        if (! $quotation || ! $quotation->tenant) {
            return;
        }

        $tenant = $quotation->tenant;
        $businessName = $tenant->business_name ?? config('app.name');
        $isInvoice = $quotation->type === 'invoice';
        $docType = $isInvoice ? 'Invoice' : 'Quotation';

        $emails = collect([$tenant->business_email])
            ->merge($tenant->users->pluck('email'))
            ->filter()
            ->unique();

        foreach ($emails as $email) {
            Mail::to($email)->send(new QuotationSentMail($quotation, $businessName, $isInvoice));
        }

        if (config('services.whatsapp.enabled')) {
            $msg = "{$docType} {$quotation->quotation_number} created for ".($quotation->customer_name ?? 'Walk-in').'. Total: Rs '.number_format($quotation->total_amount, 2);
            if ($tenant->business_phone) {
                $whatsapp->send($tenant->business_phone, $msg);
            }
            if ($quotation->customer_phone) {
                $customerMsg = "Your {$docType} {$quotation->quotation_number} has been generated. Total: Rs ".number_format($quotation->total_amount, 2).'. Thank you!';
                $whatsapp->send($quotation->customer_phone, $customerMsg);
            }
        }
    }
}
