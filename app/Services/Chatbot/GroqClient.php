<?php

namespace App\Services\Chatbot;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GroqClient
{
    private string $apiKey;

    private string $model;

    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('chatbot.groq.api_key');
        $this->model = config('chatbot.groq.model', 'llama-3.1-70b-versatile');
        $this->baseUrl = rtrim(config('chatbot.groq.base_url', 'https://api.groq.com/openai/v1'), '/');

        if (empty($this->apiKey)) {
            throw new RuntimeException('GROQ_API_KEY is not configured.');
        }
    }

    /**
     * Send chat messages to Groq and return the text response.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     * @param  array<string, mixed>  $config
     * @param  string|null  $model  Optional model override for this specific call.
     */
    public function generate(array $messages, array $config = [], ?string $model = null): array
    {
        $url = $this->baseUrl.'/chat/completions';

        $payload = [
            'model' => $model ?? $this->model,
            'messages' => $messages,
        ];

        if (! empty($config)) {
            if (isset($config['temperature'])) {
                $payload['temperature'] = $config['temperature'];
            }
            if (isset($config['maxOutputTokens'])) {
                $payload['max_tokens'] = $config['maxOutputTokens'];
            }
            if (isset($config['max_tokens'])) {
                $payload['max_tokens'] = $config['max_tokens'];
            }
            if (isset($config['topP'])) {
                $payload['top_p'] = $config['topP'];
            }
            if (isset($config['topK'])) {
                $payload['top_k'] = $config['topK'];
            }
            if (isset($config['response_format'])) {
                $payload['response_format'] = $config['response_format'];
            }
        }

        // Single attempt — do NOT sleep() on 429; it blocks PHP-FPM workers.
        // On rate-limit, throw immediately with a user-friendly message.
        try {
            $response = Http::timeout(120)
                ->withToken($this->apiKey)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                $text = $this->extractText($data);

                return [
                    'text' => $text,
                    'raw' => $data,
                    'model' => $payload['model'],
                ];
            }

            $status = $response->status();
            $body = $response->body();

            Log::error('Groq API error', [
                'status' => $status,
                'body' => $body,
                'model' => $payload['model'],
            ]);

            if ($status === 429) {
                $retryAfter = $this->extractRetryAfter($body);
                throw new RuntimeException(
                    'The AI assistant is busy right now. Please wait '.($retryAfter ?? 'a few').' seconds and try again.',
                    429
                );
            }

            throw new RuntimeException('Groq API returned an error: '.$status.' — '.$body);
        } catch (ConnectionException $e) {
            Log::error('Groq API connection error', ['error' => $e->getMessage()]);
            throw new RuntimeException('Unable to reach the AI assistant. Please check your connection and try again.');
        }
    }

    /**
     * Extract the retry-after hint (seconds) from a Groq 429 error body.
     */
    private function extractRetryAfter(string $body): ?int
    {
        if (preg_match('/try again in ([\d.]+)s/i', $body, $matches)) {
            return (int) ceil((float) $matches[1]);
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function extractText(array $data): string
    {
        $choices = $data['choices'] ?? [];

        foreach ($choices as $choice) {
            $message = $choice['message'] ?? [];
            if (isset($message['content'])) {
                return $this->stripReasoningBlocks($message['content']);
            }
        }

        throw new RuntimeException('Groq returned an empty response.');
    }

    /**
     * Strip reasoning/thinking blocks that some models prepend to answers.
     *
     * Handles:
     * - Qwen3 / DeepSeek R1 style XML: <think>...</think>
     * - Qwen / older bracket style: [Thinking Process...] at start
     * - Explicit final-answer section markers
     */
    private function stripReasoningBlocks(string $text): string
    {
        $text = trim($text);

        // Strip <think>...</think> blocks (Qwen3, DeepSeek R1, etc.)
        $text = preg_replace('/<think>[\s\S]*?<\/think>\s*/i', '', $text);

        // Strip older bracket-style thinking blocks at the start.
        $text = preg_replace('/^\[\s*(?:Thinking Process|Here\'s a thinking process)[\s\S]*?\]\s*/i', '', $text);

        // If the model labels the final answer section, keep only that part.
        foreach (['Final Answer:', 'Drafting response:', 'Final response:'] as $marker) {
            $pos = stripos($text, $marker);
            if ($pos !== false) {
                $text = substr($text, $pos + strlen($marker));
            }
        }

        return ltrim($text);
    }
}
