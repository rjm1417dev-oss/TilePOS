<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Http\Request;

class RecordLoginActivity
{
    public function __construct(
        protected Request $request
    ) {}

    public function handle(Login $event): void
    {
        if ($this->request->session()->has('impersonator_id')) {
            return;
        }

        activity()
            ->causedBy($event->user)
            ->performedOn($event->user)
            ->event('login')
            ->log('Logged in');
    }
}
