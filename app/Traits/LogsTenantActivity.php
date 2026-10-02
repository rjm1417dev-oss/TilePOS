<?php

namespace App\Traits;

use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

trait LogsTenantActivity
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        $modelName = class_basename(static::class);

        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => match ($eventName) {
                'created' => "Created {$modelName}",
                'updated' => "Updated {$modelName}",
                'deleted' => "Deleted {$modelName}",
                'restored' => "Restored {$modelName}",
                default => $eventName,
            });
    }
}
