import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    Check,
    ChevronRight,
    CreditCard,
    HelpCircle,
    ShieldCheck,
    Sparkles,
    Users,
    X as XIcon,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useLenis } from '@/hooks/use-lenis';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import MarketingLayout from '@/layouts/marketing-layout';
import { register as tenantRegister } from '@/routes/tenant';

type BillingCycle = 'monthly' | 'yearly';

interface Plan {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    cta: string;
    popular?: boolean;
    features: string[];
    limitations: string[];
}

interface ComparisonRow {
    category?: string;
    feature: string;
    starter: boolean | string;
    growth: boolean | string;
    enterprise: boolean | string;
}

const plans: Plan[] = [
    {
        id: 'starter',
        name: 'Starter',
        description:
            'Perfect for a single-location tile retailer getting started with digital operations.',
        monthlyPrice: 29,
        yearlyPrice: 290,
        cta: 'Start free trial',
        features: [
            '1 tenant workspace',
            'Up to 2 users',
            '1 warehouse location',
            'Up to 500 customers',
            'Quotations & invoices',
            'Customer & supplier CRM',
            'Tile catalog (tiles, brands, sizes)',
            'Stock tracking & movement history',
            'Low-stock alerts',
            'Dashboard with KPIs',
            'Email support',
            '14-day free trial',
        ],
        limitations: [
            'No accounts payable/receivable module',
            'No built-in reports',
            'No CSV import/export',
            'No custom roles',
        ],
    },
    {
        id: 'growth',
        name: 'Growth',
        description:
            'For established retailers that need full financial tracking, analytics, and team controls.',
        monthlyPrice: 79,
        yearlyPrice: 790,
        cta: 'Start free trial',
        popular: true,
        features: [
            'Everything in Starter, plus:',
            'Up to 10 users',
            '3 warehouse locations',
            'Unlimited customers & suppliers',
            'Accounts payable & receivable',
            'Profit & loss report',
            'Aging payables / receivables',
            'Sales by product, brand, customer',
            'Stock valuation report',
            'CSV import & export',
            'Roles & permissions',
            'Feature flags per tenant',
            'Priority email support',
            '14-day free trial',
        ],
        limitations: [],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description:
            'For multi-location distributors and franchise networks that need scale, security, and dedicated support.',
        monthlyPrice: 199,
        yearlyPrice: 1990,
        cta: 'Contact sales',
        features: [
            'Everything in Growth, plus:',
            'Unlimited users',
            'Unlimited warehouse locations',
            'Multi-tenant architecture',
            'Dedicated account manager',
            'Custom onboarding & training',
            'SLA-backed support',
            'Advanced security controls',
            'Quarterly business reviews',
            'Custom integrations*',
            'Phone & priority chat support',
            '14-day free trial',
        ],
        limitations: [],
    },
];

const comparisonRows: ComparisonRow[] = [
    {
        category: 'Workspace',
        feature: 'Tenant workspaces',
        starter: '1',
        growth: '1',
        enterprise: 'Unlimited',
    },
    { feature: 'Users', starter: '2', growth: '10', enterprise: 'Unlimited' },
    {
        feature: 'Warehouse locations',
        starter: '1',
        growth: '3',
        enterprise: 'Unlimited',
    },

    {
        category: 'Sales & CRM',
        feature: 'Quotations & invoices',
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Customer & supplier directory',
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Quick-create customers/suppliers',
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Return & exchange receipts',
        starter: true,
        growth: true,
        enterprise: true,
    },
    { feature: 'PDF downloads', starter: true, growth: true, enterprise: true },

    {
        category: 'Inventory',
        feature: 'Tile catalog, brands, sizes',
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Products & purchase batches',
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Stock movement history',
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Low-stock / out-of-stock alerts',
        starter: true,
        growth: true,
        enterprise: true,
    },

    {
        category: 'Finance',
        feature: 'Dashboard KPIs',
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Accounts payable',
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Accounts receivable',
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Profit & loss report',
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Aging reports',
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Sales analysis',
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Stock valuation report',
        starter: false,
        growth: true,
        enterprise: true,
    },

    {
        category: 'Data & Admin',
        feature: 'CSV import',
        starter: false,
        growth: true,
        enterprise: true,
    },
    { feature: 'CSV export', starter: false, growth: true, enterprise: true },
    {
        feature: 'Users & roles',
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Feature flags per tenant',
        starter: false,
        growth: true,
        enterprise: true,
    },

    {
        category: 'Support',
        feature: 'Email support',
        starter: true,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Priority support',
        starter: false,
        growth: true,
        enterprise: true,
    },
    {
        feature: 'Dedicated account manager',
        starter: false,
        growth: false,
        enterprise: true,
    },
    {
        feature: 'SLA & onboarding',
        starter: false,
        growth: false,
        enterprise: true,
    },
];

const billingFaqs = [
    {
        q: 'Do you offer a free trial?',
        a: 'Yes. Every plan includes a 14-day free trial with full access to all included features. No credit card is required to start.',
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Absolutely. There are no long-term contracts. You can cancel from your billing settings at any time and your data remains accessible for 30 days.',
    },
    {
        q: 'What is the difference between monthly and annual billing?',
        a: 'Annual billing gives you 2 months free — a 20% discount compared to paying monthly. You can switch between monthly and annual billing at any time.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards and bank transfers for annual plans. Monthly plans are card-only.',
    },
    {
        q: 'Can I change my plan later?',
        a: 'Yes. You can upgrade or downgrade your plan at any time. Prorated credits or charges are applied automatically.',
    },
    {
        q: 'Is there a setup fee?',
        a: 'No. Starter and Growth plans are self-service. Enterprise includes custom onboarding at no additional setup fee.',
    },
];

const detailedNotes = [
    {
        icon: Users,
        title: 'Fair user pricing',
        description:
            'Starter is designed for owner-operators and a helper. Growth supports a small team with role-based access. Enterprise scales to any headcount.',
    },
    {
        icon: ShieldCheck,
        title: 'No hidden fees',
        description:
            'The price you see is the price you pay. There are no extra charges for quotations, invoices, customers, or PDF exports.',
    },
    {
        icon: CreditCard,
        title: 'Secure billing',
        description:
            'Billing is handled through a PCI-compliant provider. We never store raw card details on our servers.',
    },
    {
        icon: Calendar,
        title: 'Prorated changes',
        description:
            'Upgrade mid-cycle and only pay the difference for the remaining days. Downgrade credits are applied to your next invoice.',
    },
];

function formatPrice(price: number): string {
    return `$${price}`;
}

function BillingToggle({
    cycle,
    onChange,
}: {
    cycle: BillingCycle;
    onChange: (cycle: BillingCycle) => void;
}) {
    return (
        <div className="reveal inline-flex items-center rounded-xl border border-ink-200 bg-white p-1.5 shadow-card">
            <button
                type="button"
                onClick={() => onChange('monthly')}
                className={`font-600 rounded-lg px-5 py-2 text-sm transition-all ${
                    cycle === 'monthly'
                        ? 'shadow-soft bg-brand-600 text-white'
                        : 'text-ink-600 hover:bg-ink-50'
                }`}
            >
                Monthly
            </button>
            <button
                type="button"
                onClick={() => onChange('yearly')}
                className={`font-600 relative rounded-lg px-5 py-2 text-sm transition-all ${
                    cycle === 'yearly'
                        ? 'shadow-soft bg-brand-600 text-white'
                        : 'text-ink-600 hover:bg-ink-50'
                }`}
            >
                Yearly
                <span className="absolute -top-2.5 -right-2.5 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    Save 20%
                </span>
            </button>
        </div>
    );
}

function ComparisonCell({ value }: { value: boolean | string }) {
    if (typeof value === 'boolean') {
        return value ? (
            <Check className="h-5 w-5 text-brand-600" />
        ) : (
            <XIcon className="h-5 w-5 text-ink-300" />
        );
    }
    return <span className="font-600 text-sm text-ink-900">{value}</span>;
}

export default function Pricing({
    appName = 'TilePOS',
    tagline,
}: {
    appName?: string;
    tagline?: string;
}) {
    useLenis();
    useScrollReveal();
    const [cycle, setCycle] = useState<BillingCycle>('monthly');

    return (
        <MarketingLayout appName={appName} tagline={tagline}>
            <Head title={`Pricing - ${appName}`} />

            {/* Hero */}
            <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-white" />
                <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
                <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
                <div className="absolute top-40 -left-24 -z-10 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="font-600 animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1.5 text-xs text-brand-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-brand-500" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
                            </span>
                            Simple, transparent pricing
                        </div>

                        <h1
                            className="font-800 animate-fade-up mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            Plans that grow with your{' '}
                            <span className="text-gradient">tile business</span>
                        </h1>

                        <p
                            className="animate-fade-up mt-5 text-lg leading-relaxed text-ink-600"
                            style={{ animationDelay: '120ms' }}
                        >
                            Choose the plan that fits your team, warehouses, and
                            workflow. Start free for 14 days and upgrade
                            whenever you are ready.
                        </p>

                        <div
                            className="animate-fade-up mt-8 flex justify-center"
                            style={{ animationDelay: '180ms' }}
                        >
                            <BillingToggle cycle={cycle} onChange={setCycle} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing cards */}
            <section className="bg-gradient-to-b from-white to-brand-50/40 px-4 pb-16 sm:px-6 lg:pb-24">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {plans.map((plan, i) => {
                            const price =
                                cycle === 'monthly'
                                    ? plan.monthlyPrice
                                    : plan.yearlyPrice;
                            const period =
                                cycle === 'monthly' ? '/month' : '/year';

                            return (
                                <div
                                    key={plan.id}
                                    className={`reveal card-lift relative flex flex-col rounded-2xl border bg-white p-7 transition-all hover:shadow-card ${
                                        plan.popular
                                            ? 'shadow-glow border-brand-300'
                                            : 'border-ink-100 hover:border-brand-200'
                                    }`}
                                    style={{
                                        transitionDelay: `${i * 80}ms`,
                                    }}
                                >
                                    {plan.popular && (
                                        <span className="shadow-soft absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1 text-xs font-semibold text-white">
                                            Most popular
                                        </span>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="font-700 font-display text-xl text-ink-900">
                                            {plan.name}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-ink-600">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <div className="mb-6">
                                        <span className="font-800 font-display text-4xl text-ink-950">
                                            {formatPrice(price)}
                                        </span>
                                        <span className="text-ink-500">
                                            {period}
                                        </span>
                                        {cycle === 'yearly' && (
                                            <p className="mt-1 text-xs text-brand-600">
                                                Billed annually, 2 months free
                                            </p>
                                        )}
                                    </div>

                                    <Link
                                        href={tenantRegister.url()}
                                        className={`font-600 mb-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm transition-all ${
                                            plan.popular
                                                ? 'shadow-soft bg-brand-600 text-white hover:bg-brand-700'
                                                : 'border border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:bg-brand-50'
                                        }`}
                                    >
                                        {plan.cta}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>

                                    <div className="flex-1 space-y-4">
                                        <p className="font-600 text-xs tracking-wider text-ink-500 uppercase">
                                            What&apos;s included
                                        </p>
                                        <ul className="space-y-3">
                                            {plan.features.map((feature) => (
                                                <li
                                                    key={feature}
                                                    className="flex items-start gap-3 text-sm text-ink-700"
                                                >
                                                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50">
                                                        <Check className="h-3 w-3 text-brand-600" />
                                                    </span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        {plan.limitations.length > 0 && (
                                            <div className="pt-4">
                                                <p className="font-600 text-xs tracking-wider text-ink-500 uppercase">
                                                    Not included
                                                </p>
                                                <ul className="mt-3 space-y-3">
                                                    {plan.limitations.map(
                                                        (limitation) => (
                                                            <li
                                                                key={limitation}
                                                                className="flex items-start gap-3 text-sm text-ink-500"
                                                            >
                                                                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink-100">
                                                                    <XIcon className="h-3 w-3 text-ink-400" />
                                                                </span>
                                                                {limitation}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <p className="reveal mt-8 text-center text-sm text-ink-500">
                        All prices in USD. Local taxes may apply.
                    </p>
                </div>
            </section>

            {/* Detailed notes */}
            <section className="bg-white px-4 py-16 sm:px-6 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal mx-auto max-w-2xl text-center">
                        <span className="font-600 text-sm text-brand-600">
                            Pricing explained
                        </span>
                        <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                            Built for clarity, not surprises
                        </h2>
                        <p className="mt-4 text-lg text-ink-600">
                            We keep billing simple so you can focus on running
                            your business.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {detailedNotes.map((note, i) => (
                            <div
                                key={note.title}
                                className="reveal card-lift rounded-2xl border border-ink-100 bg-white p-6 hover:border-brand-200 hover:shadow-card"
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                <span className="shadow-glow grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white">
                                    <note.icon
                                        className="h-6 w-6"
                                        strokeWidth={2}
                                    />
                                </span>
                                <h3 className="font-700 mt-5 font-display text-lg text-ink-900">
                                    {note.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                                    {note.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison table */}
            <section className="bg-gradient-to-b from-brand-50/40 to-white px-4 py-16 sm:px-6 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal mx-auto max-w-2xl text-center">
                        <span className="font-600 text-sm text-brand-600">
                            Compare plans
                        </span>
                        <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                            Feature breakdown
                        </h2>
                        <p className="mt-4 text-lg text-ink-600">
                            See exactly what is included in each plan so you can
                            choose with confidence.
                        </p>
                    </div>

                    <div className="reveal mt-12 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] border-collapse">
                                <thead>
                                    <tr className="border-b border-ink-100 bg-ink-50/60">
                                        <th className="px-6 py-4 text-left font-display text-sm font-semibold text-ink-900">
                                            Feature
                                        </th>
                                        {plans.map((plan) => (
                                            <th
                                                key={plan.id}
                                                className="px-6 py-4 text-center font-display text-sm font-semibold text-ink-900"
                                            >
                                                {plan.name}
                                                {plan.popular && (
                                                    <span className="ml-2 inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                                                        Popular
                                                    </span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonRows.map((row, rowIndex) => (
                                        <tr
                                            key={row.feature + rowIndex}
                                            className={`border-b border-ink-100 last:border-0 ${
                                                row.category
                                                    ? 'bg-white'
                                                    : 'hover:bg-ink-50/40'
                                            }`}
                                        >
                                            <td className="px-6 py-4">
                                                {row.category && (
                                                    <span className="mb-1 block text-xs font-semibold tracking-wider text-brand-600 uppercase">
                                                        {row.category}
                                                    </span>
                                                )}
                                                <span className="text-sm font-medium text-ink-900">
                                                    {row.feature}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <ComparisonCell
                                                        value={row.starter}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <ComparisonCell
                                                        value={row.growth}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <ComparisonCell
                                                        value={row.enterprise}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Billing FAQ */}
            <section className="bg-white px-4 py-16 sm:px-6 lg:py-24">
                <div className="mx-auto max-w-3xl">
                    <div className="reveal text-center">
                        <span className="font-600 text-sm text-brand-600">
                            Billing questions
                        </span>
                        <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                            Common questions about pricing
                        </h2>
                    </div>

                    <div className="reveal mt-10 space-y-3">
                        {billingFaqs.map((item, i) => (
                            <div
                                key={i}
                                className="rounded-2xl border border-ink-100 bg-white p-5"
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                                        <HelpCircle className="h-4 w-4" />
                                    </span>
                                    <div>
                                        <h3 className="font-700 font-display text-base text-ink-900">
                                            {item.q}
                                        </h3>
                                        <p className="mt-1 text-sm leading-relaxed text-ink-600">
                                            {item.a}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                Ready to get started?
                            </h2>
                            <p className="mt-4 text-lg text-brand-50/90">
                                Start a 14-day free trial on any plan. No credit
                                card required.
                            </p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link
                                    href={tenantRegister.url()}
                                    className="font-600 shadow-soft inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm text-brand-700 transition hover:bg-ink-50"
                                >
                                    Start free trial
                                    <Zap className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/contact-us"
                                    className="font-600 inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm text-white transition hover:bg-white/10"
                                >
                                    Contact sales
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
