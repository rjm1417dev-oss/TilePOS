<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestLatencyLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'path',
        'duration_ms',
        'status_code',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }
}
