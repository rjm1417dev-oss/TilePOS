<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LowStockAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public int $count,
        public string $businessName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Low Stock Alert - '.$this->businessName,
        );
    }

    public function content(): \Illuminate\Mail\Mailables\Content
    {
        return new \Illuminate\Mail\Mailables\Content(
            markdown: 'emails.low-stock-alert',
        );
    }
}
