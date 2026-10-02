import { Send, Sparkles } from 'lucide-react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type ChatInputProps = {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    isLoading: boolean;
    placeholder?: string;
};

export function ChatInput({
    value,
    onChange,
    onSubmit,
    isLoading,
    placeholder = 'Ask me anything...',
}: ChatInputProps) {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (value.trim() && !isLoading) {
            onSubmit(value.trim());
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="border-t border-slate-100 p-4 dark:border-slate-800"
        >
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex size-8 shrink-0 items-center justify-center text-brand-500">
                    <Sparkles className="size-4" />
                </div>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={isLoading}
                    className="h-9 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !value.trim()}
                    className="size-8 shrink-0 rounded-xl bg-brand-600 hover:bg-brand-700"
                >
                    <Send className="size-4" />
                    <span className="sr-only">Send</span>
                </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
                AI assistant — answers are based on your data and help articles.
            </p>
        </form>
    );
}
