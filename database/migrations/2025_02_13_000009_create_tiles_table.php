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
        Schema::create('tiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade');
            $table->foreignId('brand_id')->constrained('brands')->onDelete('cascade');
            $table->string('tile_code', 100)->nullable();
            $table->foreignId('size_id')->constrained('sizes')->onDelete('cascade');
            $table->decimal('packing_m2', 10, 2)->nullable();
            $table->integer('no_of_tiles_per_box')->nullable();
            $table->decimal('cost_per_m2', 10, 2)->nullable();
            $table->decimal('price_per_box', 10, 2)->nullable();
            $table->string('image', 255)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tiles');
    }
};
