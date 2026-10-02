<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quotation_id')->constrained('quotations')->onDelete('cascade');
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade');

            $table->enum('item_type', ['tile', 'product'])->default('tile');

            $table->foreignId('tile_id')->nullable()->constrained('tiles')->onDelete('set null');
            $table->string('room_type')->nullable();
            $table->string('surface_type')->nullable();
            $table->decimal('length', 10, 2)->nullable();
            $table->decimal('width', 10, 2)->nullable();
            $table->decimal('height', 10, 2)->nullable();
            $table->string('unit', 10)->nullable()->default('ft');
            $table->decimal('total_area', 10, 2)->nullable();
            $table->decimal('total_area_m2', 10, 2)->nullable();
            $table->integer('tiles_needed')->nullable();
            $table->integer('wastage_percentage')->nullable();
            $table->integer('wastage_tiles')->nullable();
            $table->integer('total_tiles_with_wastage')->nullable();
            $table->integer('boxes_required')->nullable();
            $table->integer('loose_tiles')->default(0);
            $table->decimal('price_per_box', 10, 2)->nullable();

            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');

            $table->string('item_name', 255);
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 12, 2);

            $table->integer('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotation_items');
    }
};
