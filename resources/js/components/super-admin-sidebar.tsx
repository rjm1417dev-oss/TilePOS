import { Link } from '@inertiajs/react';
import {
    Activity,
    Building2,
    KeyRound,
    LayoutGrid,
    Search,
    Shield,
    UserCog,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import superAdmin from '@/routes/super-admin';
import type { NavItem } from '@/types';

const navItems: NavItem[] = [
    { title: 'Dashboard', href: superAdmin.dashboard.url(), icon: LayoutGrid },
    { title: 'Tenants', href: superAdmin.tenants.index.url(), icon: Building2 },
    {
        title: 'Super Admins',
        href: superAdmin.superAdmins.index.url(),
        icon: UserCog,
    },
    {
        title: 'Permissions',
        href: superAdmin.permissions.index.url(),
        icon: KeyRound,
    },
    {
        title: 'Activity Logs',
        href: superAdmin.activityLogs.index.url(),
        icon: Activity,
    },
];

interface SuperAdminSidebarProps {
    onOpenOmniSearch?: () => void;
}

export function SuperAdminSidebar({
    onOpenOmniSearch,
}: SuperAdminSidebarProps) {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={superAdmin.dashboard.url()} prefetch>
                                <span className="shadow-glow grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-brand-400 text-white">
                                    <Shield className="size-5" />
                                </span>
                                <span className="font-700 font-display tracking-tight text-sidebar-foreground">
                                    Super Admin
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {onOpenOmniSearch && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="sm"
                                onClick={onOpenOmniSearch}
                                title="Search (⌘K)"
                            >
                                <Search className="size-4" />
                                <span className="text-xs">⌘K</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
