import { Head, usePage } from '@inertiajs/react';
import { FloatingChatbot } from '@/components/chatbot/floating-chatbot';
import { CTA } from '@/components/landing/CTA';
import { FAQ } from '@/components/landing/FAQ';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LogoMarquee } from '@/components/landing/LogoMarquee';
import { Modules } from '@/components/landing/Modules';
import { Navbar } from '@/components/landing/Navbar';
import { Pricing } from '@/components/landing/Pricing';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

export default function Welcome({
    canRegister = true,
    appName = 'TilePOS',
    tagline = 'Quotations. Inventory. Analytics. One powerful platform.',
}: {
    canRegister?: boolean;
    appName?: string;
    tagline?: string;
}) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };
    useScrollReveal();

    return (
        <div
            className="min-h-screen bg-white text-ink-900 antialiased"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            <Head
                title={`${appName} - Business Management for Tiles & Construction`}
            >
                <meta name="description" content={tagline} />
            </Head>

            <Navbar
                appName={appName}
                canRegister={canRegister && auth?.user == null}
            />

            <main>
                <Hero />
                <LogoMarquee />
                <Features appName={appName} />
                <Modules />
                <HowItWorks />
                <Pricing />
                <FAQ appName={appName} />
                <CTA appName={appName} canRegister={canRegister} />
            </main>

            <Footer appName={appName} />

            {/* Public website chatbot — no auth required, static knowledge only. */}
            <FloatingChatbot
                endpoint="/chatbot/public"
                context="public"
                title="TilePOS Assistant"
            />
        </div>
    );
}
