<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade');
            $table->foreignId('stock_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tile_id')->nullable()->constrained('tiles')->nullOnDelete();
            $table->string('action')->default('adjustment');
            $table->integer('quantity_before')->default(0);
            $table->integer('quantity_change')->default(0);
            $table->integer('quantity_after')->default(0);
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_logs');
    }
};
