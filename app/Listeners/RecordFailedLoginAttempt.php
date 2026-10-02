<?php

namespace App\Listeners;

use App\Models\FailedLoginAttempt;
use Illuminate\Auth\Events\Failed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RecordFailedLoginAttempt
{
    public function __construct(
        protected Request $request
    ) {}

    public function handle(Failed $event): void
    {
        try {
            FailedLoginAttempt::create([
                'email' => $event->credentials['email'] ?? null,
                'ip_address' => $this->request->ip() ?? 'unknown',
                'user_agent' => $this->request->userAgent(),
                'attempted_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to record login attempt: '.$e->getMessage());
        }
    }
}
