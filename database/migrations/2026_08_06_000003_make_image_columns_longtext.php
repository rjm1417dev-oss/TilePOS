<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE tenants MODIFY logo LONGTEXT NULL');
            DB::statement('ALTER TABLE users MODIFY profile_image LONGTEXT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE tenants MODIFY logo TEXT NULL');
            DB::statement('ALTER TABLE users MODIFY profile_image TEXT NULL');
        }
    }
};
