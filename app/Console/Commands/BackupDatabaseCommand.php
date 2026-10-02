<?php

namespace App\Console\Commands;

use App\Services\DatabaseBackupService;
use Illuminate\Console\Command;

class BackupDatabaseCommand extends Command
{
    protected $signature = 'backup:database
                            {--keep=7 : Number of days to retain backups}
                            {--path= : Custom backup directory (default: storage/app/backups)}';

    protected $description = 'Create a full database backup and store in storage/app/backups';

    public function handle(DatabaseBackupService $backup): int
    {
        $basePath = $this->option('path') ?? storage_path('app/backups');
        $keepDays = (int) $this->option('keep');

        try {
            $path = $backup->createToFile($basePath);
            $this->info('Backup created: '.$path);

            $this->pruneOldBackups($basePath, $keepDays);

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error('Backup failed: '.$e->getMessage());

            return self::FAILURE;
        }
    }

    protected function pruneOldBackups(string $directory, int $keepDays): void
    {
        if (! is_dir($directory)) {
            return;
        }

        $cutoff = now()->subDays($keepDays)->getTimestamp();

        foreach (glob($directory.'/*') as $file) {
            if (is_file($file) && filemtime($file) < $cutoff) {
                unlink($file);
                $this->line('Pruned: '.basename($file));
            }
        }
    }
}
