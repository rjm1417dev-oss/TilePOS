import { useState } from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { FloatingChatbot } from '@/components/chatbot/floating-chatbot';
import { OmniSearch } from '@/components/omni-search';
import { SuperAdminSidebar } from '@/components/super-admin-sidebar';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs = [] }: AppLayoutProps) => {
    const [omniOpen, setOmniOpen] = useState(false);

    return (
        <AppShell variant="sidebar">
            <SuperAdminSidebar onOpenOmniSearch={() => setOmniOpen(true)} />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <OmniSearch open={omniOpen} onOpenChange={setOmniOpen} />
            <FloatingChatbot
                endpoint="/super-admin/chatbot/message"
                context="super-admin"
                title="Super Admin Assistant"
            />
        </AppShell>
    );
};
