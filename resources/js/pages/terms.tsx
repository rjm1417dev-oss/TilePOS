import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    FileText,
    Globe2,
    HelpCircle,
    Lock,
    Scale,
    ShieldCheck,
    UserCheck,
    Wallet,
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
        icon: FileText,
        title: '1. Introduction',
        paragraphs: [
            'These Terms of Service govern your access to and use of the TilePOS platform, website, and related services operated by Xopera Technologies. By creating an account, starting a free trial, or using any part of the platform, you agree to be bound by these terms.',
            'If you are using TilePOS on behalf of a business or organization, you represent that you have authority to bind that entity to these terms. If you do not agree, you may not access or use the platform.',
        ],
    },
    {
        id: 'definitions',
        icon: HelpCircle,
        title: '2. Definitions',
        paragraphs: [
            '"Platform" means the TilePOS web application, associated APIs, and any related services provided by us.',
            '"Tenant" or "Workspace" means the isolated business environment created for your organization, including its users, data, settings, and modules.',
            '"User" means any individual invited to access a tenant workspace, including owners, administrators, and team members.',
            '"You" and "your" refer to the person or entity accepting these terms.',
        ],
    },
    {
        id: 'account',
        icon: UserCheck,
        title: '3. Account registration and responsibilities',
        paragraphs: [
            'To use TilePOS, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.',
            'You must immediately notify us of any unauthorized access or suspected breach. We are not liable for losses caused by your failure to keep credentials secure or by unauthorized use of your account.',
            'Account owners may invite users into their tenant workspace and are responsible for the actions of those users, including compliance with these terms.',
        ],
    },
    {
        id: 'subscriptions',
        icon: Wallet,
        title: '4. Subscription plans, billing, and trial',
        paragraphs: [
            'TilePOS offers Starter, Growth, and Enterprise subscription plans. Features, user limits, and warehouse limits are determined by the plan you select. Plan details and pricing are available on our Pricing page.',
            'New subscriptions may begin with a 14-day free trial. At the end of the trial, you must provide valid payment information to continue using the platform. If no payment method is added, access may be restricted.',
            'Billing occurs in advance for the selected period (monthly or annually). Fees are non-refundable except where required by law or explicitly stated in these terms.',
            'You may upgrade or downgrade your plan at any time. Upgrades take effect immediately and may be prorated. Downgrades take effect at the start of the next billing cycle.',
        ],
    },
    {
        id: 'acceptable-use',
        icon: ShieldCheck,
        title: '5. Acceptable use',
        paragraphs: [
            'You agree to use TilePOS only for lawful business purposes. You may not use the platform to store or transmit illegal content, harass others, distribute malware, or attempt to interfere with the platform’s security or availability.',
            'You may not reverse-engineer, scrape, or bypass any limitations of the platform unless explicitly permitted by us. You may not resell access to the platform without written authorization.',
            'We reserve the right to suspend or terminate accounts that violate these acceptable use rules or that create legal risk for us or other users.',
        ],
    },
    {
        id: 'data-ownership',
        icon: Lock,
        title: '6. Data ownership and privacy',
        paragraphs: [
            'You retain ownership of all business data, customer records, quotations, invoices, and other content that you or your users enter into the platform. We do not claim ownership over your data.',
            'We process your data in accordance with our Privacy Policy and Cookie Policy. You are responsible for ensuring that your use of the platform complies with applicable data protection laws, including obtaining any necessary consents from your customers.',
            'You may export your data at any time using the built-in export features available in your plan. Upon termination, your data will be retained for a limited period and then deleted in accordance with our retention policy.',
        ],
    },
    {
        id: 'intellectual-property',
        icon: Globe2,
        title: '7. Intellectual property',
        paragraphs: [
            'TilePOS and all related materials, including trademarks, logos, code, designs, and documentation, are the intellectual property of Xopera Technologies or its licensors. These terms do not grant you any license to use our intellectual property except as necessary to access the platform.',
            'You may provide feedback, suggestions, or feature requests. By doing so, you grant us a perpetual, royalty-free license to use that feedback to improve our products and services.',
        ],
    },
    {
        id: 'termination',
        icon: AlertCircle,
        title: '8. Termination and suspension',
        paragraphs: [
            'You may cancel your subscription at any time from your account settings. Upon cancellation, your access will continue until the end of the current billing period, unless terminated earlier by us.',
            'We may suspend or terminate your account immediately if you violate these terms, fail to pay fees when due, or if required to do so by law. Upon termination, you remain responsible for any outstanding fees.',
            'Provisions related to data ownership, intellectual property, liability, and governing law will survive termination.',
        ],
    },
    {
        id: 'disclaimers',
        icon: Scale,
        title: '9. Disclaimers and limitation of liability',
        paragraphs: [
            'TilePOS is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, error-free, or completely secure.',
            'To the maximum extent permitted by law, we will not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, including loss of profits, data, or business opportunities.',
            'Our total liability for any claim arising from these terms or your use of the platform will not exceed the amount you paid to us in the twelve months preceding the event giving rise to the claim.',
        ],
    },
    {
        id: 'indemnification',
        icon: CheckCircle2,
        title: '10. Indemnification',
        paragraphs: [
            'You agree to indemnify and hold harmless Xopera Technologies, its affiliates, officers, and employees from any claims, damages, or expenses arising out of your use of the platform, your data, or your violation of these terms.',
            'We will promptly notify you of any claim for which we seek indemnification and cooperate with your defense, at your expense.',
        ],
    },
    {
        id: 'governing-law',
        icon: Scale,
        title: '11. Governing law',
        paragraphs: [
            'These terms are governed by the laws of the jurisdiction in which Xopera Technologies is registered, without regard to conflict of law principles. Any dispute arising from these terms will be resolved in the competent courts of that jurisdiction.',
            'If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full effect.',
        ],
    },
    {
        id: 'changes',
        icon: AlertCircle,
        title: '12. Changes to these terms',
        paragraphs: [
            'We may update these Terms of Service from time to time. Material changes will be communicated by email or through a prominent notice within the platform. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.',
            'The "Last updated" date at the top of this page indicates when the terms were most recently revised.',
        ],
    },
    {
        id: 'contact',
        icon: HelpCircle,
        title: '13. Contact us',
        paragraphs: [
            'If you have questions about these Terms of Service, please contact us at legal@example.com. We will respond to substantive inquiries as quickly as possible.',
        ],
    },
];

export default function TermsOfService({
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
            <Head title={`Terms of Service - ${appName}`} />

            {/* Hero */}
            <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-white" />
                <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
                <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
                <div className="absolute top-40 -left-24 -z-10 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="font-600 animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1.5 text-xs text-brand-700">
                            <Scale className="h-3.5 w-3.5" />
                            Legal
                        </div>
                        <h1
                            className="font-800 animate-fade-up mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            Terms of{' '}
                            <span className="text-gradient">Service</span>
                        </h1>
                        <p
                            className="animate-fade-up mt-5 text-lg leading-relaxed text-ink-600"
                            style={{ animationDelay: '120ms' }}
                        >
                            The rules and conditions that govern your use of the{' '}
                            {appName} platform and tenant workspaces.
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
                                        Have a legal question?
                                    </h3>
                                    <p className="mt-2 text-sm text-ink-600">
                                        Contact us at{' '}
                                        <a
                                            href="mailto:legal@example.com"
                                            className="font-medium text-brand-600 hover:text-brand-700"
                                        >
                                            legal@example.com
                                        </a>
                                        .
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
