<?php

namespace App\Providers;

use App\Listeners\RecordFailedLoginAttempt;
use App\Listeners\RecordLoginActivity;
use App\Services\SystemSettings;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureGates();
        $this->configureRateLimiters();
        $this->applySmtpOverrides();
        Event::listen(Failed::class, RecordFailedLoginAttempt::class);
        Event::listen(Login::class, RecordLoginActivity::class);
    }

    protected function configureRateLimiters(): void
    {
        RateLimiter::for('chatbot', function ($request) {
            return Limit::perMinute(config('chatbot.limits.messages_per_minute', 30))
                ->by($request->user()?->id ?: $request->ip());
        });
    }

    protected function applySmtpOverrides(): void
    {
        try {
            $host = SystemSettings::get('smtp_host');
            if (! empty($host)) {
                $smtp = SystemSettings::smtpConfig();
                config([
                    'mail.mailers.super_admin_smtp' => array_merge(
                        config('mail.mailers.smtp', []),
                        [
                            'transport' => 'smtp',
                            'host' => $smtp['host'],
                            'port' => (int) $smtp['port'],
                            'encryption' => $smtp['encryption'] ?? null,
                            'username' => $smtp['username'] ?? null,
                            'password' => $smtp['password'] ?? null,
                        ]
                    ),
                ]);
                config(['mail.default' => 'super_admin_smtp']);
            }
        } catch (\Throwable) {
            // SystemSettings may not be available (e.g. during migrations)
        }
    }

    protected function configureGates(): void
    {
        Gate::before(function ($user, string $ability) {
            if ($user?->isSuperAdmin()) {
                return true;
            }
        });

        Gate::policy(\Spatie\Permission\Models\Role::class, \App\Policies\RolePolicy::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
