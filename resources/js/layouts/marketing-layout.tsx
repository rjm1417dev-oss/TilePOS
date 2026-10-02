import type { PropsWithChildren } from 'react';
import { FloatingChatbot } from '@/components/chatbot/floating-chatbot';
import { Footer } from '@/components/landing/Footer';
import { Navbar } from '@/components/landing/Navbar';

interface MarketingLayoutProps {
    appName?: string;
    tagline?: string;
    canRegister?: boolean;
}

export default function MarketingLayout({
    children,
    appName = 'TilePOS',
    tagline,
    canRegister = true,
}: PropsWithChildren<MarketingLayoutProps>) {
    return (
        <div className="min-h-screen overflow-x-hidden bg-white text-ink-900 antialiased">
            <Navbar appName={appName} canRegister={canRegister} />
            <main className="relative pt-16">{children}</main>
            <Footer appName={appName} />

            {/* Public website chatbot — available on all marketing pages.
                No authentication required. No database access. */}
            <FloatingChatbot
                endpoint="/chatbot/public"
                context="public"
                title="TilePOS Assistant"
            />
        </div>
    );
}
