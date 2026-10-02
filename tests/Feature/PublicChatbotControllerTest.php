<?php

namespace Tests\Feature;

use App\Services\Chatbot\ChatbotService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PublicChatbotControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(['throttle']);
        config(['chatbot.groq.api_key' => 'test-api-key']);
    }

    public function test_guests_can_use_public_chatbot(): void
    {
        $mockService = Mockery::mock(ChatbotService::class);
        $mockService->shouldReceive('handlePublicMessage')
            ->once()
            ->andReturn([
                'text' => 'TilePOS is a business management platform for the tiles industry.',
                'type' => 'knowledge',
                'sql' => null,
                'results' => [],
                'sources' => [],
            ]);

        $this->app->instance(ChatbotService::class, $mockService);

        $response = $this->postJson('/chatbot/public', [
            'message' => 'What is this platform?',
        ]);

        $response->assertOk();
        $response->assertJson([
            'message' => 'TilePOS is a business management platform for the tiles industry.',
            'type' => 'knowledge',
            'sql' => null,
            'sources' => [],
        ]);
    }

    public function test_authenticated_users_can_also_use_public_chatbot(): void
    {
        $mockService = Mockery::mock(ChatbotService::class);
        $mockService->shouldReceive('handlePublicMessage')
            ->once()
            ->andReturn([
                'text' => 'Our pricing plans start from...',
                'type' => 'knowledge',
                'sql' => null,
                'results' => [],
                'sources' => [],
            ]);

        $this->app->instance(ChatbotService::class, $mockService);

        $user = \App\Models\User::factory()->create();

        // Authenticated users should also be able to use the public chatbot.
        $response = $this->actingAs($user)->postJson('/chatbot/public', [
            'message' => 'What are your pricing plans?',
        ]);

        $response->assertOk();
    }

    public function test_public_chatbot_never_returns_sql(): void
    {
        $mockService = Mockery::mock(ChatbotService::class);
        $mockService->shouldReceive('handlePublicMessage')
            ->once()
            ->andReturn([
                'text' => 'I can only answer questions about the platform.',
                'type' => 'refusal',
                'sql' => null,
                'results' => [],
                'sources' => [],
            ]);

        $this->app->instance(ChatbotService::class, $mockService);

        $response = $this->postJson('/chatbot/public', [
            'message' => 'What are my total sales?',
        ]);

        $response->assertOk();
        $response->assertJson(['sql' => null]);
    }

    public function test_public_chatbot_requires_message(): void
    {
        $response = $this->postJson('/chatbot/public', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['message']);
    }

    public function test_public_chatbot_message_max_length(): void
    {
        $response = $this->postJson('/chatbot/public', [
            'message' => str_repeat('a', 1001),
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['message']);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
