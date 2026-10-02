import {
    ArrowRight,
    CheckCircle2,
    Play,
    ShoppingBag,
    Star,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';
import type { ElementType } from 'react';

const stats = [
    { icon: TrendingUp, label: 'Avg. revenue lift', value: '+34%' },
    { icon: ShoppingBag, label: 'Orders processed', value: '120k+' },
    { icon: Users, label: 'Businesses served', value: '850+' },
    { icon: Star, label: 'Customer rating', value: '4.9/5' },
];

export function Hero() {
    return (
        <section
            id="top"
            className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28"
        >
            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-white" />
            <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
            <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
            <div className="absolute top-40 -left-24 -z-10 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
                    {/* Copy */}
                    <div className="lg:col-span-6">
                        <div className="font-600 animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1.5 text-xs text-brand-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-brand-500" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
                            </span>
                            New: Multi-tenant architecture now live
                        </div>

                        <h1
                            className="font-800 animate-fade-up mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            Run your entire tile business on{' '}
                            <span className="text-gradient">
                                one powerful platform
                            </span>
                        </h1>

                        <p
                            className="animate-fade-up mt-5 max-w-xl text-lg leading-relaxed text-ink-600"
                            style={{ animationDelay: '120ms' }}
                        >
                            Quotations, inventory, invoices, customers,
                            suppliers, and analytics — built specifically for
                            tile retailers and distributors. Stop juggling
                            spreadsheets and start scaling.
                        </p>

                        <div
                            className="animate-fade-up mt-7 flex flex-wrap items-center gap-3"
                            style={{ animationDelay: '180ms' }}
                        >
                            <a
                                href="#cta"
                                className="font-600 hover:shadow-glow inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm text-white shadow-card transition-all hover:bg-brand-700"
                            >
                                Start 14-day free trial
                                <ArrowRight className="h-4 w-4" />
                            </a>
                            <a
                                href="https://app.arcade.software/share/mq6FZFT0kVQRWWrDkME2"
                                className="font-600 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3.5 text-sm text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                            >
                                <Play className="h-4 w-4 text-brand-600" />
                                Watch demo
                            </a>
                        </div>

                        <div
                            className="animate-fade-up mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500"
                            style={{ animationDelay: '240ms' }}
                        >
                            {[
                                'No credit card required',
                                'Setup in minutes',
                                'Cancel anytime',
                            ].map((t) => (
                                <span
                                    key={t}
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-brand-500" />
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* Stats */}
                        <dl
                            className="animate-fade-up mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4"
                            style={{ animationDelay: '300ms' }}
                        >
                            {stats.map((s) => (
                                <div
                                    key={s.label}
                                    className="rounded-xl border border-ink-100 bg-white/70 p-3.5 backdrop-blur-sm"
                                >
                                    <dt className="font-500 flex items-center gap-1.5 text-xs text-ink-500">
                                        <s.icon className="h-3.5 w-3.5 text-brand-500" />
                                        {s.label}
                                    </dt>
                                    <dd className="font-700 mt-1 font-display text-xl text-ink-900">
                                        {s.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Dashboard mockup */}
                    <div
                        className="animate-fade-up lg:col-span-6"
                        style={{ animationDelay: '200ms' }}
                    >
                        <DashboardMockup />
                    </div>
                </div>
            </div>
        </section>
    );
}

function DashboardMockup() {
    return (
        <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-brand-200/40 via-brand-100/30 to-accent-100/30 blur-2xl" />

            {/* Window */}
            <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-card">
                {/* Title bar */}
                <div className="flex h-10 items-center gap-2 border-b border-ink-100 bg-ink-50/60 px-4">
                    <div className="flex gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-red-400" />
                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                        <span className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="font-500 ml-2 flex-1 text-center text-xs text-ink-400">
                        app.tilecore.io / dashboard
                    </div>
                </div>

                {/* Body */}
                <div className="bg-gradient-to-b from-white to-ink-50/40 p-4">
                    {/* Top KPI row */}
                    <div className="grid grid-cols-3 gap-2.5">
                        <KpiCard
                            icon={Wallet}
                            label="Receivables"
                            value="₨ 2.4M"
                            tone="brand"
                            trend="+12%"
                        />
                        <KpiCard
                            icon={TrendingUp}
                            label="Earnings (mo)"
                            value="₨ 8.6M"
                            tone="accent"
                            trend="+34%"
                        />
                        <KpiCard
                            icon={ShoppingBag}
                            label="Orders (mo)"
                            value="1,284"
                            tone="ink"
                            trend="+8%"
                        />
                    </div>

                    {/* Chart + side */}
                    <div className="mt-2.5 grid grid-cols-5 gap-2.5">
                        <div className="col-span-3 rounded-xl border border-ink-100 bg-white p-3">
                            <div className="flex items-center justify-between">
                                <span className="font-600 text-xs text-ink-700">
                                    Sales trend
                                </span>
                                <span className="font-500 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-600">
                                    30d
                                </span>
                            </div>
                            <MiniChart />
                        </div>
                        <div className="col-span-2 rounded-xl border border-ink-100 bg-white p-3">
                            <span className="font-600 text-xs text-ink-700">
                                Top tiles
                            </span>
                            <ul className="mt-2 space-y-2">
                                {[
                                    ['Marble White 24×24', '42%'],
                                    ['Granite Grey 12×12', '28%'],
                                    ['Onyx Beige 18×18', '18%'],
                                ].map(([name, pct]) => (
                                    <li key={name}>
                                        <div className="flex justify-between text-[10px] text-ink-500">
                                            <span className="truncate pr-1">
                                                {name}
                                            </span>
                                            <span className="font-600 text-ink-700">
                                                {pct}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-100">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                                                style={{ width: pct }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Recent orders */}
                    <div className="mt-2.5 rounded-xl border border-ink-100 bg-white p-3">
                        <div className="flex items-center justify-between">
                            <span className="font-600 text-xs text-ink-700">
                                Recent orders
                            </span>
                            <span className="text-[10px] text-ink-400">
                                View all
                            </span>
                        </div>
                        <div className="mt-2 space-y-1.5">
                            {[
                                ['IV-250801-04', 'Zafar Traders', '₨ 184,000'],
                                ['IV-250801-03', 'Ayesha Tiles', '₨ 92,500'],
                                ['QT-250801-02', 'Metro Builders', '₨ 311,200'],
                            ].map(([no, cust, amt]) => (
                                <div
                                    key={no}
                                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-ink-50"
                                >
                                    <span className="font-600 text-[10px] text-brand-700">
                                        {no}
                                    </span>
                                    <span className="text-[10px] text-ink-600">
                                        {cust}
                                    </span>
                                    <span className="font-600 text-[10px] text-ink-900">
                                        {amt}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating badge */}
            <div className="animate-float absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2 shadow-card sm:flex">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-green-50 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                    <p className="font-600 text-[11px] text-ink-900">
                        Stock synced
                    </p>
                    <p className="text-[10px] text-ink-500">312 SKUs updated</p>
                </div>
            </div>
        </div>
    );
}

function KpiCard({
    icon: Icon,
    label,
    value,
    tone,
    trend,
}: {
    icon: ElementType;
    label: string;
    value: string;
    tone: 'brand' | 'accent' | 'ink';
    trend: string;
}) {
    const tones = {
        brand: 'bg-brand-50 text-brand-600',
        accent: 'bg-accent-50 text-accent-600',
        ink: 'bg-ink-100 text-ink-600',
    };
    return (
        <div className="rounded-xl border border-ink-100 bg-white p-3">
            <div className="flex items-center justify-between">
                <span
                    className={`grid h-7 w-7 place-items-center rounded-lg ${tones[tone]}`}
                >
                    <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="font-600 text-[10px] text-green-600">
                    {trend}
                </span>
            </div>
            <p className="font-500 mt-2 text-[10px] text-ink-500">{label}</p>
            <p className="font-700 font-display text-base text-ink-900">
                {value}
            </p>
        </div>
    );
}

function MiniChart() {
    const bars = [38, 52, 44, 60, 48, 72, 64, 80, 68, 92, 78, 96];
    return (
        <div className="mt-3 flex h-20 items-end gap-1">
            {bars.map((h, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-brand-200 to-brand-500"
                    style={{ height: `${h}%` }}
                />
            ))}
        </div>
    );
}
