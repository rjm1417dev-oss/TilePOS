import { Link, usePage } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { toUrl } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType, User } from '@/types';
import { allNavItems } from './app-sidebar';
import { UserMenuContent } from './user-menu-content';

type SearchableItem = {
    title: string;
    href: string;
    icon?: LucideIcon;
    group?: string;
};

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage();
    const { auth } = page.props as {
        auth: { user: User; permissions?: string[]; enabledFeatures?: string[] };
    };
    const getInitials = useInitials();
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');

    const searchableItems = useMemo<SearchableItem[]>(() => {
        const permissions = auth.permissions ?? [];
        const enabledFeatures = auth.enabledFeatures ?? [];
        return allNavItems
            .filter((item) => {
                if (item.featureKey && !enabledFeatures.includes(item.featureKey)) {
                    return false;
                }
                return !item.permission || permissions.includes(item.permission);
            })
            .map((item) => ({
                title: item.title,
                href: toUrl(item.href),
                icon: item.icon ?? undefined,
                group: item.group,
            }));
    }, [auth.enabledFeatures, auth.permissions]);

    const filteredItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return searchableItems;
        return searchableItems.filter(
            (item) =>
                item.title.toLowerCase().includes(q) ||
                (item.group?.toLowerCase().includes(q) ?? false),
        );
    }, [searchableItems, query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen((open) => {
                    if (!open) setQuery('');
                    return !open;
                });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleOpenSearch = () => {
        setQuery('');
        setSearchOpen(true);
    };

    const handleCloseSearch = () => {
        setSearchOpen(false);
        setQuery('');
    };

    return (
        <>
            <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-sidebar-border/50 bg-background/80 px-4 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:bg-slate-950/80">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <SidebarTrigger className="-ml-1 shrink-0" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {/* Search trigger */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenSearch}
                        className="hidden h-9 gap-2 rounded-xl border border-transparent px-3 text-sm font-medium text-slate-500 transition-all hover:border-slate-100 hover:bg-slate-50 hover:text-slate-700 md:inline-flex dark:text-slate-400 dark:hover:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <Search className="h-4 w-4" />
                        <span className="hidden lg:inline">Search...</span>
                        <kbd className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 lg:inline-block dark:bg-slate-800 dark:text-slate-500">
                            ⌘K
                        </kbd>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleOpenSearch}
                        className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-50 hover:text-slate-700 md:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        aria-label="Search"
                    >
                        <Search className="h-[18px] w-[18px]" />
                    </Button>

                    <div className="mx-1 h-5 w-px bg-slate-100 md:mx-2 dark:bg-slate-800" />

                    <NotificationDropdown />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="ml-1 h-9 w-9 rounded-full p-0.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-slate-100 shadow-sm dark:border-slate-700">
                                    <AvatarImage src={auth.user.avatar ?? undefined} alt={auth.user.name} />
                                    <AvatarFallback className="rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 dark:border-slate-700 dark:bg-slate-900" align="end" sideOffset={8}>
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Command palette */}
            <Dialog open={searchOpen} onOpenChange={handleCloseSearch}>
                <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-2xl border-slate-100 p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Search</DialogTitle>
                    </DialogHeader>
                    <div className="relative border-b border-slate-100 p-4 dark:border-slate-800">
                        <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search pages, modules, and actions..."
                            className="h-12 border-0 bg-transparent pl-11 pr-10 text-base text-slate-900 shadow-none focus-visible:ring-0 dark:text-slate-100"
                            autoFocus
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="max-h-[360px] overflow-y-auto p-2 scrollbar-soft dark:bg-slate-900">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                                <Search className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    No results found
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-600">
                                    Try searching for a different page or module
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-0.5">
                                {filteredItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.title}
                                            href={toUrl(item.href)}
                                            onClick={handleCloseSearch}
                                            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            {Icon && (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-500 group-hover:border-emerald-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:border-emerald-900 dark:group-hover:bg-emerald-950/50 dark:group-hover:text-emerald-400">
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {item.title}
                                                </p>
                                                {item.group && (
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                        {item.group}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-500">
                        <span>{filteredItems.length} results</span>
                        <span>
                            Press <kbd className="rounded bg-white px-1 py-0.5 font-medium shadow-sm dark:bg-slate-800 dark:text-slate-400">ESC</kbd> to close
                        </span>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
