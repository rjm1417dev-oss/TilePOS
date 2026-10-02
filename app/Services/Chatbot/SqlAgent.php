<?php

namespace App\Services\Chatbot;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class SqlAgent
{
    public function __construct(
        protected GroqClient $groq,
        protected SchemaDescriber $schemaDescriber,
    ) {}

    /**
     * Convert a natural-language question into a validated SQL query,
     * execute it, and summarize the results.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     * @param  string|null  $model  Groq model override for SQL generation.
     * @return array{text: string, sql: string|null, results: array<int, mixed>}
     */
    public function answer(
        string $question,
        array $history,
        array $allowedTables,
        ?int $tenantId = null,
        ?string $model = null
    ): array {
        $schema = $this->schemaDescriber->describe($allowedTables, $tenantId);
        $systemPrompt = $this->buildSqlSystemPrompt($schema, $tenantId);
        $messages = $this->buildMessages($systemPrompt, $history, $question);

        $response = $this->groq->generate($messages, [
            // We intentionally do not use 'response_format' => ['type' => 'json_object']
            // because models like Qwen3 output <think> tags which break strict JSON validation.
        ], $model);

        // Extract both sql AND answer from the single LLM response.
        // The prompt asks for { "sql": "...", "answer": "..." } — use both,
        // eliminating the need for a second summarize() API call.
        ['sql' => $sql, 'answer' => $llmAnswer] = $this->extractSqlAndAnswer($response['text']);

        if ($sql === null) {
            Log::warning('Chatbot SQL agent did not return a SQL query', [
                'question' => $question,
                'response' => $response['text'],
            ]);

            // If the LLM gave a text answer (e.g. clarification request) use it.
            return [
                'text' => $llmAnswer ?? "I couldn't build a database query for that question. Please rephrase it.",
                'sql' => null,
                'results' => [],
            ];
        }

        $validator = new SqlValidator($allowedTables);

        if (! $validator->validate($sql)) {
            return [
                'text' => "For security reasons, I can't run that query. Please ask a question about your business data.",
                'sql' => null,
                'results' => [],
            ];
        }

        // Super admins must not query data filtered by a specific tenant_id.
        if ($tenantId === null && $this->hasSpecificTenantFilter($sql)) {
            Log::warning('Chatbot SQL rejected: super admin tried to filter by specific tenant_id', [
                'sql' => $sql,
            ]);

            return [
                'text' => "For privacy and security, I can't answer questions about a specific tenant's data. Ask about system-wide totals or admin features instead.",
                'sql' => null,
                'results' => [],
            ];
        }

        // For tenant users: enforce tenant scope at the application layer.
        // Instead of just rejecting, we inject the WHERE clause if missing.
        if ($tenantId !== null) {
            $sql = $this->enforceTenantScope($sql, $tenantId, $validator);

            if ($sql === null) {
                Log::warning('Chatbot SQL rejected: could not safely enforce tenant scope', [
                    'tenant_id' => $tenantId,
                ]);

                return [
                    'text' => 'For privacy reasons, I can only answer questions about your own data. Please ask a simpler question.',
                    'sql' => null,
                    'results' => [],
                ];
            }
        }

        try {
            $results = DB::select($sql);
        } catch (QueryException $e) {
            Log::error('Chatbot SQL execution error', [
                'sql' => $sql,
                'error' => $e->getMessage(),
            ]);

            return [
                'text' => 'I ran into a problem while querying your data. Please try a simpler question.',
                'sql' => $sql,
                'results' => [],
            ];
        }

        // We must ALWAYS call summarize() when we have results, because the initial
        // $llmAnswer generated alongside the SQL does not contain the actual data.
        $summary = $this->summarize($question, $sql, $results, $model);

        return [
            'text' => $summary,
            'sql' => $sql,
            'results' => $results,
        ];
    }

    /**
     * Build the system prompt for SQL generation.
     */
    protected function buildSqlSystemPrompt(string $schema, ?int $tenantId = null): string
    {
        $scopeNote = $tenantId !== null
            ? "CRITICAL: You must only read data for tenant_id = {$tenantId}. Add `tenant_id = {$tenantId}` as a standalone condition in the WHERE clause for every table that has a tenant_id column. Do NOT wrap tenant_id in OR/IN subqueries or functions. Always add a LIMIT clause of 100 or less."
            : 'You are querying the whole database across all tenants. Do NOT filter by a specific tenant_id. Only answer system-wide aggregate questions. Always add a LIMIT clause of 100 or less.';

        return <<<PROMPT
You are a helpful SQL assistant for a Laravel/MySQL application.
Your job is to convert the user's question into a single, safe MySQL SELECT query, execute it, and answer based on the returned data.

Rules:
- ONLY generate SELECT statements. Never generate DELETE, UPDATE, INSERT, DROP, ALTER, TRUNCATE, or any other modifying SQL.
- Use only the tables and columns described below.
- Use MySQL syntax.
- Prefer readable queries with JOINs and aliases when needed.
- If the question is ambiguous, ask for clarification in the answer field.
- If the data is not available, say so clearly.
- Always respond in this exact JSON format:
{
  "sql": "SELECT ...",
  "answer": "Human-readable explanation of the query and how to interpret the results"
}
- Do not include markdown code fences around the JSON.

{$scopeNote}

{$schema}
PROMPT;
    }

    /**
     * Build OpenAI/Groq messages from system prompt, history, and current question.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     * @return array<int, array{role: string, content: string}>
     */
    protected function buildMessages(string $systemPrompt, array $history, string $question): array
    {
        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($history as $message) {
            $role = $message['role'] === 'user' ? 'user' : 'assistant';
            $messages[] = ['role' => $role, 'content' => $message['content']];
        }

        $messages[] = ['role' => 'user', 'content' => $question];

        return $messages;
    }

    /**
     * Extract both SQL and the LLM's own answer from the model's JSON response.
     * This eliminates the need for a second summarize() API call in most cases.
     *
     * @return array{sql: string|null, answer: string|null}
     */
    protected function extractSqlAndAnswer(string $text): array
    {
        // First try to parse as JSON.
        $json = $this->sanitizeJson($text);
        $data = json_decode($json, true);

        if (is_array($data)) {
            $sql = ! empty($data['sql']) ? $this->cleanSql($data['sql']) : null;
            $answer = isset($data['answer']) && is_string($data['answer']) ? trim($data['answer']) : null;

            return ['sql' => $sql, 'answer' => $answer];
        }

        // Fallback: extract SQL from markdown code fences.
        if (preg_match('/```sql\s*(.*?)\s*```/s', $text, $matches)) {
            return ['sql' => $this->cleanSql($matches[1]), 'answer' => null];
        }

        // Fallback: extract a raw SELECT statement.
        if (preg_match('/(SELECT\s+.*)/is', $text, $matches)) {
            return ['sql' => $this->cleanSql($matches[1]), 'answer' => null];
        }

        return ['sql' => null, 'answer' => null];
    }

    /**
     * Clean a SQL string by removing trailing content and semicolons.
     */
    protected function cleanSql(string $sql): string
    {
        $sql = trim($sql);
        $sql = preg_replace('/;\s*$/', '', $sql);

        return trim($sql);
    }

    /**
     * Remove markdown formatting around JSON.
     */
    protected function sanitizeJson(string $text): string
    {
        $text = trim($text);
        $text = preg_replace('/^```json\s*/', '', $text);
        $text = preg_replace('/\s*```$/', '', $text);

        return trim($text);
    }

    /**
     * Enforce tenant scope at the application layer for all tenant-scoped tables.
     *
     * Rather than just rejecting queries that are missing the tenant_id clause,
     * we wrap the entire LLM-generated query as a subquery and add the scope filter.
     * This is safer: even if the LLM forgets or is tricked, the data layer enforces it.
     *
     * Returns the (potentially wrapped) SQL, or null if wrapping is not safe
     * (e.g. for queries against tables with no tenant_id — those are allowed as-is).
     */
    protected function enforceTenantScope(string $sql, int $tenantId, SqlValidator $validator): ?string
    {
        $tables = $validator->extractTables($sql);
        $hasTenantScopedTable = false;

        foreach ($tables as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $columns = Schema::getColumns($table);
            $columnNames = array_column($columns, 'name');

            if (in_array('tenant_id', $columnNames, true)) {
                $hasTenantScopedTable = true;
                break;
            }
        }

        // No tenant-scoped tables referenced — allow as-is (e.g. brands, sizes).
        if (! $hasTenantScopedTable) {
            return $sql;
        }

        // Check for obvious bypass attempts in the LLM's SQL.
        if (preg_match('/\btenant_id\s*=\s*\d+\s*\b(or|in)\b/i', $sql)) {
            Log::warning('Chatbot SQL: detected tenant_id bypass attempt', ['sql' => $sql, 'tenant_id' => $tenantId]);

            return null;
        }

        // If the SQL already has the correct tenant_id filter, trust it.
        $tenantValue = preg_quote((string) $tenantId, '/');
        if (preg_match('/\btenant_id\s*=\s*'.$tenantValue.'\b/i', $sql)) {
            return $sql;
        }

        // The SQL is missing the tenant filter — inject it by wrapping as subquery.
        // We add a WHERE clause that limits to the correct tenant. This is an
        // application-layer enforcement that works even if the LLM is tricked.
        $wrapped = "SELECT * FROM ({$sql}) AS _chatbot_scope WHERE _chatbot_scope.tenant_id = {$tenantId}";

        Log::info('Chatbot SQL: injected tenant scope via subquery wrapper', [
            'tenant_id' => $tenantId,
            'original_sql' => $sql,
        ]);

        return $wrapped;
    }

    /**
     * Check if a super-admin query filters by a specific tenant_id.
     */
    protected function hasSpecificTenantFilter(string $sql): bool
    {
        return (bool) preg_match('/\btenant_id\s*=\s*\d+/i', $sql);
    }

    /**
     * Fallback summarize call — only used when the LLM's first response
     * did not include an "answer" field or when results are empty.
     *
     * @param  array<int, mixed>  $results
     */
    protected function summarize(string $question, string $sql, array $results, ?string $model = null): string
    {
        $resultsJson = json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $limit = 5000;
        if (strlen($resultsJson) > $limit) {
            $resultsJson = substr($resultsJson, 0, $limit).'... [truncated]';
        }

        $prompt = <<<PROMPT
The user asked: "{$question}"

I ran this SQL query: {$sql}

Here are the results (JSON):
{$resultsJson}

Please provide a concise, helpful answer in plain English based only on the results above. If the results are empty, say that no matching data was found. Do not make up data.
PROMPT;

        $response = $this->groq->generate([
            ['role' => 'system', 'content' => 'You summarize database query results concisely. Reply with ONLY the summary text in plain English. Do not include markdown, explanations, or thinking.'],
            ['role' => 'user', 'content' => $prompt],
        ], [
            'temperature' => 0.2,
            'maxOutputTokens' => 1024,
        ], $model);

        return trim($response['text']);
    }
}
