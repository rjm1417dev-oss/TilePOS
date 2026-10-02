<?php

namespace Database\Seeders;

use App\Models\FeatureFlag;
use Illuminate\Database\Seeder;

class FeatureFlagSeeder extends Seeder
{
    public function run(): void
    {
        $keys = ['tiles', 'quotations', 'tile_returns', 'accounts_payable', 'accounts_receivable'];

        foreach ($keys as $key) {
            FeatureFlag::firstOrCreate(
                ['key' => $key, 'tenant_id' => null],
                ['enabled' => true]
            );
        }
    }
}
