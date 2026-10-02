import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: string;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    /** Permission required to show this item (e.g. "brands.view"). Omit for always-visible (e.g. Dashboard). */
    permission?: string;
    /** Feature flag key required (e.g. "tiles"). Item is hidden when flag is disabled. */
    featureKey?: string;
    /** Navigation group label (e.g. "Sales & Orders"). Items with same group are rendered together. */
    group?: string;
};
