import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Cookie,
    Eye,
    FileText,
    Globe2,
    HelpCircle,
    Lock,
    ShieldCheck,
} from 'lucide-react';
import type { ElementType } from 'react';
import { useLenis } from '@/hooks/use-lenis';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import MarketingLayout from '@/layouts/marketing-layout';
import { register as tenantRegister } from '@/routes/tenant';

interface LegalSection {
    id: string;
    icon: ElementType;
    title: string;
    paragraphs: string[];
}

const sections: LegalSection[] = [
    {
        id: 'introduction',
        icon: Cookie,
        title: '1. Introduction',
        paragraphs: [
            'This Cookie Policy explains how TilePOS uses cookies and similar tracking technologies when you visit our website or use our platform. It describes what these technologies are, why we use them, and your choices regarding their use.',
            'By continuing to use the TilePOS website or platform, you consent to our use of cookies in accordance with this policy. You can withdraw or modify your consent at any time through your browser settings.',
        ],
    },
    {
        id: 'what-are-cookies',
        icon: HelpCircle,
        title: '2. What are cookies?',
        paragraphs: [
            'Cookies are small text files placed on your device by a website or application. They store information that helps the site remember your preferences, authenticate sessions, and analyze usage patterns.',
            'Similar technologies include local storage, session storage, pixels, and web beacons. In this policy, the term "cookies" refers to cookies and all similar technologies.',
            'Cookies can be "session cookies," which are deleted when you close your browser, or "persistent cookies," which remain on your device until they expire or are deleted manually.',
        ],
    },
    {
        id: 'types-of-cookies',
        icon: ShieldCheck,
        title: '3. Types of cookies we use',
        paragraphs: [
            'Essential cookies are necessary for the platform to function. They enable core features such as authentication, session management, security, and tenant workspace access. Without these cookies, you cannot log in or use the application securely.',
            'Functional cookies remember your preferences and settings, such as language, dashboard layout, or display choices. They improve your experience by reducing the need to reconfigure the platform each time you visit.',
            'Analytics cookies help us understand how users interact with our website and platform. They collect information in an aggregated, anonymized form about page visits, feature usage, and error rates. This data guides product improvements.',
            'Marketing cookies are used to deliver relevant promotional content and measure the effectiveness of our campaigns. We use these only when you have provided consent, and they are not required to use the platform.',
        ],
    },
    {
        id: 'how-we-use-cookies',
        icon: Eye,
        title: '4. How we use cookies on TilePOS',
        paragraphs: [
            'We use cookies to keep you signed in, protect your account from unauthorized access, and route you to the correct tenant workspace after authentication.',
            'Cookies help us remember your interface preferences, display relevant notifications, and maintain a consistent experience across sessions.',
            'Analytics cookies allow us to measure traffic, identify popular features, and fix issues quickly. We do not use cookies to track individual users across third-party websites for advertising purposes without explicit consent.',
            'When you register for an account or start a free trial, cookies may be used to attribute your signup to a referral or marketing campaign.',
        ],
    },
    {
        id: 'third-party-cookies',
        icon: Globe2,
        title: '5. Third-party cookies and services',
        paragraphs: [
            'We may use trusted third-party services that set cookies on our behalf. These include analytics providers, error-tracking tools, and payment processors. Each third party is contractually bound to use cookies only for the specified purpose and to handle data responsibly.',
            'Examples may include analytics services that help us understand platform usage, or payment processors that securely handle subscription billing. These services have their own privacy and cookie policies, which we encourage you to review.',
            'We do not sell cookie data to advertisers or data brokers. Third-party cookies are limited to operational and analytical purposes unless you explicitly consent to marketing cookies.',
        ],
    },
    {
        id: 'managing-cookies',
        icon: Lock,
        title: '6. Managing your cookie preferences',
        paragraphs: [
            'Most web browsers allow you to manage cookies through their settings. You can block, delete, or receive alerts before cookies are stored. Please note that disabling essential cookies may prevent you from logging in or using core features of TilePOS.',
            'If you are in a region that requires explicit consent, you may see a cookie banner when you first visit our website. You can accept or decline non-essential cookies through that banner. You can change your preference at any time by clearing your browser cookies or adjusting settings.',
            'To learn how to manage cookies in your specific browser, consult the help documentation for Chrome, Safari, Firefox, Edge, or the mobile browser you use.',
        ],
    },
    {
        id: 'data-and-retention',
        icon: FileText,
        title: '7. Data collected by cookies',
        paragraphs: [
            'Cookies may collect information such as your device type, browser version, IP address, pages visited, time spent on pages, and interaction events. Where analytics cookies are used, this information is typically aggregated and anonymized.',
            'Session cookies are deleted when you close your browser. Persistent cookies may remain on your device for a set period, such as 30 days to two years, depending on their purpose. You can remove persistent cookies manually at any time.',
        ],
    },
    {
        id: 'changes',
        icon: AlertCircle,
        title: '8. Changes to this Cookie Policy',
        paragraphs: [
            'We may update this Cookie Policy to reflect changes in technology, regulation, or our services. When we make material changes, we will update the "Last updated" date and may notify you through the platform or by email.',
            'Continued use of the website or platform after changes take effect constitutes acceptance of the revised Cookie Policy.',
        ],
    },
    {
        id: 'contact',
        icon: CheckCircle2,
        title: '9. Contact us',
        paragraphs: [
            'If you have questions about our use of cookies or would like to exercise your data rights, please contact us at privacy@example.com.',
        ],
    },
];

const cookieTypes = [
    {
        name: 'auth_session',
        purpose: 'Essential',
        duration: 'Session',
        description: 'Maintains your authenticated session across requests.',
    },
    {
        name: 'tenant_context',
        purpose: 'Essential',
        duration: 'Session',
        description: 'Remembers the active tenant workspace after login.',
    },
    {
        name: 'preferences',
        purpose: 'Functional',
        duration: '1 year',
        description: 'Stores UI and language preferences.',
    },
    {
        name: '_analytics',
        purpose: 'Analytics',
        duration: '1 year',
        description: 'Collects anonymized usage data for product improvement.',
    },
    {
        name: '_marketing',
        purpose: 'Marketing',
        duration: '90 days',
        description: 'Tracks campaign effectiveness with consent.',
    },
];

export default function CookiePolicy({
    appName = 'TilePOS',
    tagline,
}: {
    appName?: string;
    tagline?: string;
}) {
    useLenis();
    useScrollReveal();

    return (
        <MarketingLayout appName={appName} tagline={tagline}>
            <Head title={`Cookie Policy - ${appName}`} />

            {/* Hero */}
            <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-white" />
                <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
                <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
                <div className="absolute top-40 -left-24 -z-10 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="font-600 animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1.5 text-xs text-brand-700">
                            <Cookie className="h-3.5 w-3.5" />
                            Legal
                        </div>
                        <h1
                            className="font-800 animate-fade-up mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            Cookie <span className="text-gradient">Policy</span>
                        </h1>
                        <p
                            className="animate-fade-up mt-5 text-lg leading-relaxed text-ink-600"
                            style={{ animationDelay: '120ms' }}
                        >
                            How {appName} uses cookies and similar technologies
                            to keep your experience secure, personalized, and
                            reliable.
                        </p>
                        <p
                            className="animate-fade-up mt-3 text-sm text-ink-500"
                            style={{ animationDelay: '180ms' }}
                        >
                            Last updated:{' '}
                            {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="bg-gradient-to-b from-white to-brand-50/40 px-4 py-16 sm:px-6 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                        {/* Sidebar */}
                        <aside className="lg:col-span-4">
                            <div className="reveal lg:sticky lg:top-24">
                                <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                                    <h2 className="font-700 font-display text-lg text-ink-900">
                                        Table of contents
                                    </h2>
                                    <ul className="mt-4 space-y-2">
                                        {sections.map((section) => (
                                            <li key={section.id}>
                                                <a
                                                    href={`#${section.id}`}
                                                    className="group flex items-center gap-2 text-sm text-ink-600 transition hover:text-brand-600"
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-brand-300 transition-colors group-hover:bg-brand-600" />
                                                    {section.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="reveal mt-6 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                                    <h3 className="font-700 font-display text-base text-ink-900">
                                        Cookie preferences
                                    </h3>
                                    <p className="mt-2 text-sm text-ink-600">
                                        You can manage or delete cookies through
                                        your browser settings. Essential cookies
                                        are required for login and security.
                                    </p>
                                </div>
                            </div>
                        </aside>

                        {/* Sections */}
                        <div className="space-y-8 lg:col-span-8">
                            {sections.map((section) => (
                                <div
                                    key={section.id}
                                    id={section.id}
                                    className="reveal card-lift scroll-mt-28 rounded-2xl border border-ink-100 bg-white p-7 shadow-card transition-all hover:border-brand-200"
                                >
                                    <div className="flex items-start gap-4">
                                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                                            <section.icon
                                                className="h-5 w-5"
                                                strokeWidth={2}
                                            />
                                        </span>
                                        <div className="flex-1">
                                            <h2 className="font-700 font-display text-xl text-ink-900">
                                                {section.title}
                                            </h2>
                                            <div className="mt-4 space-y-4">
                                                {section.paragraphs.map(
                                                    (paragraph, i) => (
                                                        <p
                                                            key={i}
                                                            className="leading-relaxed text-ink-600"
                                                        >
                                                            {paragraph}
                                                        </p>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Cookie table */}
                            <div className="reveal overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                                <div className="border-b border-ink-100 bg-ink-50/60 px-6 py-4">
                                    <h2 className="font-700 font-display text-lg text-ink-900">
                                        Common cookies used
                                    </h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px] border-collapse">
                                        <thead>
                                            <tr className="border-b border-ink-100 bg-ink-50/40 text-left text-xs font-semibold tracking-wider text-ink-500 uppercase">
                                                <th className="px-6 py-3">
                                                    Cookie
                                                </th>
                                                <th className="px-6 py-3">
                                                    Purpose
                                                </th>
                                                <th className="px-6 py-3">
                                                    Duration
                                                </th>
                                                <th className="px-6 py-3">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-ink-700">
                                            {cookieTypes.map((cookie) => (
                                                <tr
                                                    key={cookie.name}
                                                    className="border-b border-ink-100 last:border-0 hover:bg-ink-50/40"
                                                >
                                                    <td className="px-6 py-4 font-medium text-ink-900">
                                                        {cookie.name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                                                            {cookie.purpose}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {cookie.duration}
                                                    </td>
                                                    <td className="px-6 py-4 text-ink-600">
                                                        {cookie.description}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-14 sm:px-12 lg:py-20">
                        <div className="bg-dots absolute inset-0 opacity-20" />
                        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
                        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />
                        <div className="relative">
                            <h2 className="font-800 font-display text-3xl tracking-tight text-white sm:text-4xl">
                                Ready to start?
                            </h2>
                            <p className="mt-4 text-lg text-brand-50/90">
                                Start your free 14-day trial and explore
                                everything {appName} has to offer.
                            </p>
                            <Link
                                href={tenantRegister.url()}
                                className="font-600 shadow-soft mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm text-brand-700 transition hover:bg-ink-50"
                            >
                                Start free trial
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
