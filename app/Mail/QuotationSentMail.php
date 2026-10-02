<?php

namespace App\Mail;

use App\Models\Quotation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class QuotationSentMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Quotation $quotation,
        public string $businessName,
        public bool $isInvoice,
    ) {}

    public function envelope(): Envelope
    {
        $type = $this->isInvoice ? 'Invoice' : 'Quotation';

        return new Envelope(
            subject: "{$type} {$this->quotation->quotation_number} - {$this->businessName}",
        );
    }

    public function content(): \Illuminate\Mail\Mailables\Content
    {
        return new \Illuminate\Mail\Mailables\Content(
            markdown: 'emails.quotation-sent',
        );
    }
}
