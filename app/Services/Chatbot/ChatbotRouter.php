<?php

namespace App\Services\Chatbot;

use Illuminate\Support\Facades\Log;

class ChatbotRouter
{
    public const TYPE_DATA = 'data';

    public const TYPE_KNOWLEDGE = 'knowledge';

    public const TYPE_OFF_TOPIC = 'off-topic';

    public function __construct(
        protected GroqClient $groq
    ) {}

    /**
     * Classify a user question into data, knowledge, or off-topic.
     */
    public function classify(string $question): string
    {
        $prompt = <<<'PROMPT'
You are a classifier. Classify the user's question into exactly one of these categories:
- data: asks about numbers, records, reports, sales, stock, customers, invoices, orders, accounts, payments, or anything that would require querying a database.
- knowledge: asks how to use the app, features, navigation, setup, or help/support questions.
- off-topic: anything else (jokes, general world knowledge, personal opinions, unrelated topics).

Examples:
User: "How much stock do I have?" -> {"type": "data"}
User: "How do I create a quotation?" -> {"type": "knowledge"}
User: "Who won the cricket match?" -> {"type": "off-topic"}
User: "What are my sales today?" -> {"type": "data"}

Reply with ONLY a JSON object in this exact format: {"type": "<category>"}
Do not include any explanation, markdown, or thinking.
PROMPT;

        $response = $this->groq->generate([
            ['role' => 'system', 'content' => $prompt],
            ['role' => 'user', 'content' => $question],
        ], [
            'temperature' => 0.1,
            'maxOutputTokens' => 256,
            'response_format' => ['type' => 'json_object'],
        ]);

        $type = $this->extractType($response['text']);

        if ($type === null) {
            Log::warning('Chatbot classifier returned unexpected response', [
                'question' => $question,
                'response' => $response['text'],
            ]);

            return self::TYPE_OFF_TOPIC;
        }

        return $type;
    }

    /**
     * Extract the classification type from model output.
     */
    private function extractType(string $text): ?string
    {
        $lower = strtolower(trim($text));

        // Extract the JSON object {"type": "..."} from anywhere in the response.
        if (preg_match('/\{\s*"type"\s*:\s*"([^"]+)"\s*\}/', $lower, $matches)) {
            $type = strtolower(trim($matches[1]));

            return $this->mapType($type);
        }

        // Try JSON parsing of the cleaned text.
        $json = preg_replace('/^```json\s*|\s*```$/', '', $lower);
        $data = json_decode(trim($json), true);

        if (is_array($data) && isset($data['type'])) {
            return $this->mapType(strtolower(trim($data['type'])));
        }

        // Last resort: look for the category words as standalone tokens.
        // Prefer the most specific match by checking off-topic first.
        foreach (['off-topic', 'knowledge', 'data'] as $candidate) {
            if (preg_match('/\b'.preg_quote($candidate, '/').'\b/', $lower)) {
                return $this->mapType($candidate);
            }
        }

        return null;
    }

    private function mapType(string $type): ?string
    {
        return match ($type) {
            'data' => self::TYPE_DATA,
            'knowledge' => self::TYPE_KNOWLEDGE,
            'off-topic', 'off_topic', 'offtopic' => self::TYPE_OFF_TOPIC,
            default => null,
        };
    }
}
