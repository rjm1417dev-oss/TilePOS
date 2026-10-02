<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    public function send(string $to, string $message): bool
    {
        if (! config('services.whatsapp.enabled')) {
            Log::debug('WhatsApp disabled, skipping send to '.$to);

            return false;
        }

        $sid = config('services.whatsapp.account_sid');
        $token = config('services.whatsapp.auth_token');
        $from = config('services.whatsapp.from');

        if (! $sid || ! $token || ! $from) {
            Log::warning('WhatsApp not configured: missing Twilio credentials');

            return false;
        }

        $phone = $this->normalizePhone($to);
        if (! $phone) {
            Log::warning('Invalid WhatsApp recipient: '.$to);

            return false;
        }

        $fromFormatted = str_starts_with($from, 'whatsapp:') ? $from : 'whatsapp:'.$from;
        $url = "https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json";

        $response = Http::asForm()
            ->withBasicAuth($sid, $token)
            ->post($url, [
                'To' => 'whatsapp:'.$phone,
                'From' => $fromFormatted,
                'Body' => $message,
            ]);

        if (! $response->successful()) {
            Log::error('WhatsApp send failed', [
                'to' => $to,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            return false;
        }

        return true;
    }

    protected function normalizePhone(string $phone): ?string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        if (strlen($phone) < 10) {
            return null;
        }
        if (str_starts_with($phone, '0')) {
            $phone = '92'.substr($phone, 1);
        } elseif (! str_starts_with($phone, '+') && ! str_starts_with($phone, '92')) {
            $phone = '92'.$phone;
        }

        return '+'.ltrim($phone, '+');
    }
}
