import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { FloatingChatbot } from '@/components/chatbot/floating-chatbot';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { usePage } from '@inertiajs/react';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { auth } = usePage().props as {
        auth?: { isSuperAdmin?: boolean };
    };
    const isTenantUser = !auth?.isSuperAdmin;

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden no-scrollbar">
                <ImpersonationBanner />
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            {isTenantUser && (
                <FloatingChatbot
                    endpoint="/chatbot/message"
                    context="tenant"
                    title="TilePOS Assistant"
                />
            )}
        </AppShell>
    );
}
