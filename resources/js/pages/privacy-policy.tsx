import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    Eye,
    FileText,
    Globe2,
    HelpCircle,
    Lock,
    Scale,
    ShieldCheck,
    UserCheck,
    Users,
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
        icon: ShieldCheck,
        title: '1. Introduction',
        paragraphs: [
            'TilePOS respects your privacy and is committed to protecting the personal and business data you entrust to us. This Privacy Policy explains how we collect, use, store, share, and safeguard your information when you use our website, platform, and services.',
            'This policy applies to account owners, invited users, customers whose data is entered into tenant workspaces, and anyone who visits our marketing website. By using TilePOS, you acknowledge and agree to the practices described in this policy.',
        ],
    },
    {
        id: 'information-we-collect',
        icon: FileText,
        title: '2. Information we collect',
        paragraphs: [
            'Account and contact information: When you register for an account or start a free trial, we collect your name, email address, business name, phone number, billing address, and payment details.',
            'Business data: As you use the platform, you or your team may enter customer records, supplier details, product catalogs, quotations, invoices, stock movements, payment records, and other business information. This data belongs to you and is processed on your behalf.',
            'Usage and technical data: We collect log data, IP addresses, browser types, device information, operating systems, pages visited, feature interactions, and error reports. This helps us operate, secure, and improve the platform.',
            'Communications: When you contact our support team or respond to surveys, we collect the content of those communications so we can assist you and improve our services.',
        ],
    },
    {
        id: 'how-we-use-information',
        icon: Eye,
        title: '3. How we use your information',
        paragraphs: [
            'To provide and maintain the platform, including authentication, tenant workspace management, data storage, backups, and customer support.',
            'To process transactions, manage subscriptions, send invoices, and handle payment-related communications.',
            'To understand how the platform is used, diagnose problems, develop new features, and improve performance and user experience.',
            'To communicate with you about product updates, security alerts, billing matters, and marketing content, where permitted by law. You can opt out of non-essential communications at any time.',
            'To comply with legal obligations, enforce our terms, and protect the rights, safety, and property of Xopera Technologies, our users, and the public.',
        ],
    },
    {
        id: 'legal-basis',
        icon: Scale,
        title: '4. Legal basis for processing',
        paragraphs: [
            'For users in the European Economic Area and other regions with similar laws, we process personal data only where we have a valid legal basis. These bases include:',
            'Performance of a contract: Processing necessary to provide the TilePOS service under our Terms of Service, such as authenticating users and storing business data.',
            'Legitimate interests: Processing needed for security, fraud prevention, product improvement, and internal analytics, balanced against your privacy rights.',
            'Consent: Processing where you have given clear consent, such as for marketing communications or non-essential cookies.',
            'Legal obligation: Processing required to comply with applicable laws, regulations, or lawful requests from authorities.',
        ],
    },
    {
        id: 'data-sharing',
        icon: Users,
        title: '5. Data sharing and subprocessors',
        paragraphs: [
            'We do not sell your personal information or business data to third parties. We share information only with trusted service providers who help us operate the platform, such as cloud hosting providers, payment processors, analytics services, and email delivery platforms.',
            'Each third-party provider is contractually required to use your data only for the purpose of providing services to us and to maintain appropriate security and confidentiality measures.',
            'We may disclose information if required by law, regulation, legal process, or to protect our rights, users, or the public. In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of that transaction, subject to confidentiality obligations.',
        ],
    },
    {
        id: 'data-retention',
        icon: Calendar,
        title: '6. Data retention',
        paragraphs: [
            'We retain your account information and business data for as long as your account is active or as needed to provide you with the platform. If you cancel your subscription, we typically retain your data for a limited period, such as 30 days, to allow for reactivation or export.',
            'After the retention period ends, we delete or anonymize your data in accordance with our internal policies, unless we are required to retain it for legal, tax, or accounting purposes.',
            'Aggregated and anonymized analytics data may be retained indefinitely because it cannot identify you or your business.',
        ],
    },
    {
        id: 'security',
        icon: Lock,
        title: '7. Data security',
        paragraphs: [
            'We implement industry-standard security measures to protect your data, including encryption in transit using TLS, encryption at rest using AES-256, and strict access controls. Our infrastructure is hosted on SOC 2 compliant providers with redundant systems and regular backups.',
            'Access to production data is restricted to authorized personnel who need it to perform their jobs. All employees are trained on data protection and confidentiality.',
            'No system can be completely secure. If we discover a data breach that affects your personal information, we will notify you and relevant authorities in accordance with applicable law.',
        ],
    },
    {
        id: 'your-rights',
        icon: UserCheck,
        title: '8. Your rights',
        paragraphs: [
            'Depending on your location, you may have rights to access, correct, delete, restrict, or port your personal data. You may also have the right to object to certain processing activities or withdraw consent where processing is based on consent.',
            'You can access and update much of your information directly from your account settings. To exercise other rights, or to request data deletion or export, contact us at privacy@example.com. We will respond within the timeframe required by applicable law.',
            'If you believe your rights have been violated, you have the right to lodge a complaint with your local data protection authority.',
        ],
    },
    {
        id: 'international-transfers',
        icon: Globe2,
        title: '9. International data transfers',
        paragraphs: [
            'TilePOS may store and process data in data centers located outside your country of residence. When we transfer personal data internationally, we use appropriate safeguards, such as standard contractual clauses or adequacy decisions, to ensure that your data remains protected.',
            'By using the platform, you consent to the transfer of your data to countries where our service providers operate, which may have different data protection laws than your own country.',
        ],
    },
    {
        id: 'cookies',
        icon: FileText,
        title: '10. Cookies and tracking',
        paragraphs: [
            'We use cookies and similar technologies to operate the platform, remember your preferences, analyze usage, and deliver relevant communications. For detailed information about the cookies we use and how to manage them, please see our Cookie Policy.',
            'You can manage cookie preferences through your browser settings or through any cookie consent banner presented on our website.',
        ],
    },
    {
        id: 'children',
        icon: Users,
        title: "11. Children's privacy",
        paragraphs: [
            'TilePOS is not intended for use by individuals under the age of 16, or the minimum age of digital consent in your jurisdiction. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us and we will delete it.',
        ],
    },
    {
        id: 'changes',
        icon: Calendar,
        title: '12. Changes to this Privacy Policy',
        paragraphs: [
            'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Material changes will be communicated by email or through a prominent notice in the platform.',
            'The "Last updated" date at the top of this page indicates when the policy was most recently revised. Continued use of the platform after changes take effect constitutes acceptance of the updated policy.',
        ],
    },
    {
        id: 'contact',
        icon: HelpCircle,
        title: '13. Contact us',
        paragraphs: [
            'If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at privacy@example.com. We are committed to addressing your concerns promptly and transparently.',
        ],
    },
];

export default function PrivacyPolicy({
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
            <Head title={`Privacy Policy - ${appName}`} />

            {/* Hero */}
            <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-white" />
                <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
                <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
                <div className="absolute top-40 -left-24 -z-10 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="font-600 animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1.5 text-xs text-brand-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Legal
                        </div>
                        <h1
                            className="font-800 animate-fade-up mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            Privacy{' '}
                            <span className="text-gradient">Policy</span>
                        </h1>
                        <p
                            className="animate-fade-up mt-5 text-lg leading-relaxed text-ink-600"
                            style={{ animationDelay: '120ms' }}
                        >
                            How {appName} collects, uses, secures, and protects
                            your personal and business data.
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
                                        Data questions?
                                    </h3>
                                    <p className="mt-2 text-sm text-ink-600">
                                        Contact us at{' '}
                                        <a
                                            href="mailto:privacy@example.com"
                                            className="font-medium text-brand-600 hover:text-brand-700"
                                        >
                                            privacy@example.com
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
