import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

const UNGROUPED = '__ungrouped';
const GROUP_ORDER = [
    UNGROUPED,
    'Sales & Orders',
    'Parties',
    'Inventory Management',
    'Accounts',
    'Reports',
    'Administration',
];
const STORAGE_KEY = 'sidebar-groups-open';

function groupNavItems(items: NavItem[]): Map<string, NavItem[]> {
    const groups = new Map<string, NavItem[]>();
    for (const item of items) {
        const group = item.group !== undefined ? item.group : UNGROUPED;
        const list = groups.get(group) ?? [];
        list.push(item);
        groups.set(group, list);
    }
    return groups;
}

function loadOpenGroups(): Record<string, boolean> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore
    }
    return {};
}

function saveOpenGroups(open: Record<string, boolean>) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch {
        // ignore
    }
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const groups = groupNavItems(items);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
        () => {
            const saved = loadOpenGroups();
            return GROUP_ORDER.filter((g) => g !== UNGROUPED).reduce(
                (acc, label) => {
                    acc[label] = saved[label] ?? true;
                    return acc;
                },
                {} as Record<string, boolean>,
            );
        },
    );

    useEffect(() => {
        saveOpenGroups(openGroups);
    }, [openGroups]);

    const toggleGroup = useCallback((label: string) => {
        setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
    }, []);

    return (
        <>
            {GROUP_ORDER.map((groupLabel) => {
                const groupItems = groups.get(groupLabel);
                if (!groupItems?.length) return null;

                if (groupLabel === UNGROUPED) {
                    return (
                        <SidebarGroup key={UNGROUPED} className="px-2 py-0">
                            <SidebarMenu>
                                {groupItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isCurrentUrl(item.href)}
                                            tooltip={{ children: item.title }}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroup>
                    );
                }

                const isOpen = openGroups[groupLabel] ?? true;
                return (
                    <Collapsible
                        key={groupLabel}
                        open={isOpen}
                        onOpenChange={() => toggleGroup(groupLabel)}
                    >
                        <SidebarGroup className="px-2 py-0">
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-8 w-full shrink-0 cursor-pointer items-center gap-2 rounded-md px-2 text-left text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity,color] duration-200 ease-linear select-none group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:select-none hover:text-sidebar-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0"
                                >
                                    <ChevronRight
                                        className={cn(
                                            'size-4 shrink-0 transition-transform',
                                            isOpen && 'rotate-90',
                                        )}
                                    />
                                    <span>{groupLabel}</span>
                                </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenu className="ml-3 border-l border-sidebar-border/60 pl-2">
                                    {groupItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isCurrentUrl(
                                                    item.href,
                                                )}
                                                tooltip={{
                                                    children: item.title,
                                                }}
                                            >
                                                <Link href={item.href} prefetch>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                );
            })}
        </>
    );
}
