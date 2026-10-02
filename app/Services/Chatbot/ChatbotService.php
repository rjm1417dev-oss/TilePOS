<?php

namespace App\Services\Chatbot;

use Illuminate\Support\Facades\Log;

class ChatbotService
{
    public function __construct(
        protected ChatbotRouter $router,
        protected SqlAgent $sqlAgent,
        protected KnowledgeService $knowledgeService,
    ) {}

    /**
     * Process a tenant chatbot message.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     * @return array{text: string, type: string, sql: string|null, results: array<int, mixed>, sources: array<int, mixed>}
     */
    public function handleTenantMessage(string $question, array $history, int $tenantId, ?array $allowedTables = null): array
    {
        $type = $this->router->classify($question);

        if ($type === ChatbotRouter::TYPE_OFF_TOPIC) {
            return [
                'text' => 'I can only help with questions about your business data or how to use the app. Please ask about sales, stock, customers, orders, or app features.',
                'type' => 'refusal',
                'sql' => null,
                'results' => [],
                'sources' => [],
            ];
        }

        if ($type === ChatbotRouter::TYPE_KNOWLEDGE) {
            $answer = $this->knowledgeService->answer(
                $question,
                config('chatbot.tenant.knowledge', []),
                $history,
                config('chatbot.models.tenant_knowledge')
            );

            return [
                'text' => $answer['text'],
                'type' => 'knowledge',
                'sql' => null,
                'results' => [],
                'sources' => $answer['sources'],
            ];
        }

        // Data query — use the higher-capability model for SQL generation.
        $answer = $this->sqlAgent->answer(
            $question,
            $history,
            $allowedTables ?? config('chatbot.tenant.allowed_tables', []),
            $tenantId,
            config('chatbot.models.tenant_sql')
        );

        return [
            'text' => $answer['text'],
            'type' => 'sql',
            'sql' => $answer['sql'],
            'results' => $answer['results'],
            'sources' => [],
        ];
    }

    /**
     * Process a super-admin chatbot message.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     * @return array{text: string, type: string, sql: string|null, results: array<int, mixed>, sources: array<int, mixed>}
     */
    public function handleSuperAdminMessage(string $question, array $history, ?array $allowedTables = null): array
    {
        // NL-level guard: log suspicious questions but rely on SQL-layer enforcement.
        // The SQL validator's hasSpecificTenantFilter() is the real enforcement.
        if ($this->mentionsSpecificTenant($question)) {
            Log::info('Chatbot: super admin question mentions specific tenant (NL guard triggered)', [
                'question' => $question,
            ]);

            return [
                'text' => "For privacy and security, I can't answer questions about a specific tenant's data. Ask about system-wide totals, tenants as a group, or admin features instead.",
                'type' => 'refusal',
                'sql' => null,
                'results' => [],
                'sources' => [],
            ];
        }

        $type = $this->router->classify($question);

        if ($type === ChatbotRouter::TYPE_OFF_TOPIC) {
            return [
                'text' => 'I can only help with questions about the platform data or how to use the admin panel. Please ask about tenants, system activity, or admin features.',
                'type' => 'refusal',
                'sql' => null,
                'results' => [],
                'sources' => [],
            ];
        }

        if ($type === ChatbotRouter::TYPE_KNOWLEDGE) {
            $answer = $this->knowledgeService->answer(
                $question,
                config('chatbot.super_admin.knowledge', []),
                $history,
                config('chatbot.models.super_admin_knowledge')
            );

            return [
                'text' => $answer['text'],
                'type' => 'knowledge',
                'sql' => null,
                'results' => [],
                'sources' => $answer['sources'],
            ];
        }

        $answer = $this->sqlAgent->answer(
            $question,
            $history,
            $allowedTables ?? config('chatbot.super_admin.allowed_tables', []),
            null, // No tenantId — super admin queries all tenants
            config('chatbot.models.super_admin_sql')
        );

        return [
            'text' => $answer['text'],
            'type' => 'sql',
            'sql' => $answer['sql'],
            'results' => $answer['results'],
            'sources' => [],
        ];
    }

    /**
     * Process a public website chatbot message.
     * This path has NO database access — only static knowledge base.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     * @return array{text: string, type: string, sql: string|null, results: array<int, mixed>, sources: array<int, mixed>}
     */
    public function handlePublicMessage(string $question, array $history): array
    {
        // Public bot never routes to SQL — classify only to reject off-topic.
        $type = $this->router->classify($question);

        // Data questions get a friendly redirect message.
        if ($type === ChatbotRouter::TYPE_DATA) {
            return [
                'text' => "I can only answer questions about the platform's features, pricing, and policies. For questions about your business data, please log in and use the in-app assistant.",
                'type' => 'refusal',
                'sql' => null,
                'results' => [],
                'sources' => [],
            ];
        }

        if ($type === ChatbotRouter::TYPE_OFF_TOPIC) {
            return [
                'text' => "I'm only able to answer questions about this platform — its features, pricing, policies, and how it works. Is there anything about the platform I can help with?",
                'type' => 'refusal',
                'sql' => null,
                'results' => [],
                'sources' => [],
            ];
        }

        // Knowledge path — answer from public page content.
        $answer = $this->knowledgeService->answer(
            $question,
            config('chatbot.public.knowledge', []),
            $history,
            config('chatbot.models.public')
        );

        return [
            'text' => $answer['text'],
            'type' => 'knowledge',
            'sql' => null,
            'results' => [],
            'sources' => $answer['sources'],
        ];
    }

    /**
     * Detect if a super-admin question asks about a specific tenant's data.
     * This is a soft NL guard — the SQL-layer check is the authoritative enforcement.
     */
    private function mentionsSpecificTenant(string $question): bool
    {
        // Matches: tenant 1, tenant id 5, tenant_id = 3
        if (preg_match('/\btenant(_|\s*)id\s*(=|:)?\s*\d+/i', $question)) {
            return true;
        }

        if (preg_match('/\btenant\s+\d+\b/i', $question)) {
            return true;
        }

        if (preg_match('/\btenant\s*:\s*.+/i', $question)) {
            return true;
        }

        if (preg_match('/\bfor\s+tenant\s+\w+/i', $question)) {
            return true;
        }

        return false;
    }
}
