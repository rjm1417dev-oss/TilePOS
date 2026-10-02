<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade');
            $table->string('quotation_number', 50);
            $table->enum('type', ['quotation', 'invoice'])->default('quotation');
            $table->integer('items_count')->default(0);

            $table->foreignId('customer_id')->nullable()->constrained('customers')->onDelete('set null');

            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('tax_percentage', 5, 2)->default(0);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);

            $table->string('payment_method')->nullable();
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('remaining_amount', 12, 2)->default(0);

            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->text('customer_address')->nullable();
            $table->string('customer_cnic', 20)->nullable();
            $table->text('notes')->nullable();

            $table->date('invoice_date')->nullable();
            $table->date('due_date')->nullable();

            $table->timestamps();

            $table->unique(['tenant_id', 'quotation_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};
