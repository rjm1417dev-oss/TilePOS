import { MessageSquare, PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import { useState } from 'react';
import { ChatInput } from '@/components/chatbot/chat-input';
import { ChatMessages } from '@/components/chatbot/chat-messages';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useChatbot } from '@/hooks/use-chatbot';

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
    tenant: [
        'What are my total sales this month?',
        'How many customers do I have?',
        'Which products are low in stock?',
        'How do I create a quotation?',
    ],
    'super-admin': [
        'How many tenants are active?',
        'Show me recent platform activity.',
        'Which tenants were created this month?',
        'How do I manage tenant permissions?',
    ],
    public: [
        'What features does the platform offer?',
        'What pricing plans are available?',
        'How does the platform work?',
        'How do I get started?',
    ],
};

type FloatingChatbotProps = {
    endpoint: string;
    context: 'tenant' | 'super-admin' | 'public';
    title?: string;
};

export function FloatingChatbot({
    endpoint,
    context,
    title = 'AI Assistant',
}: FloatingChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const { messages, input, setInput, isLoading, retryAfter, sendMessage } = useChatbot({
        endpoint,
        context,
    });

    const toggleExpand = () => setIsExpanded((prev) => !prev);
    const suggestedQuestions = SUGGESTED_QUESTIONS[context] ?? SUGGESTED_QUESTIONS.tenant;

    const contextSubtitle = {
        tenant: 'Ask about your business data',
        'super-admin': 'Ask about platform data',
        public: 'Ask about our platform',
    }[context];

    const chatContent = (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 text-white">
                        <MessageSquare className="size-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {title}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            {contextSubtitle}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-slate-500"
                        onClick={toggleExpand}
                        title={isExpanded ? 'Collapse panel' : 'Expand panel'}
                    >
                        {isExpanded ? (
                            <PanelRightOpen className="size-4" />
                        ) : (
                            <PanelRightClose className="size-4" />
                        )}
                    </Button>
                    {!isExpanded && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-slate-500"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="size-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Suggested questions — only shown on first open */}
            {messages.length <= 1 && (
                <div className="shrink-0 px-4 py-3">
                    <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Suggested questions
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((question) => (
                            <button
                                key={question}
                                type="button"
                                onClick={() => sendMessage(question)}
                                disabled={isLoading}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-brand-950/30"
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Message list — min-h-0 is critical: allows the flex child to shrink
                and scroll instead of forcing the parent to grow beyond its bounds */}
            <div className="min-h-0 flex-1">
                <ChatMessages messages={messages} />
            </div>

            {/* Rate-limit notice */}
            {retryAfter !== null && (
                <div className="mx-4 mb-2 shrink-0 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    Rate limit reached. You can send another message in {retryAfter}s.
                </div>
            )}

            <ChatInput
                value={input}
                onChange={setInput}
                onSubmit={sendMessage}
                isLoading={isLoading}
                placeholder={
                    context === 'public'
                        ? 'Ask about features, pricing, or how it works...'
                        : 'Ask about sales, stock, customers, or app features...'
                }
            />
        </div>
    );

    return (
        <>
            {/* Floating button */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/30 transition-transform hover:scale-105 active:scale-95"
                >
                    <MessageSquare className="size-6" />
                    <span className="sr-only">Open chat</span>
                </button>
            )}

            {/* Compact floating panel */}
            {isOpen && !isExpanded && (
                <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
                    {chatContent}
                </div>
            )}

            {/* Expanded right sidebar panel */}
            <Sheet open={isOpen && isExpanded} onOpenChange={setIsOpen}>
                <SheetContent className="flex w-full flex-col p-0 sm:max-w-md" side="right">
                    <SheetHeader className="sr-only">
                        <SheetTitle>{title}</SheetTitle>
                    </SheetHeader>
                    {chatContent}
                </SheetContent>
            </Sheet>
        </>
    );
}
