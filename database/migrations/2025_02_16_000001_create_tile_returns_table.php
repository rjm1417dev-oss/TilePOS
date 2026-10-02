<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tile_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade');
            $table->string('receipt_number')->unique();
            $table->enum('type', ['return', 'exchange']);
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('return_tile_id')->constrained('tiles')->cascadeOnDelete();
            $table->integer('return_no_of_boxes')->default(0);
            $table->integer('return_no_of_tiles')->default(0);
            $table->decimal('return_total_amount', 12, 2)->default(0);
            $table->string('return_payment_method')->nullable();
            $table->text('return_notes')->nullable();

            $table->foreignId('exchange_tile_id')->nullable()->constrained('tiles')->nullOnDelete();
            $table->integer('exchange_no_of_boxes')->nullable();
            $table->integer('exchange_no_of_tiles')->nullable();
            $table->decimal('exchange_total_amount', 12, 2)->nullable();
            $table->decimal('payment_difference', 12, 2)->nullable();
            $table->string('payment_status')->nullable();
            $table->string('exchange_payment_method')->nullable();
            $table->text('exchange_remarks')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tile_returns');
    }
};
