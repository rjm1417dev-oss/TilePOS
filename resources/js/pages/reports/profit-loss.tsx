import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index, profitLoss } from '@/routes/reports';
import type { BreadcrumbItem } from '@/types';

function formatMoney(value: number): string {
    return (
        'Rs ' +
        new Intl.NumberFormat('en-PK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    );
}

interface Props {
    data: { labels: string[]; revenue: number[] };
    filters: { period: string; months: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: index.url() },
    { title: 'Profit & Loss', href: profitLoss.url() },
];

export default function ReportProfitLoss({ data, filters }: Props) {
    const totalRevenue = data.revenue.reduce((a, b) => a + b, 0);

    const handlePeriodChange = (value: string) => {
        router.get(
            profitLoss.url(),
            { period: value, months: filters.months },
            { preserveState: true },
        );
    };

    const handleMonthsChange = (value: string) => {
        router.get(
            profitLoss.url(),
            { period: filters.period, months: value },
            { preserveState: true },
        );
    };

    const hasData = data.revenue.some((v) => v > 0);

    const max = hasData ? Math.max(...data.revenue, 1) : 1;
    const h = 180;
    const w = 340;
    const stepX = data.revenue.length > 1 ? w / (data.revenue.length - 1) : w;
    const points: string[] = [];
    for (let i = 0; i < data.revenue.length; i++) {
        points.push(
            `${30 + i * stepX},${h - (data.revenue[i] / max) * h + 20}`,
        );
    }
    const linePath = points.length ? 'M ' + points.join(' L ') : '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profit & Loss" />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href={index.url()}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="size-4" />
                        Back to Reports
                    </Link>
                    <div className="flex flex-wrap gap-2">
                        <Select
                            value={filters.period}
                            onValueChange={handlePeriodChange}
                        >
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={String(filters.months)}
                            onValueChange={handleMonthsChange}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">Last 3 months</SelectItem>
                                <SelectItem value="6">Last 6 months</SelectItem>
                                <SelectItem value="12">
                                    Last 12 months
                                </SelectItem>
                                <SelectItem value="24">
                                    Last 24 months
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="size-5 text-primary" />
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Revenue Over Time
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Total paid amount from invoices
                                </p>
                            </div>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatMoney(totalRevenue)}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72">
                            {hasData && linePath ? (
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 400 220"
                                    preserveAspectRatio="xMidYMid meet"
                                    className="overflow-visible"
                                >
                                    <defs>
                                        <linearGradient
                                            id="pl-revenue-grad"
                                            x1="0%"
                                            y1="0%"
                                            x2="0%"
                                            y2="100%"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="hsl(142 71% 45%)"
                                                stopOpacity={0.4}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="hsl(142 71% 45%)"
                                                stopOpacity={0.05}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={linePath + ' L 370 200 L 30 200 Z'}
                                        fill="url(#pl-revenue-grad)"
                                    />
                                    <path
                                        d={linePath}
                                        stroke="hsl(142 71% 45%)"
                                        strokeWidth={2}
                                        fill="none"
                                    />
                                </svg>
                            ) : hasData ? (
                                <div className="flex h-full items-center justify-center rounded-lg border bg-muted/10 p-4 text-muted-foreground">
                                    Single data point
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
                                    No revenue data for the selected period
                                </div>
                            )}
                        </div>
                        {data.labels.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                {data.labels.slice(-12).map((l, i) => (
                                    <span key={i}>{l}</span>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
