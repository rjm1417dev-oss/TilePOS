import { AlertCircle, Bot, ShieldOff, User } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/hooks/use-chatbot';

function MessageAvatar({ role }: { role: ChatMessage['role'] }) {
    return (
        <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                role === 'user'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                    : 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'
            }`}
        >
            {role === 'user' ? (
                <User className="size-4" />
            ) : (
                <Bot className="size-4" />
            )}
        </div>
    );
}

function MessageTypeBadge({ type }: { type: ChatMessage['type'] }) {
    if (!type || type === 'user-message' || type === 'knowledge') return null;

    const badges: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
        refusal: {
            label: 'Out of scope',
            icon: <ShieldOff className="size-2.5" />,
            className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        },
        error: {
            label: 'Error',
            icon: <AlertCircle className="size-2.5" />,
            className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        },
    };

    const badge = badges[type];
    if (!badge) return null;

    return (
        <span className={`mb-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${badge.className}`}>
            {badge.icon}
            {badge.label}
        </span>
    );
}

export function ChatMessages({ messages }: { messages: ChatMessage[] }) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the bottom when new messages arrive.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-y-auto p-4">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                >
                    <MessageAvatar role={message.role} />
                    <div className={`flex max-w-[85%] flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <MessageTypeBadge type={message.type} />
                        <div
                            className={`rounded-2xl px-4 py-3 text-sm ${
                                message.role === 'user'
                                    ? 'bg-emerald-600 text-white dark:bg-emerald-700'
                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                            }`}
                        >
                            {message.isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500" />
                                    <span className="text-slate-400 dark:text-slate-500">
                                        Thinking...
                                    </span>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap leading-relaxed">
                                    {message.content}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {/* Scroll anchor */}
            <div ref={bottomRef} />
        </div>
    );
}
