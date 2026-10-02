<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OverduePayablesMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public int $count,
        public float $total,
        public string $businessName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Overdue Payables Reminder - '.$this->businessName,
        );
    }

    public function content(): \Illuminate\Mail\Mailables\Content
    {
        return new \Illuminate\Mail\Mailables\Content(
            markdown: 'emails.overdue-payables',
        );
    }
}
