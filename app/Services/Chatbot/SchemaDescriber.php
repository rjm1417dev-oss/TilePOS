<?php

namespace App\Services\Chatbot;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SchemaDescriber
{
    /**
     * Cache the schema structure (column definitions) for one hour.
     * The tenant-specific scope note is appended dynamically — never cached —
     * to prevent one tenant's schema description leaking to another tenant.
     */
    protected const CACHE_TTL_SECONDS = 3600;

    /**
     * Build a compact schema description for the allowed tables.
     *
     * @param  array<int, string>  $tables
     */
    public function describe(array $tables, ?int $tenantId = null): string
    {
        sort($tables);

        // Cache key covers only the table list — NOT the tenantId.
        // This prevents cross-tenant schema description sharing where one
        // tenant's "tenant_id = X" scope note bakes into another's cached entry.
        $key = 'chatbot:schema:structure:'.md5(implode(',', $tables));

        $structure = Cache::remember($key, self::CACHE_TTL_SECONDS, function () use ($tables) {
            return $this->buildStructure($tables);
        });

        // Append tenant scope note at runtime (not cached).
        return $this->appendScopeNote($structure, $tables, $tenantId);
    }

    /**
     * Build the table structure descriptions without any tenant-specific scope notes.
     * This is the cacheable portion of the schema description.
     *
     * @param  array<int, string>  $tables
     */
    protected function buildStructure(array $tables): string
    {
        $descriptions = [];

        foreach ($tables as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }

            $columns = Schema::getColumns($table);
            $columnLines = [];

            foreach ($columns as $column) {
                $type = $column['type'] ?? 'unknown';
                $name = $column['name'];
                $nullable = ($column['nullable'] ?? false) ? ' NULL' : ' NOT NULL';
                $columnLines[] = "  - {$name}: {$type}{$nullable}";
            }

            $hasTenantId = in_array('tenant_id', array_column($columns, 'name'), true);
            $description = "Table: {$table}\n".implode("\n", $columnLines);

            if ($hasTenantId) {
                $description .= "\n  note: this table is scoped per tenant via tenant_id column";
            }

            $descriptions[] = $description;
        }

        return "Database schema:\n\n".implode("\n\n", $descriptions);
    }

    /**
     * Append a runtime scope annotation to the schema description.
     * This is NOT cached — it is added fresh for every call.
     *
     * @param  array<int, string>  $tables
     */
    protected function appendScopeNote(string $structure, array $tables, ?int $tenantId): string
    {
        if ($tenantId !== null) {
            return $structure."\n\nIMPORTANT: All queries must include WHERE tenant_id = {$tenantId} for every table that has a tenant_id column.";
        }

        return $structure."\n\nIMPORTANT: This is a super-admin context. Do NOT filter by a specific tenant_id. Aggregate across all tenants.";
    }

    /**
     * Get a few sample rows for a table to help the model understand data shape.
     *
     * @return array<int, array<string, mixed>>
     */
    public function sampleRows(string $table, int $limit = 3): array
    {
        if (! Schema::hasTable($table)) {
            return [];
        }

        return DB::table($table)->limit($limit)->get()->map(fn ($row) => (array) $row)->toArray();
    }
}
