<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->timestamp('trial_ends_at')->nullable()->after('is_active');
            $table->string('subscription_status')->default('active')->after('trial_ends_at');
            $table->boolean('maintenance_mode')->default(false)->after('subscription_status');
            $table->text('maintenance_message')->nullable()->after('maintenance_mode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'trial_ends_at',
                'subscription_status',
                'maintenance_mode',
                'maintenance_message',
            ]);
        });
    }
};
