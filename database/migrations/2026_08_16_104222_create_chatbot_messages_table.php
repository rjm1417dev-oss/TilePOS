<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chatbot_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('context')->default('tenant'); // tenant | super-admin
            $table->string('role'); // user | assistant
            $table->text('content');
            $table->string('message_type')->nullable(); // sql, knowledge, error, refusal
            $table->json('metadata')->nullable(); // sql, results, sources, model, tokens
            $table->timestamps();

            $table->index(['user_id', 'tenant_id', 'context', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_messages');
    }
};
