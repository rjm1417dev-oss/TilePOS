import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

const ACTION_ORDER = ['view', 'create', 'edit', 'delete'];

function formatResourceName(resource: string): string {
    return resource
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function groupPermissionsByResource(
    permissions: string[],
): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    for (const p of permissions) {
        const dot = p.indexOf('.');
        const resource = dot >= 0 ? p.slice(0, dot) : p;
        const action = dot >= 0 ? p.slice(dot + 1) : '';
        if (!groups.has(resource)) {
            groups.set(resource, []);
        }
        groups.get(resource)!.push(p);
    }
    for (const perms of groups.values()) {
        perms.sort((a, b) => {
            const actionA = a.split('.').pop() ?? '';
            const actionB = b.split('.').pop() ?? '';
            return (
                ACTION_ORDER.indexOf(actionA) - ACTION_ORDER.indexOf(actionB)
            );
        });
    }
    return groups;
}

interface PermissionsChecklistProps {
    permissions: string[];
    selected: string[];
    onToggle: (name: string, checked: boolean) => void;
}

export function PermissionsChecklist({
    permissions,
    selected,
    onToggle,
}: PermissionsChecklistProps) {
    const groups = useMemo(
        () => groupPermissionsByResource(permissions),
        [permissions],
    );
    const [openGroups, setOpenGroups] = useState<Set<string>>(
        () => new Set(groups.keys()),
    );

    const setGroupOpen = (resource: string, open: boolean) => {
        setOpenGroups((prev) => {
            const next = new Set(prev);
            if (open) {
                next.add(resource);
            } else {
                next.delete(resource);
            }
            return next;
        });
    };

    const sortedResources = Array.from(groups.keys()).sort((a, b) =>
        formatResourceName(a).localeCompare(formatResourceName(b)),
    );

    return (
        <div className="flex max-h-80 flex-col gap-1 overflow-y-auto rounded-md border p-2">
            {sortedResources.map((resource) => {
                const perms = groups.get(resource)!;
                const isOpen = openGroups.has(resource);
                const groupLabel = formatResourceName(resource);

                return (
                    <Collapsible
                        key={resource}
                        open={isOpen}
                        onOpenChange={(open) => setGroupOpen(resource, open)}
                    >
                        <CollapsibleTrigger
                            asChild
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium hover:bg-muted/60"
                        >
                            <button
                                type="button"
                                className="flex flex-1 items-center gap-2"
                            >
                                {isOpen ? (
                                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                                )}
                                <span>{groupLabel}</span>
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="grid gap-2 py-2 pr-2 pl-6 sm:grid-cols-2">
                                {perms.map((p) => (
                                    <label
                                        key={p}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={selected.includes(p)}
                                            onCheckedChange={(checked) =>
                                                onToggle(p, !!checked)
                                            }
                                        />
                                        <span className="font-mono text-xs">
                                            {p.split('.')[1] ?? p}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}
