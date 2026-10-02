import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    BarChart3,
    Box,
    ChevronDown,
    DollarSign,
    FileDown,
    FileOutput,
    FileText,
    Plus,
    RotateCcw,
    ShoppingCart,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { index as exportIndex } from '@/routes/export';
import { index as importIndex } from '@/routes/import';
import { create as quotationsCreate } from '@/routes/quotations';
import { show as quotationsShow } from '@/routes/quotations';
import { index as reportsIndex } from '@/routes/reports';
import { create as stocksCreate } from '@/routes/stocks';
import { create as tileReturnsCreate } from '@/routes/tile-returns';
import { show as tilesShow } from '@/routes/tiles';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Overview', href: dashboard().url },
];

function formatMoney(value: number): string {
    return (
        'Rs ' +
        new Intl.NumberFormat('en-PK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    );
}

/* ------------------------------------------------------------------ */
/* Smooth chart helpers                                               */
/* ------------------------------------------------------------------ */

type Point = { x: number; y: number };

function line(a: Point, b: Point): { length: number; angle: number } {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return {
        length: Math.sqrt(dx * dx + dy * dy),
        angle: Math.atan2(dy, dx),
    };
}

function controlPoint(
    current: Point,
    previous: Point | undefined,
    next: Point | undefined,
    reverse = false,
    smoothing = 0.2,
): Point {
    const p = previous ?? current;
    const n = next ?? current;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    return {
        x: current.x + Math.cos(angle) * length,
        y: current.y + Math.sin(angle) * length,
    };
}

function generateSmoothPath(points: Point[], smoothing = 0.2): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const cps = controlPoint(points[i - 1], points[i - 2], points[i], false, smoothing);
        const cpe = controlPoint(points[i], points[i - 1], points[i + 1], true, smoothing);
        d += ` C ${cps.x.toFixed(2)},${cps.y.toFixed(2)} ${cpe.x.toFixed(2)},${cpe.y.toFixed(2)} ${points[i].x.toFixed(2)},${points[i].y.toFixed(2)}`;
    }
    return d;
}

function generateSmoothAreaPath(
    points: Point[],
    bottomY: number,
    smoothing = 0.2,
): string {
    const linePath = generateSmoothPath(points, smoothing);
    if (!linePath) return '';
    const last = points[points.length - 1];
    const first = points[0];
    return `${linePath} L ${last.x.toFixed(2)},${bottomY.toFixed(2)} L ${first.x.toFixed(2)},${bottomY.toFixed(2)} Z`;
}

function normalizeSparklineData(
    data: number[],
    width: number,
    height: number,
): Point[] {
    if (!data.length) return [];
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    const points = data.length;
    const stepX = width / Math.max(points - 1, 1);
    const paddingY = height * 0.15;

    return data.map((v, i) => ({
        x: i * stepX,
        y:
            range === 0
                ? height / 2
                : height -
                  paddingY -
                  ((v - min) / range) * (height - paddingY * 2),
    }));
}

function normalizeChartData(
    values: number[],
    labels: string[],
    width: number,
    height: number,
    padding: { top: number; right: number; bottom: number; left: number },
): { points: Point[]; chartWidth: number; chartHeight: number } {
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min;

    const points = values.map((v, i) => ({
        x: padding.left + (values.length <= 1 ? chartWidth / 2 : (i / (values.length - 1)) * chartWidth),
        y: padding.top + chartHeight - ((v - min) / range) * chartHeight,
    }));

    return { points, chartWidth, chartHeight };
}

/* ------------------------------------------------------------------ */
/* Data interfaces                                                    */
/* ------------------------------------------------------------------ */

interface FinancialStats {
    totalPayables: number;
    totalReceivables: number;
    totalEarnings: {
        daily: number;
        weekly: number;
        monthly: number;
        yearly: number;
    };
    payablesChartData: number[];
    receivablesChartData: number[];
    earningsChartData: number[];
}

interface BusinessStats {
    orders: { daily: number; weekly: number; monthly: number; yearly: number };
    customers: { regular: number; new: number; old: number };
    ordersChartData: number[];
    customersChartData: number[];
}

interface SalesChart {
    labels: string[];
    values: number[];
}

interface TopSellingTile {
    tile_id: number;
    tile_code: string;
    image: string | null;
    brand_name: string | null;
    size: string | null;
    total_sales: number;
}

interface RecentOrder {
    id: number;
    quotation_number: string;
    customer_name: string;
    total_amount: number;
    created_at: string;
}

interface Props {
    sales_period?: string;
    financialStats: FinancialStats;
    businessStats: BusinessStats;
    salesChart: SalesChart;
    topSellingTiles: TopSellingTile[];
    recentOrders: RecentOrder[];
}

/* ------------------------------------------------------------------ */
/* Theme tokens                                                       */
/* ------------------------------------------------------------------ */

type AccentKey = 'rose' | 'amber' | 'emerald' | 'indigo' | 'slate';

const accentThemes: Record<
    AccentKey,
    {
        text: string;
        badgeBg: string;
        badgeText: string;
        bar: string;
        stroke: string;
        gradientFrom: string;
        gradientTo: string;
        tint: string;
    }
> = {
    rose: {
        text: 'text-rose-600',
        badgeBg: 'bg-rose-50',
        badgeText: 'text-rose-600',
        bar: 'bg-rose-500',
        stroke: '#e11d48',
        gradientFrom: 'rgba(225, 29, 72, 0.25)',
        gradientTo: 'rgba(225, 29, 72, 0.03)',
        tint: 'metric-tint-rose',
    },
    amber: {
        text: 'text-amber-600',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-600',
        bar: 'bg-amber-500',
        stroke: '#f59e0b',
        gradientFrom: 'rgba(245, 158, 11, 0.25)',
        gradientTo: 'rgba(245, 158, 11, 0.03)',
        tint: 'metric-tint-amber',
    },
    emerald: {
        text: 'text-emerald-600',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-600',
        bar: 'bg-emerald-500',
        stroke: '#10b981',
        gradientFrom: 'rgba(16, 185, 129, 0.25)',
        gradientTo: 'rgba(16, 185, 129, 0.03)',
        tint: 'metric-tint-emerald',
    },
    indigo: {
        text: 'text-indigo-600',
        badgeBg: 'bg-indigo-50',
        badgeText: 'text-indigo-600',
        bar: 'bg-indigo-500',
        stroke: '#6366f1',
        gradientFrom: 'rgba(99, 102, 241, 0.25)',
        gradientTo: 'rgba(99, 102, 241, 0.03)',
        tint: 'metric-tint-indigo',
    },
    slate: {
        text: 'text-slate-600',
        badgeBg: 'bg-slate-50',
        badgeText: 'text-slate-600',
        bar: 'bg-slate-500',
        stroke: '#64748b',
        gradientFrom: 'rgba(100, 116, 139, 0.25)',
        gradientTo: 'rgba(100, 116, 139, 0.03)',
        tint: 'metric-tint-slate',
    },
};

const periodOptions = [
    { value: 'today', label: 'Today' },
    { value: 'past_7_days', label: '7 Days' },
    { value: 'past_30_days', label: '30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'past_3_months', label: '3 Months' },
    { value: 'past_6_months', label: '6 Months' },
    { value: 'past_year', label: 'Past Year' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_year', label: 'Last Year' },
];

/* ------------------------------------------------------------------ */
/* Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Sparkline({
    data,
    accent,
    id,
}: {
    data: number[];
    accent: AccentKey;
    id: string;
}) {
    const points = normalizeSparklineData(data, 100, 40);
    const hasData = points.length > 0;
    const theme = accentThemes[accent];

    return (
        <svg
            width="100%"
            height="40"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="block overflow-visible"
        >
            <defs>
                <linearGradient id={`spark-grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={theme.stroke} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={theme.stroke} stopOpacity={0.05} />
                </linearGradient>
            </defs>
            {hasData ? (
                <>
                    <path
                        d={generateSmoothAreaPath(points, 40, 0.25)}
                        fill={`url(#spark-grad-${id})`}
                    />
                    <path
                        d={generateSmoothPath(points, 0.25)}
                        stroke={theme.stroke}
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </>
            ) : (
                <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 4" className="text-slate-200 dark:text-slate-700" />
            )}
        </svg>
    );
}

function MetricCard({
    label,
    value,
    subtitle,
    icon: Icon,
    accent,
    chartData,
    dropdown,
}: {
    label: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    accent: AccentKey;
    chartData: number[];
    dropdown?: React.ReactNode;
}) {
    const theme = accentThemes[accent];

    return (
        <Card
            className={`group relative overflow-hidden rounded-[18px] border border-slate-100/80 bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-200/90 hover:shadow-card-premium-hover dark:border-slate-800/80 dark:bg-slate-900 dark:hover:border-slate-700/90 ${theme.tint}`}
        >
            <div className={`absolute top-4 bottom-4 left-0 w-[3px] rounded-r-full ${theme.bar} opacity-90`} />
            <CardContent className="relative px-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl border ${theme.badgeBg} ${theme.badgeText} dark:border-slate-700/60`}
                        >
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
                    </div>
                    {dropdown && <div className="-mr-2 -mt-1">{dropdown}</div>}
                </div>

                <div className="mt-4">
                    <p className={`text-[28px] font-semibold tracking-tight ${theme.text} dark:text-opacity-90`}>
                        {value}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                        <Icon className="h-3.5 w-3.5" />
                        {subtitle}
                    </p>
                </div>

                <div className="mt-5 h-10">
                    <Sparkline data={chartData} accent={accent} id={label.replace(/\s+/g, '').toLowerCase()} />
                </div>
            </CardContent>
        </Card>
    );
}

function PeriodPills({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <>
            <div className="hidden flex-wrap items-center gap-1 rounded-xl border border-slate-100 bg-slate-50/60 p-1 dark:border-slate-800 dark:bg-slate-900/60 sm:flex">
                {options.map((opt) => {
                    const active = value === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(opt.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                active
                                    ? 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700'
                                    : 'text-slate-500 hover:bg-white/70 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200'
                            }`}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>

            <div className="w-full sm:hidden">
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger className="h-9 w-full rounded-xl border border-slate-100 bg-slate-50/60 px-3 text-xs font-medium dark:border-slate-800 dark:bg-slate-900/60">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    );
}

function SalesAreaChart({ labels, values }: { labels: string[]; values: number[] }) {
    const width = 800;
    const height = 280;
    const padding = { top: 24, right: 24, bottom: 48, left: 56 };

    if (!values.length) {
        return (
            <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="text-center">
                    <BarChart3 className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                    <p className="mt-2 text-sm font-medium text-slate-400 dark:text-slate-500">No sales data yet</p>
                    <p className="text-xs text-slate-300 dark:text-slate-600">Data will appear as orders are created</p>
                </div>
            </div>
        );
    }

    const { points, chartHeight } = normalizeChartData(
        values,
        labels,
        width,
        height,
        padding,
    );
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min;
    const gridLines = 5;

    return (
        <div className="relative">
            <svg
                width="100%"
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="overflow-visible"
            >
                <defs>
                    <linearGradient id="sales-area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                        <stop offset="55%" stopColor="#14b8a6" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="sales-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {Array.from({ length: gridLines + 1 }).map((_, i) => {
                    const y = padding.top + (chartHeight / gridLines) * i;
                    return (
                        <line
                            key={i}
                            x1={padding.left}
                            y1={y}
                            x2={width - padding.right}
                            y2={y}
                            stroke="currentColor"
                            strokeWidth={1}
                            className="text-slate-100 dark:text-slate-800/60"
                        />
                    );
                })}

                {/* Y-axis labels */}
                {Array.from({ length: gridLines + 1 }).map((_, i) => {
                    const value = max - (range / gridLines) * i;
                    const y = padding.top + (chartHeight / gridLines) * i;
                    return (
                        <text
                            key={i}
                            x={padding.left - 12}
                            y={y + 4}
                            textAnchor="end"
                            className="fill-slate-400 text-[10px] font-medium dark:fill-slate-500"
                        >
                            {value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0)}
                        </text>
                    );
                })}

                {/* Area + line */}
                <path
                    d={generateSmoothAreaPath(points, padding.top + chartHeight, 0.25)}
                    fill="url(#sales-area-grad)"
                />
                <path
                    d={generateSmoothPath(points, 0.25)}
                    stroke="url(#sales-line-grad)"
                    strokeWidth={2.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r={4} fill="#ffffff" stroke="#14b8a6" strokeWidth={2} className="dark:fill-slate-900" />
                    </g>
                ))}

                {/* X-axis labels */}
                {labels.map((label, i) => {
                    const x = points[i].x;
                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - 18}
                            textAnchor="middle"
                            className="fill-slate-400 text-[10px] font-medium dark:fill-slate-500"
                        >
                            {label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}

function TopTileCard({
    tile,
    imageUrl,
}: {
    tile: TopSellingTile;
    imageUrl: (path: string | null) => string;
}) {
    return (
        <Link
            href={tilesShow.url({ tile: tile.tile_id })}
            className="group/card flex items-center gap-4 rounded-2xl border border-slate-100/80 bg-white p-3.5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-200/90 hover:shadow-soft dark:border-slate-800/80 dark:bg-slate-900 dark:hover:border-slate-700/90"
        >
            {tile.image ? (
                <div className="relative overflow-hidden rounded-xl">
                    <img
                        src={imageUrl(tile.image)}
                        alt={tile.tile_code}
                        className="h-14 w-14 object-cover transition-transform duration-500 group-hover/card:scale-105"
                    />
                </div>
            ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <Box className="h-6 w-6 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{tile.tile_code}</p>
                <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                    {[tile.brand_name, tile.size].filter(Boolean).join(' • ') || 'Tile product'}
                </p>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatMoney(tile.total_sales)}</p>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Total sales</p>
            </div>
        </Link>
    );
}

function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
    if (orders.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="text-center">
                    <ShoppingCart className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                    <p className="mt-2 text-sm font-medium text-slate-400 dark:text-slate-500">No orders yet</p>
                    <p className="text-xs text-slate-300 dark:text-slate-600">New invoices will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white dark:border-slate-800/80 dark:bg-slate-900">
            <div className="scrollbar-soft overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60">
                            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Order #
                            </th>
                            <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Customer
                            </th>
                            <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Total
                            </th>
                            <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                className="group/row border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                            >
                                <td className="px-6 py-4">
                                    <Link
                                        href={quotationsShow.url({ quotation: order.id })}
                                        className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                    >
                                        {order.quotation_number}
                                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover/row:opacity-100" />
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{order.customer_name}</td>
                                <td className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-200">
                                    {formatMoney(order.total_amount)}
                                </td>
                                <td className="px-6 py-4 text-right text-slate-400 dark:text-slate-500">
                                    {new Date(order.created_at).toLocaleDateString('en-PK', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Dashboard({
    financialStats,
    businessStats,
    salesChart,
    topSellingTiles,
    recentOrders,
    sales_period = 'past_30_days',
}: Props) {
    const { auth } = usePage().props as {
        auth?: { user: { name: string; avatar: string | null }; permissions?: string[]; enabledFeatures?: string[] };
    };
    const canImport = auth?.permissions?.includes('import.create') ?? false;
    const canExport = auth?.permissions?.includes('export.create') ?? false;
    const canViewReports = auth?.permissions?.includes('reports.view') ?? false;
    const enabledFeatures = auth?.enabledFeatures ?? [];

    const [earningsFilter, setEarningsFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [ordersFilter, setOrdersFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
    const [customersFilter, setCustomersFilter] = useState<'regular' | 'new' | 'old'>('regular');
    const [salesPeriod, setSalesPeriod] = useState(sales_period);

    const handleSalesPeriodChange = (period: string) => {
        setSalesPeriod(period);
        const url = `${dashboard().url}?sales_period=${encodeURIComponent(period)}`;
        router.get(url);
    };

    const earningsLabel = {
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly',
    }[earningsFilter];
    const ordersLabel = {
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly',
    }[ordersFilter];
    const customersLabel = {
        regular: 'Regular customers',
        new: 'New customers',
        old: 'Old customers',
    }[customersFilter];

    const totalEarnings = financialStats.totalEarnings[earningsFilter];
    const totalOrders = businessStats.orders[ordersFilter];
    const totalCustomers = businessStats.customers[customersFilter];

    const imageUrl = (path: string | null) => (path ? `/storage/${path}` : '');

    const earningsDropdown = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                    {earningsLabel}
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px] dark:border-slate-700 dark:bg-slate-900">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((f) => (
                    <DropdownMenuItem key={f} onClick={() => setEarningsFilter(f)} className="text-xs dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-slate-100">
                        {{ daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }[f]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const ordersDropdown = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                    {ordersLabel}
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px] dark:border-slate-700 dark:bg-slate-900">
                {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((f) => (
                    <DropdownMenuItem key={f} onClick={() => setOrdersFilter(f)} className="text-xs dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-slate-100">
                        {{ daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }[f]}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const customersDropdown = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                    {customersFilter === 'regular' ? 'Regular' : customersFilter === 'new' ? 'New' : 'Old'}
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px] dark:border-slate-700 dark:bg-slate-900">
                <DropdownMenuItem onClick={() => setCustomersFilter('regular')} className="text-xs dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-slate-100">
                    Regular
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCustomersFilter('new')} className="text-xs dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-slate-100">
                    New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCustomersFilter('old')} className="text-xs dark:text-slate-300 dark:focus:bg-slate-800 dark:focus:text-slate-100">
                    Old
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Overview" />
            <div className="relative flex min-h-full flex-1 flex-col gap-6 rounded-xl bg-slate-50 p-4 sm:p-6 dark:bg-slate-950">
                {/* Soft ambient glow */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-emerald-300/10 blur-[100px] dark:bg-emerald-500/10" />
                    <div className="absolute right-10 top-40 h-[300px] w-[300px] rounded-full bg-indigo-300/8 blur-[80px] dark:bg-indigo-500/10" />
                </div>

                {/* Page header */}
                <Card className="dashboard-enter dashboard-enter-1 relative overflow-hidden rounded-[20px] border-slate-100/80 bg-white/90 shadow-card-premium backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                    <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900/50" />
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Dashboard</p>
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">Overview</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Monitor your sales, orders, and business performance.</p>
                        </div>

                        <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:flex-wrap">
                            <Button
                                size="sm"
                                className="order-1 sm:order-none h-9 gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-emerald-300 dark:shadow-emerald-900/30"
                                asChild
                            >
                                <Link href={stocksCreate.url()}>
                                    <Plus className="h-4 w-4" />
                                    New Stock
                                </Link>
                            </Button>

                            {enabledFeatures.includes('tile_returns') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="order-6 sm:order-none col-span-2 sm:col-auto h-9 gap-1.5 rounded-xl border-amber-200 bg-amber-50/50 text-amber-700 transition-all hover:border-amber-300 hover:bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:border-amber-800 dark:hover:bg-amber-900/40"
                                    asChild
                                >
                                    <Link href={tileReturnsCreate.url()}>
                                        <RotateCcw className="h-4 w-4" />
                                        Return/Exchange
                                    </Link>
                                </Button>
                            )}

                            {enabledFeatures.includes('quotations') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="order-2 sm:order-none h-9 gap-1.5 rounded-xl border-emerald-200 bg-emerald-50/30 text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:border-emerald-800 dark:hover:bg-emerald-900/40"
                                    asChild
                                >
                                    <Link href={quotationsCreate.url()}>
                                        <FileText className="h-4 w-4" />
                                        New Order
                                    </Link>
                                </Button>
                            )}

                            {canExport && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="order-5 sm:order-none h-9 gap-1.5 rounded-xl border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                    asChild
                                >
                                    <Link href={exportIndex.url()}>
                                        <FileOutput className="h-4 w-4" />
                                        Export
                                    </Link>
                                </Button>
                            )}

                            {canImport && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="order-3 sm:order-none h-9 gap-1.5 rounded-xl border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                    asChild
                                >
                                    <Link href={importIndex.url()}>
                                        <FileDown className="h-4 w-4" />
                                        Import
                                    </Link>
                                </Button>
                            )}

                            {canViewReports && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="order-4 sm:order-none h-9 gap-1.5 rounded-xl border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                                    asChild
                                >
                                    <Link href={reportsIndex.url()}>
                                        <BarChart3 className="h-4 w-4" />
                                        Reports
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Financial stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="dashboard-enter dashboard-enter-2">
                        <MetricCard
                            label="Total Payables"
                            value={formatMoney(financialStats.totalPayables)}
                            subtitle="All outstanding payables"
                            icon={DollarSign}
                            accent="rose"
                            chartData={financialStats.payablesChartData}
                        />
                    </div>
                    <div className="dashboard-enter dashboard-enter-3">
                        <MetricCard
                            label="Total Receivables"
                            value={formatMoney(financialStats.totalReceivables)}
                            subtitle="All outstanding receivables"
                            icon={DollarSign}
                            accent="amber"
                            chartData={financialStats.receivablesChartData}
                        />
                    </div>
                    <div className="dashboard-enter dashboard-enter-4">
                        <MetricCard
                            label="Total Earnings"
                            value={formatMoney(totalEarnings)}
                            subtitle={`${earningsLabel} earnings`}
                            icon={TrendingUp}
                            accent="emerald"
                            chartData={financialStats.earningsChartData}
                            dropdown={earningsDropdown}
                        />
                    </div>
                </div>

                {/* Business stats */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="dashboard-enter dashboard-enter-3">
                        <MetricCard
                            label="Total Orders"
                            value={totalOrders.toLocaleString()}
                            subtitle={`${ordersLabel} orders`}
                            icon={ShoppingCart}
                            accent="indigo"
                            chartData={businessStats.ordersChartData}
                            dropdown={ordersDropdown}
                        />
                    </div>
                    <div className="dashboard-enter dashboard-enter-4">
                        <MetricCard
                            label="Total Customers"
                            value={totalCustomers.toLocaleString()}
                            subtitle={customersLabel}
                            icon={Users}
                            accent="slate"
                            chartData={businessStats.customersChartData}
                            dropdown={customersDropdown}
                        />
                    </div>
                </div>

                {/* Sales chart + Top selling tiles */}
                <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
                    <Card className="dashboard-enter dashboard-enter-4 flex flex-col overflow-hidden rounded-[20px] border-slate-100/80 bg-white/90 py-0 shadow-card-premium backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 border-b border-slate-50 px-6 py-5 dark:border-slate-800">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Sales Chart</CardTitle>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total revenue by period</p>
                            </div>
                            <PeriodPills
                                value={salesPeriod}
                                onChange={handleSalesPeriodChange}
                                options={periodOptions}
                            />
                        </CardHeader>
                        <CardContent className="flex-1 p-6">
                            <SalesAreaChart labels={salesChart.labels} values={salesChart.values} />
                        </CardContent>
                    </Card>

                    <Card className="dashboard-enter dashboard-enter-5 flex flex-col overflow-hidden rounded-[20px] border-slate-100/80 bg-white/90 shadow-card-premium backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <CardHeader className="border-b border-slate-50 px-6 py-5 dark:border-slate-800">
                            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Top Selling Tiles</CardTitle>
                            <p className="text-sm text-slate-500 dark:text-slate-400">By total sales amount</p>
                        </CardHeader>
                        <CardContent className="flex-1 p-5">
                            {topSellingTiles.length === 0 ? (
                                <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40">
                                    <div className="text-center">
                                        <Box className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                                        <p className="mt-2 text-sm font-medium text-slate-400 dark:text-slate-500">No tile sales yet</p>
                                        <p className="text-xs text-slate-300 dark:text-slate-600">Top products will appear here</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {topSellingTiles.map((tile) => (
                                        <TopTileCard key={tile.tile_id} tile={tile} imageUrl={imageUrl} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent orders */}
                <Card className="dashboard-enter dashboard-enter-6 overflow-hidden rounded-[20px] border-slate-100/80 bg-white/90 py-0 shadow-card-premium backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                    <CardHeader className="border-b border-slate-50 px-6 py-5 dark:border-slate-800">
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Orders</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Latest 10 invoices</p>
                    </CardHeader>
                    <CardContent className="p-6">
                        <RecentOrdersTable orders={recentOrders} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
