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
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $teamForeignKey = $columnNames['team_foreign_key'] ?? 'tenant_id';

        if (Schema::hasTable($tableNames['roles'])) {
            Schema::table($tableNames['roles'], function (Blueprint $table) use ($teamForeignKey) {
                $table->foreign($teamForeignKey)->references('id')->on('tenants')->onDelete('cascade');
            });
        }

        if (Schema::hasTable($tableNames['model_has_roles'])) {
            Schema::table($tableNames['model_has_roles'], function (Blueprint $table) use ($teamForeignKey) {
                $table->foreign($teamForeignKey)->references('id')->on('tenants')->onDelete('cascade');
            });
        }

        if (Schema::hasTable($tableNames['model_has_permissions'])) {
            Schema::table($tableNames['model_has_permissions'], function (Blueprint $table) use ($teamForeignKey) {
                $table->foreign($teamForeignKey)->references('id')->on('tenants')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $teamForeignKey = $columnNames['team_foreign_key'] ?? 'tenant_id';

        if (Schema::hasTable($tableNames['roles'])) {
            Schema::table($tableNames['roles'], fn (Blueprint $table) => $table->dropForeign([$teamForeignKey]));
        }

        if (Schema::hasTable($tableNames['model_has_roles'])) {
            Schema::table($tableNames['model_has_roles'], fn (Blueprint $table) => $table->dropForeign([$teamForeignKey]));
        }

        if (Schema::hasTable($tableNames['model_has_permissions'])) {
            Schema::table($tableNames['model_has_permissions'], fn (Blueprint $table) => $table->dropForeign([$teamForeignKey]));
        }
    }
};
