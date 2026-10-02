<?php

namespace App\Console\Commands;

use App\Models\FailedLoginAttempt;
use App\Services\SystemSettings;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanFailedLoginsCommand extends Command
{
    protected $signature = 'failed-logins:clean {--days= : Override retention days}';

    protected $description = 'Delete failed login attempts older than retention policy';

    public function handle(): int
    {
        $days = $this->option('days') !== null
            ? (int) $this->option('days')
            : SystemSettings::failedLoginRetentionDays();
        $cutoff = Carbon::now()->subDays($days);
        $deleted = FailedLoginAttempt::where('attempted_at', '<', $cutoff)->delete();

        $this->info("Deleted {$deleted} failed login record(s) older than {$days} days.");

        return self::SUCCESS;
    }
}
