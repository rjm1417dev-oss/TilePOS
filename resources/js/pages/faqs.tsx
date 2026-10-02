import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Boxes,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    CreditCard,
    FileText,
    HelpCircle,
    MessageCircle,
    Rocket,
    Search,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLenis } from '@/hooks/use-lenis';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import MarketingLayout from '@/layouts/marketing-layout';
import { register as tenantRegister } from '@/routes/tenant';

type CategoryId =
    | 'all'
    | 'getting-started'
    | 'quotations'
    | 'inventory'
    | 'finance'
    | 'security'
    | 'billing';

interface FaqItem {
    category: CategoryId;
    q: string;
    a: string;
}

const categories: { id: CategoryId; label: string; icon: React.ElementType }[] =
    [
        { id: 'all', label: 'All FAQs', icon: HelpCircle },
        { id: 'getting-started', label: 'Getting Started', icon: Rocket },
        { id: 'quotations', label: 'Quotations & Invoices', icon: FileText },
        { id: 'inventory', label: 'Inventory & Catalog', icon: Boxes },
        { id: 'finance', label: 'Reports & Finance', icon: BarChart3 },
        { id: 'security', label: 'Users & Security', icon: ShieldCheck },
        { id: 'billing', label: 'Billing & Data', icon: CreditCard },
    ];

const faqs: FaqItem[] = [
    // Getting Started
    {
        category: 'getting-started',
        q: 'What is a tenant workspace?',
        a: 'A tenant workspace is your private, isolated business environment inside TilePOS. Each business gets its own users, data, settings, and branding. You can invite your team into the same tenant and manage everything separately from other businesses.',
    },
    {
        category: 'getting-started',
        q: 'How do I create my first tenant workspace?',
        a: 'Click “Start free trial” on the home or pricing page, enter your business details, and confirm your email. Your tenant is created automatically and you can start adding products, customers, and quotations right away.',
    },
    {
        category: 'getting-started',
        q: 'Can I import my existing customers, suppliers, and products?',
        a: 'Yes. The Import module lets you upload CSV files for customers, suppliers, and products. Downloadable templates guide the required columns, and invalid rows are reported line-by-line so you can fix them quickly.',
    },
    {
        category: 'getting-started',
        q: 'How do I enable or disable modules like returns or accounts?',
        a: 'Administrators can open Settings and use Feature Flags to turn modules on or off per tenant. For example, you can enable Tile Returns, Accounts Payable, or Accounts Receivable only when your business actually needs them.',
    },
    {
        category: 'getting-started',
        q: 'What browsers and devices are supported?',
        a: 'TilePOS is a responsive web application. It works on the latest versions of Chrome, Safari, Firefox, and Edge, on desktops, tablets, and mobile phones. For the best experience, we recommend a desktop or tablet when creating quotations.',
    },
    // Quotations & Invoices
    {
        category: 'quotations',
        q: 'How do I create a quotation?',
        a: 'Go to the Order/Quotation module, click New, select or quick-create a customer, then add line items. Each line can reference a tile, size, and brand. The system auto-fills dimensions and calculates area, wastage, boxes, and total price.',
    },
    {
        category: 'quotations',
        q: 'How does tile area and wastage calculation work?',
        a: 'When you enter the room or installation area, TilePOS adds the wastage percentage you define (for example, 5% or 10%). It then divides the total area by the tile coverage per box to recommend the exact number of boxes to order.',
    },
    {
        category: 'quotations',
        q: 'Can I apply discounts and taxes to a quotation?',
        a: 'Yes. You can apply line-level discounts, an overall discount percentage, and a tax rate. The totals update automatically, and the same logic carries over when you convert the quotation to an invoice.',
    },
    {
        category: 'quotations',
        q: 'Can I convert a quotation into an invoice?',
        a: 'Yes. Once a quotation is approved, you can convert it to an invoice in one click. The invoice keeps the same line items, numbering, and customer details. You can then track payment status and download a PDF.',
    },
    {
        category: 'quotations',
        q: 'How do I download a quotation or invoice PDF?',
        a: 'Open any quotation or invoice and click the Download button. TilePOS generates a clean, branded PDF with your business details, line items, totals, and payment status.',
    },
    {
        category: 'quotations',
        q: 'How do returns and exchanges work?',
        a: 'Use the Returns/Exchange module to create a return receipt for a customer. Select the tiles originally sold, choose whether to restock, exchange, or refund, and TilePOS calculates the payment difference. A PDF receipt is generated for your records.',
    },
    {
        category: 'quotations',
        q: 'What happens to stock when I create an invoice?',
        a: 'If stock tracking is enabled, the invoice reduces the available quantity for the products sold. The movement is recorded in the Stock module with a reference to the invoice number, so you always have a clear audit trail.',
    },
    // Inventory & Catalog
    {
        category: 'inventory',
        q: 'What is the difference between Tiles, Products, and Stock?',
        a: 'Tiles are the master catalog items (e.g., Marble White 24×24). Products are purchase batches linked to suppliers and costs. Stock represents the actual quantity on hand in each warehouse. The three layers give you catalog, costing, and availability in one place.',
    },
    {
        category: 'inventory',
        q: 'How do I add a new tile to the catalog?',
        a: 'Open the Tiles module and click New. Enter the tile name, brand, size, finish, box quantity, and coverage. You can also set an image and description. Once saved, the tile becomes available in quotations and stock entries.',
    },
    {
        category: 'inventory',
        q: 'How do brands and sizes work?',
        a: 'Brands and Sizes are master-data modules. You create them once and then assign them to tiles. This keeps your catalog consistent and makes it faster to create quotations because size and coverage details are pre-filled.',
    },
    {
        category: 'inventory',
        q: 'How is stock tracked across warehouses?',
        a: 'The Stock module shows quantity on hand per warehouse. Each purchase batch, invoice, or return updates the stock level and records a movement with the date, document reference, and quantity change.',
    },
    {
        category: 'inventory',
        q: 'What are low-stock and out-of-stock alerts?',
        a: 'When a product falls below its safe stock level or reaches zero, TilePOS creates a notification. You can see the alert on the dashboard and in the notification dropdown, so you know when to reorder before missing a sale.',
    },
    {
        category: 'inventory',
        q: 'Can I manage multiple warehouses?',
        a: 'Yes. The number of warehouses you can track depends on your plan. Starter supports one warehouse, Growth supports three, and Enterprise supports unlimited warehouse locations.',
    },
    {
        category: 'inventory',
        q: 'How do I record a purchase from a supplier?',
        a: 'Use the Products or Stock module to create a purchase batch. Select the supplier, choose the tiles, enter quantities and costs, and save. The stock level increases automatically and the batch is linked to the supplier for future payables tracking.',
    },
    // Reports & Finance
    {
        category: 'finance',
        q: 'What reports are built into the system?',
        a: 'TilePOS includes Profit & Loss, Payables Aging, Receivables Aging, Sales by Product, Sales by Brand, Sales by Customer, and Stock Valuation. Each report can be filtered by date range and exported when needed.',
    },
    {
        category: 'finance',
        q: 'How do Accounts Payable and Receivable work?',
        a: 'Accounts Payable tracks what you owe suppliers, usually from purchase batches. Accounts Receivable tracks what customers owe you from invoices. Both modules let you record partial or full payments and view remaining balances.',
    },
    {
        category: 'finance',
        q: 'How is profit calculated?',
        a: 'Profit is calculated from the sale price of invoices minus the cost recorded on the related purchase batches. This gives you accurate margin data without relying on spreadsheets.',
    },
    {
        category: 'finance',
        q: 'Can I export reports or data?',
        a: 'Yes. Growth and Enterprise plans include CSV export for any module and reports. You can also download PDFs for quotations, invoices, and return receipts directly from their detail pages.',
    },
    {
        category: 'finance',
        q: 'What does the dashboard show?',
        a: 'The dashboard shows live KPIs such as total receivables, monthly earnings, orders placed, and low-stock alerts. It also includes a recent-orders feed and a sales trend chart so you can monitor the business at a glance.',
    },
    // Users & Security
    {
        category: 'security',
        q: 'How do users and roles work?',
        a: 'Administrators can invite users and assign them roles. Roles define what a user can see and do, such as creating quotations, viewing reports, managing stock, or importing data. This lets you give each team member only the access they need.',
    },
    {
        category: 'security',
        q: 'Can I limit who can view financial reports?',
        a: 'Yes. You can create a role without report permissions and assign it to sales staff, while accountants or managers get full access. The sidebar navigation is automatically filtered based on the logged-in user’s permissions.',
    },
    {
        category: 'security',
        q: 'Is my tenant data isolated from other businesses?',
        a: 'Yes. TilePOS is built on a multi-tenant architecture. Each tenant has its own database-separated data, users, and settings. One business cannot see or access another tenant’s information.',
    },
    {
        category: 'security',
        q: 'What happens when a team member leaves?',
        a: 'An administrator can deactivate or remove the user from the Users module. Once deactivated, the user can no longer log in, but their historical activity remains in the system for audit purposes.',
    },
    {
        category: 'security',
        q: 'How is data security handled?',
        a: 'TilePOS uses encrypted connections, verified email requirements, role-based access controls, and regular backups. Enterprise plans also include advanced security controls and dedicated support options.',
    },
    // Billing & Data
    {
        category: 'billing',
        q: 'What plans are available?',
        a: 'TilePOS offers Starter, Growth, and Enterprise plans. Starter covers core quotations, inventory, and CRM. Growth adds finance modules, reports, import/export, and roles. Enterprise adds unlimited users and warehouses, a dedicated account manager, and SLA-backed support.',
    },
    {
        category: 'billing',
        q: 'Is there a free trial?',
        a: 'Yes. Every plan includes a 14-day free trial with full access to the included features. You can start the trial without providing a credit card.',
    },
    {
        category: 'billing',
        q: 'Can I cancel or change my plan at any time?',
        a: 'Yes. You can upgrade, downgrade, or cancel from your billing settings. Changes are prorated, and your data remains accessible for 30 days after cancellation.',
    },
    {
        category: 'billing',
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards for monthly billing. Annual plans can also be paid by bank transfer. Enterprise customers can request invoice-based billing.',
    },
    {
        category: 'billing',
        q: 'How do I get help if I am stuck?',
        a: 'Starter plans include email support. Growth includes priority email support. Enterprise includes a dedicated account manager, phone support, and onboarding assistance. You can also visit the Contact Us page to reach the team.',
    },
    {
        category: 'billing',
        q: 'Can I export all my data if I leave?',
        a: 'Yes. Growth and Enterprise plans let you export customers, suppliers, products, stock, and reports to CSV at any time. We believe your data belongs to you.',
    },
];

const heroHighlights = [
    'Tenant-specific answers',
    'Covering every module',
    'Search & filter',
    'Updated regularly',
];

export default function FAQs({
    appName = 'TilePOS',
    tagline,
}: {
    appName?: string;
    tagline?: string;
}) {
    useLenis();
    useScrollReveal();

    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
    const [openItems, setOpenItems] = useState<Set<number>>(new Set());

    const filteredFaqs = useMemo(() => {
        return faqs.filter((faq) => {
            const matchesCategory =
                selectedCategory === 'all' || faq.category === selectedCategory;
            const q = query.trim().toLowerCase();
            const matchesSearch =
                q.length === 0 ||
                faq.q.toLowerCase().includes(q) ||
                faq.a.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [query, selectedCategory]);

    useEffect(() => {
        setOpenItems(new Set());
    }, [query, selectedCategory]);

    const toggleItem = (index: number) => {
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    return (
        <MarketingLayout appName={appName} tagline={tagline}>
            <Head title={`FAQs - ${appName}`} />

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
                            Help center
                        </div>

                        <h1
                            className="font-800 animate-fade-up mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            Frequently asked{' '}
                            <span className="text-gradient">questions</span>
                        </h1>

                        <p
                            className="animate-fade-up mt-5 text-lg leading-relaxed text-ink-600"
                            style={{ animationDelay: '120ms' }}
                        >
                            Everything you need to know about {appName} tenants,
                            modules, billing, and security. Use the search or
                            category filters below to find answers quickly.
                        </p>

                        <div
                            className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-500"
                            style={{ animationDelay: '180ms' }}
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

                        <div
                            className="animate-fade-up mx-auto mt-10 max-w-xl"
                            style={{ animationDelay: '240ms' }}
                        >
                            <div className="relative">
                                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search for answers..."
                                    className="w-full rounded-xl border border-ink-200 bg-white py-3.5 pr-4 pl-12 text-sm text-ink-900 shadow-card transition-all placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Category filters */}
            <section className="sticky top-16 z-30 border-b border-ink-100 bg-white/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="reveal scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const active = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                        active
                                            ? 'shadow-soft bg-brand-600 text-white'
                                            : 'bg-ink-50 text-ink-700 hover:bg-ink-100'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FAQ list */}
            <section className="bg-gradient-to-b from-white to-brand-50/40 px-4 py-12 sm:px-6 lg:py-20">
                <div className="mx-auto max-w-3xl">
                    <div className="reveal mb-6 flex items-center justify-between">
                        <p className="text-sm text-ink-500">
                            {filteredFaqs.length}{' '}
                            {filteredFaqs.length === 1 ? 'result' : 'results'}
                        </p>
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="text-sm font-medium text-brand-600 hover:text-brand-700"
                            >
                                Clear search
                            </button>
                        )}
                    </div>

                    {filteredFaqs.length === 0 ? (
                        <div className="reveal rounded-2xl border border-ink-100 bg-white p-10 text-center shadow-card">
                            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink-50 text-ink-400">
                                <MessageCircle className="h-7 w-7" />
                            </span>
                            <h3 className="font-700 mt-5 font-display text-xl text-ink-900">
                                No matching questions
                            </h3>
                            <p className="mt-2 text-sm text-ink-600">
                                Try a different search term or browse a
                                category. If you still need help, reach out
                                through the Contact Us page.
                            </p>
                            <Link
                                href="/contact-us"
                                className="font-600 mt-5 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-sm text-white transition hover:bg-brand-700"
                            >
                                Contact us
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredFaqs.map((faq, i) => {
                                const isOpen = openItems.has(i);
                                return (
                                    <div
                                        key={i}
                                        className={`reveal overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all ${
                                            isOpen
                                                ? 'shadow-card'
                                                : 'hover:border-brand-200'
                                        }`}
                                        style={{
                                            transitionDelay: `${(i % 5) * 40}ms`,
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleItem(i)}
                                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-ink-50/50"
                                        >
                                            <span className="font-600 font-display text-base text-ink-900">
                                                {faq.q}
                                            </span>
                                            <ChevronDown
                                                className={`h-5 w-5 shrink-0 text-brand-600 transition-transform duration-300 ${
                                                    isOpen ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>
                                        <div
                                            className={`grid transition-all duration-300 ${
                                                isOpen
                                                    ? 'grid-rows-[1fr] opacity-100'
                                                    : 'grid-rows-[0fr] opacity-0'
                                            }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="border-t border-ink-100 px-5 py-4 text-sm leading-relaxed text-ink-600">
                                                    {faq.a}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
                                Still have questions?
                            </h2>
                            <p className="mt-4 text-lg text-brand-50/90">
                                Our team is happy to help you get the most out
                                of {appName}.
                            </p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link
                                    href="/contact-us"
                                    className="font-600 shadow-soft inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm text-brand-700 transition hover:bg-ink-50"
                                >
                                    Contact us
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={tenantRegister.url()}
                                    className="font-600 inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm text-white transition hover:bg-white/10"
                                >
                                    Start free trial
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
