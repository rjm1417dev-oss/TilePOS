import { Head, Link } from '@inertiajs/react';
import {
    Banknote,
    BarChart3,
    Bell,
    Boxes,
    Building2,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Download,
    FileDown,
    FileOutput,
    FileText,
    KeyRound,
    Layers,
    LayoutDashboard,
    Package,
    Receipt,
    RotateCcw,
    Ruler,
    Settings2,
    ShieldCheck,
    Sparkles,
    Tag,
    Truck,
    UserCog,
    Users,
    Wallet,
    Zap,
} from 'lucide-react';
import type { ElementType } from 'react';
import { useLenis } from '@/hooks/use-lenis';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import MarketingLayout from '@/layouts/marketing-layout';
import { register as tenantRegister } from '@/routes/tenant';

interface FeatureCard {
    icon: ElementType;
    title: string;
    description: string;
    bullets: string[];
    accent: 'brand' | 'accent';
}

interface FeatureCategory {
    id: string;
    icon: ElementType;
    title: string;
    summary: string;
    features: FeatureCard[];
}

const accentMap = {
    brand: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100',
    accent: 'bg-accent-50 text-accent-600 group-hover:bg-accent-100',
};

const categories: FeatureCategory[] = [
    {
        id: 'overview',
        icon: LayoutDashboard,
        title: 'Dashboard & Overview',
        summary:
            'A single pane of glass for your business. Track revenue, receivables, orders, and stock health in real time.',
        features: [
            {
                icon: LayoutDashboard,
                title: 'Executive KPIs',
                description:
                    'See receivables, monthly earnings, orders, and low-stock alerts the moment you log in.',
                bullets: [
                    'Receivables, earnings, and orders counters',
                    'Sales trend mini-chart',
                    'Recent orders and quotations feed',
                    'Low-stock and out-of-stock alerts',
                ],
                accent: 'brand',
            },
            {
                icon: Zap,
                title: 'Quick actions',
                description:
                    'Jump straight into the most common tasks without hunting through menus.',
                bullets: [
                    'New quotation, invoice, or return',
                    'Add stock or product quickly',
                    'One-click CSV import/export',
                    'Role-aware shortcuts',
                ],
                accent: 'accent',
            },
            {
                icon: Bell,
                title: 'Notifications',
                description:
                    'Stay on top of payments, stock events, and system updates with a built-in notification center.',
                bullets: [
                    'Unread notification badge',
                    'Mark all as read in one click',
                    'Tied to real business events',
                    'Mobile-friendly dropdown',
                ],
                accent: 'brand',
            },
        ],
    },
    {
        id: 'sales',
        icon: FileText,
        title: 'Sales & Orders',
        summary:
            'From the first quote to the final invoice and return, manage the entire sales workflow in one place.',
        features: [
            {
                icon: ClipboardList,
                title: 'Quotations & Orders',
                description:
                    'Create professional, auto-numbered quotations with tile-area, wastage, and box calculations.',
                bullets: [
                    'Area, wastage, and box quantity math',
                    'Discounts, tax, and line-item notes',
                    'Convert quotations to invoices',
                    'Download PDFs for customers',
                ],
                accent: 'brand',
            },
            {
                icon: FileText,
                title: 'Invoices',
                description:
                    'Turn approved quotes into invoices, track payment status, and export printable documents.',
                bullets: [
                    'Quote-to-invoice conversion',
                    'Payment status tracking',
                    'Invoice numbering and history',
                    'PDF download ready',
                ],
                accent: 'accent',
            },
            {
                icon: Users,
                title: 'Customer management',
                description:
                    'Centralized CRM with quick-create, order history, and regular-customer detection.',
                bullets: [
                    'Quick-create from quotation screen',
                    'Full customer directory',
                    'Order and payment history',
                    'Regular-customer identification',
                ],
                accent: 'brand',
            },
            {
                icon: RotateCcw,
                title: 'Returns & exchanges',
                description:
                    'Issue return receipts, handle exchanges, calculate payment differences, and download receipts.',
                bullets: [
                    'Return receipt with unique number',
                    'Exchange handling and difference math',
                    'Customer tile lookup',
                    'PDF receipt download',
                ],
                accent: 'accent',
            },
        ],
    },
    {
        id: 'inventory',
        icon: Boxes,
        title: 'Inventory & Catalog',
        summary:
            'Build a rich tile catalog, manage stock across warehouses, and never run out of best-sellers.',
        features: [
            {
                icon: Layers,
                title: 'Tile catalog',
                description:
                    'Manage tile SKUs with size, brand, finish, box quantity, and every detail your team needs.',
                bullets: [
                    'Size, brand, and finish attributes',
                    'Box quantity and coverage math',
                    'Quick search and filtering',
                    'Feature-flag support',
                ],
                accent: 'brand',
            },
            {
                icon: Tag,
                title: 'Brands & sizes',
                description:
                    'Keep master data clean with dedicated modules for brands and tile dimensions.',
                bullets: [
                    'Brand directory with logos',
                    'Size master for fast quoting',
                    'Linked to products and stock',
                    'Easy CRUD with permissions',
                ],
                accent: 'accent',
            },
            {
                icon: Boxes,
                title: 'Stock control',
                description:
                    'Track stock levels per warehouse, record movements, and get low-stock alerts before you sell out.',
                bullets: [
                    'Stock per warehouse',
                    'Movement history with batch details',
                    'Low-stock and out-of-stock alerts',
                    'Purchase-batch tracking',
                ],
                accent: 'brand',
            },
            {
                icon: Package,
                title: 'Products',
                description:
                    'Full product management with supplier links, pricing, and purchase batch history.',
                bullets: [
                    'Supplier-linked purchase batches',
                    'Cost and sale pricing',
                    'Inventory availability per SKU',
                    'CSV import support',
                ],
                accent: 'accent',
            },
            {
                icon: Ruler,
                title: 'Measurement helpers',
                description:
                    'Built-in tile-size references make quoting faster and reduce manual entry errors.',
                bullets: [
                    'Predefined size library',
                    'Auto-fill on quotation lines',
                    'Consistent catalog data',
                    'Permission-controlled editing',
                ],
                accent: 'brand',
            },
        ],
    },
    {
        id: 'finance',
        icon: Wallet,
        title: 'Finance & Accounts',
        summary:
            'Know exactly who owes you and what you owe, with simple cash-flow tracking tied to every transaction.',
        features: [
            {
                icon: Receipt,
                title: 'Accounts receivable',
                description:
                    'Track outstanding balances and customer payments with a dedicated receivables ledger.',
                bullets: [
                    'Outstanding balance per customer',
                    'Payment recording and history',
                    'Receivables aging report',
                    'Dashboard summary tile',
                ],
                accent: 'brand',
            },
            {
                icon: Banknote,
                title: 'Accounts payable',
                description:
                    'Record supplier dues, manage due dates, and stay ahead of outgoing payments.',
                bullets: [
                    'Payables per supplier',
                    'Due-date tracking',
                    'Payment history',
                    'Payables aging report',
                ],
                accent: 'accent',
            },
            {
                icon: Wallet,
                title: 'Cash-flow visibility',
                description:
                    'See receivables and payables together on the dashboard for instant cash-flow awareness.',
                bullets: [
                    'Net position at a glance',
                    'Monthly trend indicators',
                    'Drill down to details',
                    'Role-based access',
                ],
                accent: 'brand',
            },
        ],
    },
    {
        id: 'reports',
        icon: BarChart3,
        title: 'Reports & Analytics',
        summary:
            'Turn everyday transactions into actionable insights with built-in reports designed for the tile trade.',
        features: [
            {
                icon: BarChart3,
                title: 'Profit & loss',
                description:
                    'Understand revenue, costs, and margins over any period to make smarter pricing decisions.',
                bullets: [
                    'Revenue and cost breakdown',
                    'Period-based filtering',
                    'Margin analysis',
                    'Export-ready format',
                ],
                accent: 'brand',
            },
            {
                icon: BarChart3,
                title: 'Aging reports',
                description:
                    'Keep collections and payments on track with payables and receivables aging.',
                bullets: [
                    'Receivables aging buckets',
                    'Payables aging buckets',
                    'Overdue highlighting',
                    'Customer/supplier drill-down',
                ],
                accent: 'accent',
            },
            {
                icon: BarChart3,
                title: 'Sales analysis',
                description:
                    'Slice sales by product, brand, and customer to find your best performers.',
                bullets: [
                    'Sales by product',
                    'Sales by brand',
                    'Sales by customer',
                    'Date-range filtering',
                ],
                accent: 'brand',
            },
            {
                icon: BarChart3,
                title: 'Stock valuation',
                description:
                    'Value inventory at cost and know your stock position in real time.',
                bullets: [
                    'Quantity on hand',
                    'Cost and value totals',
                    'Warehouse-level view',
                    'PDF/CSV export ready',
                ],
                accent: 'accent',
            },
        ],
    },
    {
        id: 'admin',
        icon: Settings2,
        title: 'Administration & Data',
        summary:
            'Control access, move data in and out, and configure the workspace to match how your business works.',
        features: [
            {
                icon: KeyRound,
                title: 'Roles & permissions',
                description:
                    'Create custom roles like Salesperson or Accountant and restrict access to sensitive modules.',
                bullets: [
                    'Granular view/create/edit/delete permissions',
                    'Custom role definitions',
                    'User-to-role assignment',
                    'Feature-key gating',
                ],
                accent: 'brand',
            },
            {
                icon: UserCog,
                title: 'User management',
                description:
                    'Invite team members, assign roles, and keep your workspace secure.',
                bullets: [
                    'Invite and deactivate users',
                    'Role assignment',
                    'Workspace-specific access',
                    'Audit-friendly user list',
                ],
                accent: 'accent',
            },
            {
                icon: FileDown,
                title: 'Bulk import',
                description:
                    'Bring in customers, suppliers, and products with validated CSV templates and clear error messages.',
                bullets: [
                    'Downloadable CSV templates',
                    'Column validation',
                    'Row-level error feedback',
                    'Support for major modules',
                ],
                accent: 'brand',
            },
            {
                icon: FileOutput,
                title: 'Bulk export',
                description:
                    'Export any module to CSV for backups, accounting, or deeper analysis in your favorite tools.',
                bullets: [
                    'Export whole modules',
                    'Filter-aware export',
                    'CSV download',
                    'Backup-friendly format',
                ],
                accent: 'accent',
            },
            {
                icon: Settings2,
                title: 'Feature flags',
                description:
                    'Turn modules on or off per tenant so every workspace only sees what it actually uses.',
                bullets: [
                    'Tiles, returns, payables, receivables toggles',
                    'Per-tenant configuration',
                    'No-code enablement',
                    'Clean, focused sidebar',
                ],
                accent: 'brand',
            },
        ],
    },
    {
        id: 'platform',
        icon: Building2,
        title: 'Platform & Security',
        summary:
            'Built for multi-tenant SaaS delivery with isolation, secure access, and a polished professional experience.',
        features: [
            {
                icon: Building2,
                title: 'Multi-tenant workspaces',
                description:
                    'Each business gets its own isolated tenant with data, users, and settings fully separated.',
                bullets: [
                    'One tenant per business',
                    'Isolated data and users',
                    'Self-service registration',
                    'Single-installation scalability',
                ],
                accent: 'brand',
            },
            {
                icon: ShieldCheck,
                title: 'Security & access',
                description:
                    'Permission-based navigation, verified email flows, and subscription gating keep your data safe.',
                bullets: [
                    'Role-based sidebar navigation',
                    'Verified email requirements',
                    'Subscription status checks',
                    'Impersonation read-only mode',
                ],
                accent: 'accent',
            },
            {
                icon: Download,
                title: 'PDF documents',
                description:
                    'Generate and download professional PDFs for quotations and return receipts.',
                bullets: [
                    'Quotation PDF download',
                    'Return receipt PDF',
                    'Clean, branded layout',
                    'Print-ready output',
                ],
                accent: 'brand',
            },
            {
                icon: Truck,
                title: 'Supplier management',
                description:
                    'Track vendors, link them to purchase batches, and manage payables in one place.',
                bullets: [
                    'Supplier directory',
                    'Quick-create from product screen',
                    'Purchase batch linkage',
                    'Payables tracking',
                ],
                accent: 'accent',
            },
        ],
    },
];

const heroHighlights = [
    'Multi-tenant ERP',
    'Role-based access',
    'PDF exports',
    'CSV import/export',
];

export default function FeaturesPage({
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
            <Head title={`Features - ${appName}`} />

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
                            Built for tile retailers & distributors
                        </div>

                        <h1
                            className="font-800 animate-fade-up mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            Everything your tenant panel{' '}
                            <span className="text-gradient">can do</span>
                        </h1>

                        <p
                            className="animate-fade-up mt-5 text-lg leading-relaxed text-ink-600"
                            style={{ animationDelay: '120ms' }}
                        >
                            From the first customer quotation to the final
                            invoice, return, and report — {appName} gives your
                            team a complete, modern ERP inside every tenant
                            workspace.
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
                                Explore features
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

            {/* Category sections */}
            {categories.map((category, categoryIndex) => (
                <section
                    key={category.id}
                    id={category.id}
                    className={`py-16 lg:py-24 ${
                        categoryIndex % 2 === 1
                            ? 'bg-gradient-to-b from-white to-brand-50/40'
                            : 'bg-white'
                    }`}
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="reveal flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
                            <div className="lg:sticky lg:top-24 lg:max-w-xs">
                                <span className="shadow-glow grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white">
                                    <category.icon
                                        className="h-6 w-6"
                                        strokeWidth={2}
                                    />
                                </span>
                                <h2 className="font-700 mt-5 font-display text-2xl tracking-tight text-ink-950 sm:text-3xl">
                                    {category.title}
                                </h2>
                                <p className="mt-3 text-base leading-relaxed text-ink-600">
                                    {category.summary}
                                </p>
                            </div>

                            <div className="grid flex-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {category.features.map((feature, i) => (
                                    <div
                                        key={feature.title}
                                        className="reveal card-lift group flex flex-col rounded-2xl border border-ink-100 bg-white p-6 hover:border-brand-200 hover:shadow-card"
                                        style={{
                                            transitionDelay: `${(i % 3) * 60}ms`,
                                        }}
                                    >
                                        <span
                                            className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
                                                accentMap[
                                                    feature.accent as keyof typeof accentMap
                                                ]
                                            }`}
                                        >
                                            <feature.icon
                                                className="h-5 w-5"
                                                strokeWidth={2}
                                            />
                                        </span>
                                        <h3 className="font-700 mt-4 font-display text-lg text-ink-900">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-ink-600">
                                            {feature.description}
                                        </p>
                                        <ul className="mt-4 space-y-2">
                                            {feature.bullets.map((bullet) => (
                                                <li
                                                    key={bullet}
                                                    className="flex items-start gap-2 text-sm text-ink-600"
                                                >
                                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            ))}

            {/* Feature summary strip */}
            <section className="border-y border-ink-100 bg-ink-950 py-14 lg:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="reveal grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: LayoutDashboard,
                                value: '7',
                                label: 'Feature categories',
                            },
                            {
                                icon: Boxes,
                                value: '30+',
                                label: 'Tenant features',
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

            {/* Final CTA */}
            <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-14 sm:px-12 lg:py-20">
                        <div className="bg-dots absolute inset-0 opacity-20" />
                        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
                        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />
                        <div className="relative">
                            <h2 className="font-800 font-display text-3xl tracking-tight text-white sm:text-4xl">
                                Ready to see it in action?
                            </h2>
                            <p className="mt-4 text-lg text-brand-50/90">
                                Start your free 14-day trial and explore every
                                tenant feature with your own data.
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
