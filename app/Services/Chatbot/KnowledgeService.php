<?php

namespace App\Services\Chatbot;

class KnowledgeService
{
    public function __construct(
        protected GroqClient $groq
    ) {}

    /**
     * Answer a question using static knowledge articles.
     *
     * @param  array<int, array{title: string, content: string}>  $articles
     * @param  array<int, array{role: string, content: string}>  $history
     * @param  string|null  $model  Optional Groq model override for this call.
     */
    public function answer(string $question, array $articles, array $history, ?string $model = null): array
    {
        $context = $this->buildContext($articles);

        $systemPrompt = <<<PROMPT
You are a helpful assistant for a business management web application.
Answer the user's question using ONLY the help articles provided below.
If the question is not covered by the articles, say you don't have information about that and suggest contacting support.
Do not make up information.

Reply with ONLY a JSON object in this exact format: {"answer": "your response here"}
Do not include markdown, explanations, or thinking.

Help articles:
{$context}
PROMPT;

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($history as $message) {
            $role = $message['role'] === 'user' ? 'user' : 'assistant';
            $messages[] = ['role' => $role, 'content' => $message['content']];
        }

        $messages[] = ['role' => 'user', 'content' => $question];

        $response = $this->groq->generate($messages, [
            'temperature' => 0.3,
            'maxOutputTokens' => 1024,
            'response_format' => ['type' => 'json_object'],
        ], $model);

        return [
            'text' => $this->extractAnswer($response['text']),
            'sources' => [],
        ];
    }

    /**
     * Extract the answer from a JSON response, falling back to the raw text.
     */
    private function extractAnswer(string $text): string
    {
        $clean = preg_replace('/^```json\s*|\s*```$/', '', trim($text));
        $data = json_decode($clean, true);

        if (is_array($data) && isset($data['answer']) && is_string($data['answer'])) {
            return trim($data['answer']);
        }

        return trim($text);
    }

    /**
     * Build a text context block from knowledge articles.
     *
     * @param  array<int, array{title: string, content: string}>  $articles
     */
    protected function buildContext(array $articles): string
    {
        $lines = [];
        foreach ($articles as $article) {
            $lines[] = "Title: {$article['title']}\nContent: {$article['content']}";
        }

        return implode("\n\n---\n\n", $lines);
    }
}
