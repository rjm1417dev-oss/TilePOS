<?php

namespace App\Services\Chatbot;

use Illuminate\Support\Facades\Log;

class SqlValidator
{
    /**
     * Forbidden SQL keywords that are not allowed in generated queries.
     *
     * @var array<int, string>
     */
    protected array $forbiddenKeywords = [
        'drop',
        'delete',
        'truncate',
        'update',
        'insert',
        'replace',
        'alter',
        'create',
        'grant',
        'revoke',
        'exec',
        'execute',
        'load_file',
        'into outfile',
        'into dumpfile',
    ];

    public function __construct(
        protected array $allowedTables
    ) {}

    /**
     * Validate a generated SQL query before execution.
     */
    public function validate(string $sql): bool
    {
        $normalized = strtolower($sql);

        foreach ($this->forbiddenKeywords as $keyword) {
            if (preg_match('/\b'.preg_quote($keyword, '/').'\b/', $normalized)) {
                Log::warning('Chatbot SQL rejected: forbidden keyword', [
                    'keyword' => $keyword,
                    'sql' => $sql,
                ]);

                return false;
            }
        }

        // Only SELECT statements are allowed.
        if (! preg_match('/^\s*select\b/', $normalized)) {
            Log::warning('Chatbot SQL rejected: not a SELECT statement', ['sql' => $sql]);

            return false;
        }

        // Ensure all referenced tables are in the allowed list.
        $tables = $this->extractTables($sql);
        foreach ($tables as $table) {
            if (! in_array($table, $this->allowedTables, true)) {
                Log::warning('Chatbot SQL rejected: disallowed table', [
                    'table' => $table,
                    'sql' => $sql,
                ]);

                return false;
            }
        }

        // Cap LIMIT values to prevent huge result sets.
        if (preg_match('/\blimit\s+(\d+)\s*,?\s*(\d+)?\b/i', $sql, $matches)) {
            $limit = isset($matches[2]) ? (int) $matches[2] : (int) $matches[1];
            $maxLimit = config('chatbot.limits.max_sql_rows', 100);
            if ($limit > $maxLimit) {
                Log::warning('Chatbot SQL rejected: LIMIT too large', [
                    'limit' => $limit,
                    'max' => $maxLimit,
                    'sql' => $sql,
                ]);

                return false;
            }
        }

        return true;
    }

    /**
     * Extract table names from a SELECT query.
     *
     * @return array<int, string>
     */
    public function extractTables(string $sql): array
    {
        $normalized = strtolower($sql);
        $tables = [];

        // FROM table
        if (preg_match_all('/\bfrom\s+`?([a-zA-Z_][a-zA-Z0-9_]*)`?/i', $normalized, $matches)) {
            $tables = array_merge($tables, $matches[1]);
        }

        // JOIN table
        if (preg_match_all('/\bjoin\s+`?([a-zA-Z_][a-zA-Z0-9_]*)`?/i', $normalized, $matches)) {
            $tables = array_merge($tables, $matches[1]);
        }

        return array_unique($tables);
    }
}
