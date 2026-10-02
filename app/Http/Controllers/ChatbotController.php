<?php

namespace App\Http\Controllers;

use App\Models\ChatbotMessage;
use App\Services\Chatbot\ChatbotPermissionMapper;
use App\Services\Chatbot\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class ChatbotController extends Controller
{
    public function __construct(
        protected ChatbotService $chatbot
    ) {}

    /**
     * Handle a tenant chatbot message.
     */
    public function tenantMessage(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || $user->tenant_id === null) {
            return response()->json(['message' => 'Tenant access required.'], 403);
        }

        $this->ensureNotRateLimited($request);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $history = $this->loadHistory($user->id, $user->tenant_id, 'tenant');
        $history[] = ['role' => 'user', 'content' => $validated['message']];

        try {
            $answer = $this->chatbot->handleTenantMessage(
                $validated['message'],
                $history,
                $user->tenant_id,
                ChatbotPermissionMapper::forUser($user)
            );
        } catch (RuntimeException $e) {
            return $this->handleServiceException($e);
        }

        $this->saveMessage($user->id, $user->tenant_id, 'tenant', 'user', $validated['message'], 'user-message');
        $this->saveMessage(
            $user->id,
            $user->tenant_id,
            'tenant',
            'assistant',
            $answer['text'],
            $answer['type'],
            // Store sql and sources only — not results (prevents metadata bloat).
            [
                'sql' => $answer['sql'],
                'sources' => $answer['sources'],
            ]
        );

        return response()->json([
            'message' => $answer['text'],
            'type' => $answer['type'],
            'sql' => $answer['sql'],
            'sources' => $answer['sources'],
        ]);
    }

    /**
     * Handle a super-admin chatbot message.
     */
    public function superAdminMessage(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! $user->isSuperAdmin()) {
            return response()->json(['message' => 'Super admin access required.'], 403);
        }

        $this->ensureNotRateLimited($request);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $history = $this->loadHistory($user->id, null, 'super-admin');
        $history[] = ['role' => 'user', 'content' => $validated['message']];

        try {
            $answer = $this->chatbot->handleSuperAdminMessage(
                $validated['message'],
                $history,
                ChatbotPermissionMapper::forSuperAdmin()
            );
        } catch (RuntimeException $e) {
            return $this->handleServiceException($e);
        }

        $this->saveMessage($user->id, null, 'super-admin', 'user', $validated['message'], 'user-message');
        $this->saveMessage(
            $user->id,
            null,
            'super-admin',
            'assistant',
            $answer['text'],
            $answer['type'],
            [
                'sql' => $answer['sql'],
                'sources' => $answer['sources'],
            ]
        );

        return response()->json([
            'message' => $answer['text'],
            'type' => $answer['type'],
            'sql' => $answer['sql'],
            'sources' => $answer['sources'],
        ]);
    }

    /**
     * Load recent chat history for a user/context.
     *
     * @return array<int, array{role: string, content: string}>
     */
    protected function loadHistory(int $userId, ?int $tenantId, string $context, int $limit = 10): array
    {
        return ChatbotMessage::where('user_id', $userId)
            ->where('context', $context)
            ->when($tenantId !== null, fn ($q) => $q->where('tenant_id', $tenantId))
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->sortBy('created_at')
            ->map(fn (ChatbotMessage $msg) => [
                'role' => $msg->role,
                'content' => $msg->content,
            ])
            ->values()
            ->toArray();
    }

    /**
     * Save a chat message to the audit log.
     */
    protected function saveMessage(
        int $userId,
        ?int $tenantId,
        string $context,
        string $role,
        string $content,
        ?string $messageType = null,
        ?array $metadata = null
    ): void {
        ChatbotMessage::create([
            'user_id' => $userId,
            'tenant_id' => $tenantId,
            'context' => $context,
            'role' => $role,
            'content' => $content,
            'message_type' => $messageType,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Enforce rate limiting for chatbot messages.
     */
    protected function ensureNotRateLimited(Request $request): void
    {
        $key = 'chatbot:'.$request->user()?->id.':'.$request->ip();
        $maxAttempts = config('chatbot.limits.messages_per_minute', 30);

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'message' => ["Too many messages. Please wait {$seconds} seconds before trying again."],
            ]);
        }

        RateLimiter::hit($key, 60);
    }

    /**
     * Handle RuntimeExceptions from the chatbot service layer (e.g. Groq API errors).
     * Returns a proper JSON error response instead of a 500.
     */
    protected function handleServiceException(RuntimeException $e): JsonResponse
    {
        $code = $e->getCode();

        // 429 = rate limited by Groq API
        if ($code === 429) {
            return response()->json([
                'message' => $e->getMessage(),
                'type' => 'error',
                'sql' => null,
                'sources' => [],
            ], 429);
        }

        return response()->json([
            'message' => 'The AI assistant is temporarily unavailable. Please try again in a moment.',
            'type' => 'error',
            'sql' => null,
            'sources' => [],
        ], 503);
    }
}
