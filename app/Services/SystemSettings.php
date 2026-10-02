<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;

class SystemSettings
{
    protected static string $cacheKey = 'system_settings';

    public static function get(string $key, mixed $default = null): mixed
    {
        $settings = Cache::remember(static::$cacheKey, 60, fn () => SystemSetting::pluck('value', 'key')->toArray());

        $value = $settings[$key] ?? $default;

        return is_string($value) ? json_decode($value, true) ?? $value : $value;
    }

    public static function set(string $key, mixed $value): void
    {
        $encoded = is_array($value) || is_bool($value) ? json_encode($value) : (string) $value;
        SystemSetting::updateOrCreate(['key' => $key], ['value' => $encoded]);
        Cache::forget(static::$cacheKey);
    }

    public static function maintenanceMode(): bool
    {
        return (bool) static::get('maintenance_mode', false);
    }

    public static function maintenanceMessage(): ?string
    {
        return static::get('maintenance_message');
    }

    public static function forceSuperAdmin2fa(): bool
    {
        return (bool) static::get('force_super_admin_2fa', false);
    }

    public static function superAdminIpWhitelist(): array
    {
        $list = static::get('super_admin_ip_whitelist', []);

        return is_array($list) ? $list : (array) $list;
    }

    public static function activityLogRetentionDays(): int
    {
        return (int) static::get('activity_log_retention_days', 90);
    }

    public static function failedLoginRetentionDays(): int
    {
        return (int) static::get('failed_login_retention_days', 30);
    }

    public static function smtpConfig(): array
    {
        return [
            'driver' => static::get('smtp_driver', 'smtp'),
            'host' => static::get('smtp_host', config('mail.mailers.smtp.host')),
            'port' => static::get('smtp_port', config('mail.mailers.smtp.port')),
            'encryption' => static::get('smtp_encryption', config('mail.mailers.smtp.encryption')),
            'username' => static::get('smtp_username', config('mail.mailers.smtp.username')),
            'password' => static::get('smtp_password', config('mail.mailers.smtp.password')),
        ];
    }
}
