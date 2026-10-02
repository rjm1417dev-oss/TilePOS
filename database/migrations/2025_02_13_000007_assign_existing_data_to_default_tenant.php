<?php

use App\Models\Brand;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tenant = Tenant::firstOrCreate(
            [
                'business_email' => 'default@localhost',
            ],
            [
                'business_name' => 'Default Tenant',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );

        User::whereNull('tenant_id')->update(['tenant_id' => $tenant->id]);
        Brand::whereNull('tenant_id')->update(['tenant_id' => $tenant->id]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        User::whereNotNull('tenant_id')->update(['tenant_id' => null]);
        Brand::whereNotNull('tenant_id')->update(['tenant_id' => null]);
    }
};
