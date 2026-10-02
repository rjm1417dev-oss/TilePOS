<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use App\Models\FeatureFlag;
use App\Services\SystemSettings;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function profile(Request $request): Response
    {
        return Inertia::render('super-admin/settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profileImage' => $request->user()?->profile_image,
        ]);
    }

    public function password(): Response
    {
        return Inertia::render('super-admin/settings/password');
    }

    public function twoFactor(TwoFactorAuthenticationRequest $request): Response
    {
        $request->ensureStateIsValid();

        return Inertia::render('super-admin/settings/two-factor', [
            'twoFactorEnabled' => $request->user()->hasEnabledTwoFactorAuthentication(),
            'requiresConfirmation' => \Laravel\Fortify\Features::optionEnabled(
                \Laravel\Fortify\Features::twoFactorAuthentication(),
                'confirm'
            ),
        ]);
    }

    public function appearance(): Response
    {
        return Inertia::render('super-admin/settings/appearance');
    }

    public function dataPrivacy(): Response
    {
        return Inertia::render('super-admin/settings/data-privacy', [
            'activity_log_retention_days' => SystemSettings::activityLogRetentionDays(),
            'failed_login_retention_days' => SystemSettings::failedLoginRetentionDays(),
        ]);
    }

    public function global(): Response
    {
        $featureFlags = FeatureFlag::whereNull('tenant_id')->get(['key', 'enabled']);

        return Inertia::render('super-admin/settings/global', [
            'maintenance_mode' => SystemSettings::maintenanceMode(),
            'maintenance_message' => SystemSettings::maintenanceMessage(),
            'force_super_admin_2fa' => SystemSettings::forceSuperAdmin2fa(),
            'super_admin_ip_whitelist' => implode("\n", SystemSettings::superAdminIpWhitelist()),
            'smtp' => [
                'host' => SystemSettings::get('smtp_host', config('mail.mailers.smtp.host')),
                'port' => SystemSettings::get('smtp_port', config('mail.mailers.smtp.port')),
                'encryption' => SystemSettings::get('smtp_encryption', config('mail.mailers.smtp.encryption')),
                'username' => SystemSettings::get('smtp_username', config('mail.mailers.smtp.username')),
            ],
            'feature_flags' => $featureFlags->pluck('enabled', 'key'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'maintenance_mode' => ['boolean'],
            'maintenance_message' => ['nullable', 'string', 'max:500'],
            'force_super_admin_2fa' => ['boolean'],
            'super_admin_ip_whitelist' => ['nullable', 'string'],
            'smtp_host' => ['nullable', 'string'],
            'smtp_port' => ['nullable', 'integer'],
            'smtp_encryption' => ['nullable', 'string', 'in:tls,ssl,null'],
            'smtp_username' => ['nullable', 'string'],
            'smtp_password' => ['nullable', 'string'],
        ]);

        SystemSettings::set('maintenance_mode', $request->boolean('maintenance_mode'));
        SystemSettings::set('maintenance_message', $request->maintenance_message ?: null);
        SystemSettings::set('force_super_admin_2fa', $request->boolean('force_super_admin_2fa'));

        $whitelist = $request->super_admin_ip_whitelist
            ? array_filter(array_map('trim', explode("\n", $request->super_admin_ip_whitelist)))
            : [];
        SystemSettings::set('super_admin_ip_whitelist', $whitelist);

        foreach (['smtp_host', 'smtp_port', 'smtp_encryption', 'smtp_username'] as $key) {
            SystemSettings::set($key, $request->input($key));
        }
        if ($request->filled('smtp_password')) {
            SystemSettings::set('smtp_password', $request->smtp_password);
        }

        return back()->with('success', 'Settings saved.');
    }

    public function testSmtp(Request $request): RedirectResponse
    {
        try {
            Mail::raw('Test email from Super Admin panel.', function ($message) use ($request) {
                $message->to($request->user()->email)
                    ->subject('SMTP Test');
            });

            return back()->with('success', 'Test email sent to '.$request->user()->email);
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to send: '.$e->getMessage());
        }
    }

    public function updateRetention(Request $request): RedirectResponse
    {
        $request->validate([
            'activity_log_retention_days' => ['required', 'integer', 'min:7', 'max:730'],
            'failed_login_retention_days' => ['required', 'integer', 'min:7', 'max:365'],
        ]);

        SystemSettings::set('activity_log_retention_days', $request->integer('activity_log_retention_days'));
        SystemSettings::set('failed_login_retention_days', $request->integer('failed_login_retention_days'));

        return back()->with('success', 'Retention policy updated.');
    }

    public function updateFeatureFlags(Request $request): RedirectResponse
    {
        $flags = $request->input('flags', []);
        foreach ($flags as $key => $enabled) {
            FeatureFlag::updateOrCreate(
                ['key' => $key, 'tenant_id' => null],
                ['enabled' => (bool) $enabled]
            );
        }

        return back()->with('success', 'Feature flags updated.');
    }
}
