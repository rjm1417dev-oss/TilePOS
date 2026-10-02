import {
    BarChart3,
    Boxes,
    ClipboardList,
    Download,
    FileText,
    LayoutDashboard,
    RefreshCw,
    Settings,
    ShieldCheck,
    Truck,
    Users,
    Wallet,
    Warehouse,
} from 'lucide-react';

const modules = [
    {
        icon: LayoutDashboard,
        name: 'Dashboard',
        desc: 'KPIs, receivables, earnings, and order summaries at a glance.',
    },
    {
        icon: Boxes,
        name: 'Tile Catalog',
        desc: 'Manage tile SKUs with size, brand, finish, and box quantity.',
    },
    {
        icon: Warehouse,
        name: 'Inventory',
        desc: 'Stock per warehouse, movement history, and low-stock alerts.',
    },
    {
        icon: FileText,
        name: 'Quotations',
        desc: 'Quick-create quotes with area, wastage, and discount calculations.',
    },
    {
        icon: FileText,
        name: 'Invoices',
        desc: 'Convert quotes to invoices, track payments, export PDFs.',
    },
    {
        icon: Users,
        name: 'Customers',
        desc: 'CRM with order history and regular-customer detection.',
    },
    {
        icon: Truck,
        name: 'Suppliers',
        desc: 'Vendors linked to purchase batches and payables.',
    },
    {
        icon: RefreshCw,
        name: 'Returns',
        desc: 'Return receipts, exchanges, and payment difference handling.',
    },
    {
        icon: BarChart3,
        name: 'Reports',
        desc: 'P&L, aging, sales by product, brand, customer, and stock value.',
    },
    {
        icon: Wallet,
        name: 'Receivables',
        desc: 'Outstanding balances and payment tracking per customer.',
    },
    {
        icon: ClipboardList,
        name: 'Payables',
        desc: 'Track what you owe suppliers and manage due dates.',
    },
    {
        icon: Settings,
        name: 'Settings',
        desc: 'Roles, feature flags, branding, and tax configuration.',
    },
];

export function Modules() {
    return (
        <section
            id="modules"
            className="bg-gradient-to-b from-white to-brand-50/40 py-20 lg:py-28"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="reveal max-w-2xl">
                    <span className="font-600 text-sm text-brand-600">
                        Modules
                    </span>
                    <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                        Twelve modules. One login.
                    </h2>
                    <p className="mt-4 text-lg text-ink-600">
                        Every module is built for the tile trade and works
                        together seamlessly. Turn on only what your business
                        needs.
                    </p>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {modules.map((m, i) => (
                        <div
                            key={m.name}
                            className="reveal group card-lift flex items-start gap-3.5 rounded-xl border border-ink-100 bg-white p-4 hover:border-brand-200"
                            style={{ transitionDelay: `${(i % 4) * 50}ms` }}
                        >
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                                <m.icon className="h-5 w-5" strokeWidth={2} />
                            </span>
                            <div>
                                <h3 className="font-700 font-display text-sm text-ink-900">
                                    {m.name}
                                </h3>
                                <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                                    {m.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="reveal mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-brand-100 bg-brand-50/60 px-5 py-4 text-sm text-ink-600">
                    <span className="font-600 inline-flex items-center gap-1.5 text-brand-700">
                        <ShieldCheck className="h-4 w-4" /> Role-based access
                    </span>
                    <span className="font-600 inline-flex items-center gap-1.5 text-brand-700">
                        <Download className="h-4 w-4" /> CSV import / export
                    </span>
                    <span className="font-600 inline-flex items-center gap-1.5 text-brand-700">
                        <Settings className="h-4 w-4" /> Per-tenant feature
                        flags
                    </span>
                </div>
            </div>
        </section>
    );
}
