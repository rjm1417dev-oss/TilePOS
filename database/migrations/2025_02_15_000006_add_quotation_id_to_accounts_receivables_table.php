<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('accounts_receivables', function (Blueprint $table) {
            $table->foreignId('quotation_id')->nullable()->after('tenant_id')->constrained('quotations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('accounts_receivables', function (Blueprint $table) {
            $table->dropForeign(['quotation_id']);
        });
    }
};
