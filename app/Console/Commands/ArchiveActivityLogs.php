<?php

namespace App\Console\Commands;

use App\Services\SystemSettings;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Spatie\Activitylog\Models\Activity;

class ArchiveActivityLogs extends Command
{
    protected $signature = 'activity-logs:archive {--days= : Override retention days (uses system setting if omitted)}';

    protected $description = 'Delete activity logs older than retention policy (default 90 days)';

    public function handle(): int
    {
        $days = $this->option('days') !== null
            ? (int) $this->option('days')
            : SystemSettings::activityLogRetentionDays();
        $cutoff = Carbon::now()->subDays($days);
        $deleted = Activity::where('created_at', '<', $cutoff)->delete();

        $this->info("Deleted {$deleted} activity log(s) older than {$days} days.");

        return self::SUCCESS;
    }
}
