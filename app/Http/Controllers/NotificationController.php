<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markAsRead(Request $request): RedirectResponse
    {
        $types = $request->input('types', []);

        if (! is_array($types)) {
            $types = [];
        }

        $valid = ['low_stock', 'payables', 'receivables', 'failed_logins', 'new_tenants', 'expiring_trials'];
        $types = array_values(array_intersect($types, $valid));

        $read = $request->session()->get('notification_read_types', []);
        $read = array_unique(array_merge($read, $types));
        $request->session()->put('notification_read_types', $read);

        $redirect = $request->input('redirect');
        if (is_string($redirect) && $redirect !== '') {
            $allowedHost = parse_url(config('app.url'), PHP_URL_HOST) ?? $request->getHost();
            $redirectHost = parse_url($redirect, PHP_URL_HOST);
            $isRelative = str_starts_with($redirect, '/');
            $isSameOrigin = $redirectHost === null || $redirectHost === $allowedHost;
            if ($isRelative || $isSameOrigin) {
                return redirect()->to($redirect);
            }
        }

        return back();
    }
}
