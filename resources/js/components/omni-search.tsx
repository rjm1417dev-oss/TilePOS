import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import superAdmin from '@/routes/super-admin';

interface SearchResult {
    type: string;
    label: string;
    url?: string;
    subtitle?: string;
    id?: number;
}

export function OmniSearch({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    superAdmin.omniSearch.url({ query: { q: query } }),
                );
                const data = await res.json();
                setResults(data.results ?? []);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
            debounceRef.current = null;
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                onOpenChange(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onOpenChange]);

    const handleSelect = (r: SearchResult) => {
        if (r.url) {
            router.visit(r.url);
            onOpenChange(false);
            setQuery('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-xl gap-0 p-0"
                aria-describedby={undefined}
            >
                <DialogTitle className="sr-only">Search</DialogTitle>
                <DialogHeader className="p-4 pb-0">
                    <Input
                        placeholder="Search tenants, or type 'Create Tenant', 'Settings'..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                        className="border-0 text-lg shadow-none focus-visible:ring-0"
                    />
                </DialogHeader>
                <div className="max-h-80 overflow-auto p-2">
                    {loading ? (
                        <p className="py-4 text-center text-muted-foreground">
                            Searching...
                        </p>
                    ) : results.length === 0 && query.length >= 2 ? (
                        <p className="py-4 text-center text-muted-foreground">
                            No results
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {results.map((r, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-muted"
                                    onClick={() => handleSelect(r)}
                                >
                                    <span className="font-medium">
                                        {r.label}
                                    </span>
                                    {r.subtitle && (
                                        <span className="text-muted-foreground">
                                            {r.subtitle}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <p className="border-t px-4 py-2 text-xs text-muted-foreground">
                    Press ⌘K to toggle
                </p>
            </DialogContent>
        </Dialog>
    );
}
