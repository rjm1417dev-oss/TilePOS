import { BarChart3, FileText, Layers, Package, TrendingUp } from 'lucide-react';

/**
 * A CSS-only SaaS dashboard mockup for the marketing homepage.
 * Represents the actual product UI - no external images.
 */
export function DashboardMockup() {
    return (
        <div className="rounded-xl border border-slatey-800 bg-slatey-950 p-4 shadow-2xl ring-1 ring-slatey-800/60">
            {/* Browser chrome */}
            <div className="mb-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-400/90" />
                    <span className="h-3 w-3 rounded-full bg-slatey-400/80" />
                </div>
                <div className="ml-4 flex-1 rounded-md bg-white/5 px-4 py-1.5">
                    <span className="text-xs text-white/40">
                        app.example.com/dashboard
                    </span>
                </div>
            </div>

            <div className="flex gap-4">
                {/* Sidebar */}
                <aside className="hidden w-48 shrink-0 rounded-lg bg-white/5 p-3 md:block">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 rounded-md bg-amber-500/20 px-3 py-2">
                            <Layers className="size-4 text-amber-400" />
                            <span className="text-xs font-medium text-white">
                                Overview
                            </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-md px-3 py-2 text-white/60">
                            <FileText className="size-4" />
                            <span className="text-xs">Quotations</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-md px-3 py-2 text-white/60">
                            <Package className="size-4" />
                            <span className="text-xs">Products</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-md px-3 py-2 text-white/60">
                            <BarChart3 className="size-4" />
                            <span className="text-xs">Reports</span>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <div className="min-h-[280px] flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">
                            Dashboard
                        </h3>
                        <div className="flex gap-2">
                            <div className="h-8 w-20 rounded-md bg-white/10" />
                            <div className="h-8 w-8 rounded-full bg-amber-500/30" />
                        </div>
                    </div>

                    {/* Stats cards */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {[
                            { label: 'Revenue', value: '₦2.4M', trend: 'up' },
                            { label: 'Quotations', value: '127', trend: 'up' },
                            { label: 'Customers', value: '89', trend: 'up' },
                            { label: 'Orders', value: '42', trend: 'up' },
                        ].map((card) => (
                            <div
                                key={card.label}
                                className="rounded-lg border border-white/10 bg-white/5 p-3"
                            >
                                <p className="text-xs text-white/50">
                                    {card.label}
                                </p>
                                <div className="mt-1 flex items-center gap-1">
                                    <span className="text-sm font-semibold text-white">
                                        {card.value}
                                    </span>
                                    <TrendingUp className="size-3.5 text-emerald-500/80" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart area */}
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs text-white/50">
                                Sales overview
                            </span>
                            <span className="text-xs text-white/40">
                                Last 7 days
                            </span>
                        </div>
                        <div className="flex h-24 items-end gap-2">
                            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 rounded-t bg-amber-500/30"
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
                        <div className="mt-2 flex justify-between text-[10px] text-white/30">
                            <span>Mon</span>
                            <span>Tue</span>
                            <span>Wed</span>
                            <span>Thu</span>
                            <span>Fri</span>
                            <span>Sat</span>
                            <span>Sun</span>
                        </div>
                    </div>

                    {/* Table placeholder */}
                    <div className="rounded-lg border border-white/10 bg-white/5">
                        <div className="border-b border-white/10 px-4 py-2">
                            <span className="text-xs text-white/50">
                                Recent quotations
                            </span>
                        </div>
                        <div className="divide-y divide-white/5">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 px-4 py-3"
                                >
                                    <div className="h-2 flex-1 rounded bg-white/10" />
                                    <div className="h-2 w-16 rounded bg-white/10" />
                                    <div className="h-2 w-12 rounded bg-white/10" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
