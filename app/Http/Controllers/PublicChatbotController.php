<?php

namespace App\Http\Controllers;

use App\Services\Chatbot\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class PublicChatbotController extends Controller
{
    public function __construct(
        protected ChatbotService $chatbot
    ) {}

    /**
     * Handle a public website chatbot message.
     *
     * This endpoint:
     * - Requires NO authentication (available to all visitors)
     * - Has NO database access (only static knowledge base)
     * - Is rate-limited by IP address
     * - Never returns SQL queries or business data
     */
    public function message(Request $request): JsonResponse
    {
        $this->ensureNotRateLimited($request);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        // Public bot uses session-based history (no DB storage for unauthenticated visitors).
        $history = $request->session()->get('public_chatbot_history', []);

        try {
            $answer = $this->chatbot->handlePublicMessage(
                $validated['message'],
                $history
            );
        } catch (RuntimeException $e) {
            $code = $e->getCode();

            if ($code === 429) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'type' => 'error',
                    'sql' => null,
                    'sources' => [],
                ], 429);
            }

            return response()->json([
                'message' => 'The assistant is temporarily unavailable. Please try again in a moment.',
                'type' => 'error',
                'sql' => null,
                'sources' => [],
            ], 503);
        }

        // Append to session history (keep last 8 turns).
        $history[] = ['role' => 'user', 'content' => $validated['message']];
        $history[] = ['role' => 'assistant', 'content' => $answer['text']];
        $history = array_slice($history, -16); // Keep last 8 turns (16 messages)
        $request->session()->put('public_chatbot_history', $history);

        return response()->json([
            'message' => $answer['text'],
            'type' => $answer['type'],
            'sql' => null,   // Public bot never returns SQL
            'sources' => $answer['sources'],
        ]);
    }

    /**
     * Enforce rate limiting for the public chatbot (by IP address only).
     */
    protected function ensureNotRateLimited(Request $request): void
    {
        $key = 'public-chatbot:'.$request->ip();
        $maxAttempts = config('chatbot.limits.public_messages_per_minute', 20);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'message' => ["Too many messages. Please wait {$seconds} seconds before trying again."],
            ]);
        }

        RateLimiter::hit($key, 60);
    }
}
