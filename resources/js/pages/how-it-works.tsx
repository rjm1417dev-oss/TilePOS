import { Head, Link } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowRight,
    Banknote,
    BarChart3,
    Bell,
    Calculator,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Download,
    FileCheck,
    FileText,
    KeyRound,
    Layers,
    LayoutDashboard,
    Package,
    Receipt,
    Rocket,
    RotateCcw,
    Settings2,
    ShieldCheck,
    Sparkles,
    Truck,
    Users,
    Wallet,
} from 'lucide-react';
import type { ElementType } from 'react';
import { useLenis } from '@/hooks/use-lenis';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import MarketingLayout from '@/layouts/marketing-layout';
import { register as tenantRegister } from '@/routes/tenant';

interface FlowStep {
    icon: ElementType;
    title: string;
    description: string;
}

interface WorkflowSection {
    id: string;
    icon: ElementType;
    title: string;
    summary: string;
    steps: FlowStep[];
    details: {
        icon: ElementType;
        title: string;
        description: string;
        accent: 'brand' | 'accent';
    }[];
}

const accentMap = {
    brand: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100',
    accent: 'bg-accent-50 text-accent-600 group-hover:bg-accent-100',
};

const heroHighlights = [
    'Multi-tenant setup',
    'No-code configuration',
    'Role-based access',
    'End-to-end workflow',
];

const gettingStartedSteps: FlowStep[] = [
    {
        icon: Rocket,
        title: 'Create your workspace',
        description:
            'Sign up and get an isolated tenant with your branding, currency, and tax settings in seconds.',
    },
    {
        icon: Download,
        title: 'Import your data',
        description:
            'Bring in customers, suppliers, and products using validated CSV templates with clear error feedback.',
    },
    {
        icon: Settings2,
        title: 'Configure modules',
        description:
            'Enable the features you need — quotations, tile returns, payables, receivables — and set roles.',
    },
    {
        icon: FileText,
        title: 'Start transacting',
        description:
            'Create quotations, manage stock, issue invoices, and let the dashboard track everything.',
    },
];

const workflowSections: WorkflowSection[] = [
    {
        id: 'sales',
        icon: FileText,
        title: 'Quotation to payment',
        summary:
            'See how a customer inquiry turns into a quote, invoice, and recorded payment — all in one smooth flow.',
        steps: [
            {
                icon: Users,
                title: 'Add the customer',
                description:
                    'Select an existing customer or quick-create a new one directly from the quotation screen.',
            },
            {
                icon: ClipboardList,
                title: 'Build the quotation',
                description:
                    'Add tiles with size, brand, area, wastage, and box quantity. Discounts and tax are applied automatically.',
            },
            {
                icon: Calculator,
                title: 'Auto-calculate totals',
                description:
                    'The system calculates area, wastage, boxes, tax, and the final amount with no manual spreadsheet work.',
            },
            {
                icon: FileCheck,
                title: 'Convert to invoice',
                description:
                    'When the customer approves, convert the quote to an invoice with one click and track payment status.',
            },
            {
                icon: Wallet,
                title: 'Record payment',
                description:
                    'Mark the invoice as paid and update the customer’s receivables balance automatically.',
            },
        ],
        details: [
            {
                icon: FileText,
                title: 'Auto-numbered documents',
                description:
                    'Quotations and invoices receive unique numbers so nothing gets lost or duplicated.',
                accent: 'brand',
            },
            {
                icon: Download,
                title: 'PDF downloads',
                description:
                    'Export professional PDFs for quotations and return receipts to share with customers.',
                accent: 'accent',
            },
            {
                icon: Calculator,
                title: 'Tile-area math',
                description:
                    'Wastage, box count, and coverage are handled automatically for every line item.',
                accent: 'brand',
            },
        ],
    },
    {
        id: 'inventory',
        icon: Package,
        title: 'Inventory lifecycle',
        summary:
            'Follow stock from purchase to sale, return, and reorder — with real-time quantity updates and alerts.',
        steps: [
            {
                icon: Truck,
                title: 'Purchase stock',
                description:
                    'Record supplier purchase batches and link them to products so cost and quantity are tracked.',
            },
            {
                icon: Layers,
                title: 'Catalog tiles',
                description:
                    'Maintain a clean catalog of tiles, brands, sizes, finishes, and box quantities for fast quoting.',
            },
            {
                icon: Package,
                title: 'Sell & dispatch',
                description:
                    'When an invoice is created, available stock is reduced automatically and movement history is recorded.',
            },
            {
                icon: RotateCcw,
                title: 'Handle returns',
                description:
                    'Issue return receipts, process exchanges, restock items, and calculate payment differences.',
            },
            {
                icon: Bell,
                title: 'Reorder alerts',
                description:
                    'Get low-stock and out-of-stock alerts before you miss a sale or over-promise stock.',
            },
        ],
        details: [
            {
                icon: Package,
                title: 'Multi-warehouse stock',
                description:
                    'Track quantities per warehouse and view full movement history for every SKU.',
                accent: 'brand',
            },
            {
                icon: Bell,
                title: 'Smart alerts',
                description:
                    'Notifications appear when stock falls below safe levels or runs out completely.',
                accent: 'accent',
            },
            {
                icon: Truck,
                title: 'Supplier-linked batches',
                description:
                    'Every purchase batch is tied to a supplier for accurate costing and payables tracking.',
                accent: 'brand',
            },
        ],
    },
    {
        id: 'finance',
        icon: Banknote,
        title: 'Finance & reporting',
        summary:
            'Record money in and out, then turn transactions into clear reports and dashboards.',
        steps: [
            {
                icon: Banknote,
                title: 'Record payables',
                description:
                    'Enter what you owe suppliers and track due dates so you never miss a payment.',
            },
            {
                icon: Receipt,
                title: 'Record receivables',
                description:
                    'Track customer payments and outstanding balances directly from invoices.',
            },
            {
                icon: LayoutDashboard,
                title: 'View dashboard',
                description:
                    'See receivables, earnings, orders, and low-stock alerts on a single live dashboard.',
            },
            {
                icon: BarChart3,
                title: 'Run reports',
                description:
                    'Generate P&L, aging, sales-by-product, sales-by-brand, and stock valuation reports.',
            },
        ],
        details: [
            {
                icon: BarChart3,
                title: 'Built-in reports',
                description:
                    'Profit & loss, aging, sales analysis, and stock valuation are all included.',
                accent: 'brand',
            },
            {
                icon: Receipt,
                title: 'Customer balances',
                description:
                    'Every customer card shows outstanding balance and full payment history.',
                accent: 'accent',
            },
            {
                icon: Banknote,
                title: 'Supplier dues',
                description:
                    'Payables are tracked per supplier with due dates and payment history.',
                accent: 'brand',
            },
        ],
    },
];

const platformCards = [
    {
        icon: KeyRound,
        title: 'Roles & permissions',
        description:
            'Create custom roles and control who can quote, view reports, import, or export data.',
        accent: 'brand',
    },
    {
        icon: Download,
        title: 'Bulk import & export',
        description:
            'Move data in and out via CSV with templates and filter-aware exports.',
        accent: 'accent',
    },
    {
        icon: Settings2,
        title: 'Feature flags',
        description:
            'Turn modules on or off per tenant so every workspace stays focused.',
        accent: 'brand',
    },
    {
        icon: ShieldCheck,
        title: 'Tenant isolation',
        description:
            'Each business has its own isolated workspace, users, and data.',
        accent: 'accent',
    },
];

function HorizontalFlow({ steps }: { steps: FlowStep[] }) {
    return (
        <div className="reveal">
            <div className="flex flex-col items-stretch gap-6 lg:flex-row lg:items-start">
                {steps.map((step, i) => (
                    <div
                        key={step.title}
                        className="group relative flex flex-1 items-center gap-5 lg:flex-col lg:gap-6"
                    >
                        <div className="flex flex-col items-center text-center">
                            <span className="shadow-glow relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 text-white transition-transform group-hover:scale-105">
                                <step.icon
                                    className="h-7 w-7"
                                    strokeWidth={2}
                                />
                                <span className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-accent-500 text-xs font-bold text-white shadow-sm">
                                    {i + 1}
                                </span>
                            </span>
                            <h3 className="font-700 mt-5 font-display text-lg text-ink-900">
                                {step.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-600">
                                {step.description}
                            </p>
                        </div>

                        {i < steps.length - 1 && (
                            <>
                                <ArrowRight className="hidden h-6 w-6 shrink-0 text-brand-300 lg:block" />
                                <ArrowDown className="h-6 w-6 shrink-0 text-brand-300 lg:hidden" />
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function VerticalWorkflow({ steps }: { steps: FlowStep[] }) {
    return (
        <div className="reveal relative">
            <div className="absolute top-6 bottom-6 left-8 hidden w-0.5 bg-gradient-to-b from-brand-200 via-brand-300 to-brand-200 lg:left-10" />

            <div className="space-y-8">
                {steps.map((step, i) => (
                    <div
                        key={step.title}
                        className="group relative flex items-start gap-6"
                    >
                        <span className="shadow-glow relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 text-white transition-transform group-hover:scale-105 lg:h-16 lg:w-16">
                            <step.icon
                                className="h-6 w-6 lg:h-7 lg:w-7"
                                strokeWidth={2}
                            />
                            <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-accent-500 text-xs font-bold text-white shadow-sm">
                                {i + 1}
                            </span>
                        </span>

                        <div className="card-lift flex-1 rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all hover:border-brand-200">
                            <h3 className="font-700 font-display text-lg text-ink-900">
                                {step.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-600">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function HowItWorks({
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
            <Head title={`How It Works - ${appName}`} />

            {/* Hero */}
            <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
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
                            How it works
                        </div>

                        <h1
                            className="font-800 animate-fade-up mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            Your tile business workflow,{' '}
                            <span className="text-gradient">simplified</span>
                        </h1>

                        <p
                            className="animate-fade-up mt-5 text-lg leading-relaxed text-ink-600"
                            style={{ animationDelay: '120ms' }}
                        >
                            From setup to sale, return, and report — see how
                            every part of your operation fits together inside{' '}
                            {appName}.
                        </p>

                        <div
                            className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-3"
                            style={{ animationDelay: '180ms' }}
                        >
                            <Link
                                href={tenantRegister.url()}
                                className="font-600 hover:shadow-glow inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm text-white shadow-card transition-all hover:bg-brand-700"
                            >
                                Start 14-day free trial
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="#sales"
                                className="font-600 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3.5 text-sm text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                            >
                                See the workflow
                            </a>
                        </div>

                        <div
                            className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-500"
                            style={{ animationDelay: '240ms' }}
                        >
                            {heroHighlights.map((h) => (
                                <span
                                    key={h}
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-brand-500" />
                                    {h}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Getting started flowchart */}
            <section className="bg-gradient-to-b from-white to-brand-50/40 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="reveal mx-auto max-w-2xl text-center">
                        <span className="font-600 text-sm text-brand-600">
                            Getting started
                        </span>
                        <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                            From sign-up to first sale
                        </h2>
                        <p className="mt-4 text-lg text-ink-600">
                            Four simple steps to get your tenant workspace ready
                            and start transacting.
                        </p>
                    </div>

                    <div className="mt-14">
                        <HorizontalFlow steps={gettingStartedSteps} />
                    </div>
                </div>
            </section>

            {/* Workflow sections */}
            {workflowSections.map((section, sectionIndex) => (
                <section
                    key={section.id}
                    id={section.id}
                    className={`py-16 lg:py-24 ${
                        sectionIndex % 2 === 0
                            ? 'bg-white'
                            : 'bg-gradient-to-b from-white to-brand-50/40'
                    }`}
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="reveal mb-12 flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
                            <div className="lg:max-w-md">
                                <span className="shadow-glow grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white">
                                    <section.icon
                                        className="h-6 w-6"
                                        strokeWidth={2}
                                    />
                                </span>
                                <h2 className="font-700 mt-5 font-display text-2xl tracking-tight text-ink-950 sm:text-3xl lg:text-4xl">
                                    {section.title}
                                </h2>
                                <p className="mt-3 text-base leading-relaxed text-ink-600 lg:text-lg">
                                    {section.summary}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
                            <VerticalWorkflow steps={section.steps} />

                            <div className="grid content-start gap-5">
                                {section.details.map((detail, i) => (
                                    <div
                                        key={detail.title}
                                        className="reveal card-lift group flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5 hover:border-brand-200 hover:shadow-card"
                                        style={{
                                            transitionDelay: `${i * 60}ms`,
                                        }}
                                    >
                                        <span
                                            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${
                                                accentMap[
                                                    detail.accent as keyof typeof accentMap
                                                ]
                                            }`}
                                        >
                                            <detail.icon
                                                className="h-5 w-5"
                                                strokeWidth={2}
                                            />
                                        </span>
                                        <div>
                                            <h3 className="font-700 font-display text-base text-ink-900">
                                                {detail.title}
                                            </h3>
                                            <p className="mt-1 text-sm leading-relaxed text-ink-600">
                                                {detail.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* Platform administration */}
            <section className="bg-white py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="reveal mx-auto max-w-2xl text-center">
                        <span className="font-600 text-sm text-brand-600">
                            Platform
                        </span>
                        <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                            Security, access, and data control
                        </h2>
                        <p className="mt-4 text-lg text-ink-600">
                            The admin layer keeps every tenant organized,
                            secure, and easy to manage.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {platformCards.map((card, i) => (
                            <div
                                key={card.title}
                                className="reveal card-lift group rounded-2xl border border-ink-100 bg-white p-6 hover:border-brand-200 hover:shadow-card"
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                <span
                                    className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
                                        accentMap[
                                            card.accent as keyof typeof accentMap
                                        ]
                                    }`}
                                >
                                    <card.icon
                                        className="h-5 w-5"
                                        strokeWidth={2}
                                    />
                                </span>
                                <h3 className="font-700 mt-4 font-display text-lg text-ink-900">
                                    {card.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                                    {card.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Summary strip */}
            <section className="border-y border-ink-100 bg-ink-950 py-14 lg:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="reveal grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: Rocket,
                                value: '4 steps',
                                label: 'To launch a tenant',
                            },
                            {
                                icon: FileText,
                                value: '3 clicks',
                                label: 'Quote to invoice',
                            },
                            {
                                icon: ShieldCheck,
                                value: '100%',
                                label: 'Permission aware',
                            },
                            {
                                icon: Sparkles,
                                value: '14 days',
                                label: 'Free trial',
                            },
                        ].map((stat, i) => (
                            <div
                                key={stat.label}
                                className="reveal flex items-center gap-4"
                                style={{ transitionDelay: `${i * 60}ms` }}
                            >
                                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-400">
                                    <stat.icon
                                        className="h-6 w-6"
                                        strokeWidth={2}
                                    />
                                </span>
                                <div>
                                    <p className="font-800 font-display text-2xl text-white">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-ink-400">
                                        {stat.label}
                                    </p>
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
                                Ready to see it flow?
                            </h2>
                            <p className="mt-4 text-lg text-brand-50/90">
                                Start your free trial and walk through the
                                entire workflow with your own data.
                            </p>
                            <Link
                                href={tenantRegister.url()}
                                className="font-600 shadow-soft mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm text-brand-700 transition hover:bg-ink-50"
                            >
                                Start free trial
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
