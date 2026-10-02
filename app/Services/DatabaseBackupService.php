<?php

namespace App\Services;

use Illuminate\Support\Facades\Process;

class DatabaseBackupService
{
    /**
     * Create a database backup and save to the given directory.
     * Returns the full path to the backup file.
     */
    public function createToFile(string $directory): string
    {
        $driver = config('database.default');

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            return $this->backupMySql($directory);
        }

        if ($driver === 'sqlite') {
            return $this->backupSqlite($directory);
        }

        throw new \RuntimeException('Database backup is not supported for '.$driver.'.');
    }

    protected function backupMySql(string $directory): string
    {
        $driver = config('database.default');
        $config = config('database.connections.'.$driver);
        $filename = 'database-backup-'.now()->format('Y-m-d-His').'.sql';
        $path = rtrim($directory, '/').'/'.$filename;

        $args = [
            'mysqldump',
            '-h'.($config['host'] ?? '127.0.0.1'),
            '-P'.(string) ($config['port'] ?? 3306),
            '-u'.$config['username'],
            '--single-transaction',
            '--quick',
            '--lock-tables=false',
            $config['database'],
        ];

        $env = [];
        if (! empty($config['password'])) {
            $env['MYSQL_PWD'] = $config['password'];
        }

        $result = Process::run($args, null, $env);

        if (! $result->successful()) {
            throw new \RuntimeException('Database backup failed: '.$result->errorOutput());
        }

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        file_put_contents($path, $result->output());

        return $path;
    }

    protected function backupSqlite(string $directory): string
    {
        $source = config('database.connections.sqlite.database');

        if (! is_file($source)) {
            throw new \RuntimeException('Database file not found.');
        }

        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $filename = 'database-backup-'.now()->format('Y-m-d-His').'.sqlite';
        $path = rtrim($directory, '/').'/'.$filename;

        copy($source, $path);

        return $path;
    }
}
