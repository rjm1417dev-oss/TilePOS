import {
    BarChart3,
    Building2,
    Download,
    FileText,
    RefreshCw,
    Settings,
    ShieldCheck,
    Users,
    Warehouse,
} from 'lucide-react';

interface FeaturesProps {
    appName?: string;
}

const features = [
    {
        icon: FileText,
        title: 'Smart quotations & invoices',
        desc: 'Auto-numbered documents with tile area, wastage, and box calculations. Apply discounts, tax, and track payments — then export to PDF.',
        accent: 'brand',
    },
    {
        icon: Warehouse,
        title: 'Real-time inventory',
        desc: 'Track stock levels per warehouse, get low-stock and out-of-stock alerts, and view full movement history for every SKU.',
        accent: 'accent',
    },
    {
        icon: Users,
        title: 'Customers & suppliers',
        desc: 'Centralized CRM with quick-create, order history, and regular-customer detection. Manage vendors linked to every purchase batch.',
        accent: 'brand',
    },
    {
        icon: BarChart3,
        title: 'Reports & analytics',
        desc: 'Profit & loss, aging payables/receivables, sales by product, brand, and customer, plus stock valuation — all built in.',
        accent: 'accent',
    },
    {
        icon: RefreshCw,
        title: 'Returns & exchanges',
        desc: 'Issue return receipts with unique numbers, handle exchanges, calculate payment differences, and download PDF receipts.',
        accent: 'brand',
    },
    {
        icon: Building2,
        title: 'Multi-tenant ready',
        desc: 'Each business gets its own isolated workspace. Serve many independent tile companies from a single installation.',
        accent: 'accent',
    },
    {
        icon: ShieldCheck,
        title: 'Roles & permissions',
        desc: 'Create custom roles like Salesperson or Accountant. Control who can quote, view reports, import, or export data.',
        accent: 'brand',
    },
    {
        icon: Download,
        title: 'Bulk import & export',
        desc: 'Import customers, suppliers, and products from CSV with downloadable templates. Export any module to CSV anytime.',
        accent: 'accent',
    },
    {
        icon: Settings,
        title: 'Feature flags',
        desc: 'Turn modules on or off per tenant — enable tile returns, accounts payable, or receivables only where you need them.',
        accent: 'brand',
    },
];

const accentMap = {
    brand: 'bg-brand-50 text-brand-600 group-hover:bg-brand-100',
    accent: 'bg-accent-50 text-accent-600 group-hover:bg-accent-100',
};

export function Features({ appName = 'TilePOS' }: FeaturesProps) {
    return (
        <section id="features" className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="reveal max-w-2xl">
                    <span className="font-600 text-sm text-brand-600">
                        Everything in one place
                    </span>
                    <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                        A complete toolkit for tile retailers
                    </h2>
                    <p className="mt-4 text-lg text-ink-600">
                        From the first customer inquiry to the final invoice and
                        return,
                        {appName} handles every step of your tile business
                        workflow.
                    </p>
                </div>

                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => (
                        <div
                            key={f.title}
                            className="reveal group card-lift rounded-2xl border border-ink-100 bg-white p-6 hover:border-brand-200 hover:shadow-card"
                            style={{ transitionDelay: `${(i % 3) * 60}ms` }}
                        >
                            <span
                                className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
                                    accentMap[
                                        f.accent as keyof typeof accentMap
                                    ]
                                }`}
                            >
                                <f.icon className="h-5 w-5" strokeWidth={2} />
                            </span>
                            <h3 className="font-700 mt-4 font-display text-lg text-ink-900">
                                {f.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-600">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
