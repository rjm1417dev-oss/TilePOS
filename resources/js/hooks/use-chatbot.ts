import { useCallback, useState } from 'react';

function getCsrfHeaders(): Record<string, string> {
    // Prefer the XSRF-TOKEN cookie.
    // MUST be decoded (decodeURIComponent) because Laravel's encrypter expects raw base64 (= instead of %3D).
    const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]+)'));
    if (match) {
        return { 'X-XSRF-TOKEN': decodeURIComponent(match[2]) };
    }

    // Fallback: meta tag.
    // This token is UNENCRYPTED, so it must be sent as X-CSRF-TOKEN.
    const metaToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) {
        return { 'X-CSRF-TOKEN': metaToken };
    }

    return {};
}

type MessageRole = 'user' | 'assistant';

export type ChatMessage = {
    id: string;
    role: MessageRole;
    content: string;
    type?: 'sql' | 'knowledge' | 'refusal' | 'error' | 'user-message';
    sql?: string | null;
    sources?: string[];
    isLoading?: boolean;
};

type UseChatbotOptions = {
    endpoint: string;
    context: 'tenant' | 'super-admin' | 'public';
};

export function useChatbot({ endpoint, context }: UseChatbotOptions) {
    const welcomeMessage = context === 'public'
        ? 'Hi! I can answer questions about our platform — features, pricing, how it works, and more. What would you like to know?'
        : 'Hi! I can answer questions about your business data (sales, stock, customers) or help you use the app. What would you like to know?';

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: welcomeMessage,
            type: 'knowledge',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [retryAfter, setRetryAfter] = useState<number | null>(null);

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim() || isLoading) return;

            const userMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'user',
                content: content.trim(),
                type: 'user-message',
            };

            const assistantPlaceholder: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: '',
                type: 'knowledge',
                isLoading: true,
            };

            setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
            setInput('');
            setIsLoading(true);
            setError(null);
            setRetryAfter(null);

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        Accept: 'application/json',
                        ...getCsrfHeaders(),
                    },
                    body: JSON.stringify({ message: content.trim() }),
                });

                const data = await response.json().catch(() => ({})) as {
                    message?: string;
                    type?: string;
                    sql?: string | null;
                    sources?: string[];
                    retry_after?: number;
                };

                if (!response.ok) {
                    // 429 rate limit — show retry countdown
                    if (response.status === 429) {
                        setRetryAfter(data.retry_after ?? 60);
                    }
                    throw new Error(
                        data.message ?? `Request failed with status ${response.status}`,
                    );
                }

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantPlaceholder.id
                            ? {
                                  ...msg,
                                  content: data.message ?? '',
                                  type: (data.type as ChatMessage['type']) ?? 'knowledge',
                                  sql: data.sql,
                                  sources: data.sources,
                                  isLoading: false,
                              }
                            : msg,
                    ),
                );
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Something went wrong.';
                setError(message);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantPlaceholder.id
                            ? {
                                  ...msg,
                                  content: message,
                                  type: 'error',
                                  isLoading: false,
                              }
                            : msg,
                    ),
                );
            } finally {
                setIsLoading(false);
            }
        },
        [endpoint, isLoading],
    );

    return {
        messages,
        input,
        setInput,
        isLoading,
        error,
        retryAfter,
        sendMessage,
        context,
    };
}
