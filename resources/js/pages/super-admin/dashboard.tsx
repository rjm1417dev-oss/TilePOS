import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Database,
    FileText,
    LayoutGrid,
    TrendingUp,
    Users,
    UserCheck,
    UserX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import superAdmin from '@/routes/super-admin';
import type { BreadcrumbItem } from '@/types';

function formatMoney(value: number): string {
    return (
        'Rs ' +
        new Intl.NumberFormat('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    );
}

function buildLinePath(values: number[], w: number, h: number): string {
    const max = Math.max(...values, 1);
    const stepX = values.length > 1 ? w / (values.length - 1) : w;
    const points: string[] = [];
    for (let i = 0; i < values.length; i++) {
        points.push(`${30 + i * stepX},${h - (values[i] / max) * h + 20}`);
    }
    return 'M ' + points.join(' L ');
}

interface TopTenant {
    id: number;
    business_name: string;
    quotations_count: number;
    tiles_count: number;
    stocks_count: number;
}

interface SecurityAlert {
    ip_address: string;
    email: string | null;
    attempts: number;
}

interface LatencyRow {
    path: string;
    avg_ms: number;
    requests: number;
}

interface RevenueByTenantRow {
    tenant_id: number;
    tenant_name: string;
    revenue: number;
}

interface Analytics {
    tenantGrowth: { labels: string[]; values: number[] };
    revenueByTenant: RevenueByTenantRow[];
    trialConversions: {
        started: number;
        converted: number;
        churned: number;
        conversionRate: number;
    };
    churn: { total: number; labels: string[]; values: number[] };
    revenueTrend: { labels: string[]; values: number[] };
}

interface Props {
    stats: {
        tenants_total: number;
        tenants_active: number;
        quotations_total: number;
        failed_logins_24h: number;
    };
    topTenantsByQuotations: TopTenant[];
    securityAlerts: SecurityAlert[];
    latencyData: LatencyRow[];
    analytics?: Analytics;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: superAdmin.dashboard.url() },
];

const emptyAnalytics: Analytics = {
    tenantGrowth: { labels: [], values: [] },
    revenueByTenant: [],
    trialConversions: {
        started: 0,
        converted: 0,
        churned: 0,
        conversionRate: 0,
    },
    churn: { total: 0, labels: [], values: [] },
    revenueTrend: { labels: [], values: [] },
};

export default function SuperAdminDashboard({
    stats,
    topTenantsByQuotations,
    securityAlerts,
    latencyData,
    analytics = emptyAnalytics,
}: Props) {
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        System Overview
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor tenants and system health
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Total Tenants
                            </span>
                            <Building2 className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.tenants_total}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.tenants_active} active
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Active Tenants
                            </span>
                            <LayoutGrid className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.tenants_active}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Total Quotations
                            </span>
                            <FileText className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.quotations_total}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all tenants
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <h3 className="font-semibold">Backup & Export</h3>
                        <p className="text-sm text-muted-foreground">
                            Full database backup and activity logs. Scheduled
                            backups run daily at 02:00.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={superAdmin.export.database.url()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Database className="size-4" />
                                    Backup Database
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={superAdmin.export.logs.url()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FileText className="size-4" />
                                    Export Activity Logs
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div>
                        <h2 className="mb-4 text-lg font-semibold">
                            Analytics & Business Metrics
                        </h2>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Users className="size-5 text-primary" />
                                    <div>
                                        <h3 className="font-semibold">
                                            Tenant Growth
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            New tenants per month (last 12)
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48">
                                    {analytics.tenantGrowth.values.some(
                                        (v) => v > 0,
                                    ) ? (
                                        <svg
                                            width="100%"
                                            height="100%"
                                            viewBox="0 0 400 180"
                                            preserveAspectRatio="xMidYMid meet"
                                            className="overflow-visible"
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="tg-grad"
                                                    x1="0%"
                                                    y1="0%"
                                                    x2="0%"
                                                    y2="100%"
                                                >
                                                    <stop
                                                        offset="0%"
                                                        stopColor="hsl(var(--primary))"
                                                        stopOpacity={0.4}
                                                    />
                                                    <stop
                                                        offset="100%"
                                                        stopColor="hsl(var(--primary))"
                                                        stopOpacity={0.05}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d={
                                                    buildLinePath(
                                                        analytics.tenantGrowth
                                                            .values,
                                                        340,
                                                        160,
                                                    ) + ' L 370 170 L 30 170 Z'
                                                }
                                                fill="url(#tg-grad)"
                                            />
                                            <path
                                                d={buildLinePath(
                                                    analytics.tenantGrowth
                                                        .values,
                                                    340,
                                                    160,
                                                )}
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={2}
                                                fill="none"
                                            />
                                        </svg>
                                    ) : (
                                        <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground">
                                            No new tenants in this period
                                        </div>
                                    )}
                                </div>
                                {analytics.tenantGrowth.labels.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        {analytics.tenantGrowth.labels
                                            .slice(-6)
                                            .map((l, i) => (
                                                <span key={i}>{l}</span>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                                    <div>
                                        <h3 className="font-semibold">
                                            Revenue Trend
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Total invoice revenue by month
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatMoney(
                                        analytics.revenueTrend.values.reduce(
                                            (a, b) => a + b,
                                            0,
                                        ),
                                    )}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="h-48">
                                    {analytics.revenueTrend.values.some(
                                        (v) => v > 0,
                                    ) ? (
                                        <svg
                                            width="100%"
                                            height="100%"
                                            viewBox="0 0 400 180"
                                            preserveAspectRatio="xMidYMid meet"
                                            className="overflow-visible"
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="rev-grad"
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
                                                d={
                                                    buildLinePath(
                                                        analytics.revenueTrend
                                                            .values,
                                                        340,
                                                        160,
                                                    ) + ' L 370 170 L 30 170 Z'
                                                }
                                                fill="url(#rev-grad)"
                                            />
                                            <path
                                                d={buildLinePath(
                                                    analytics.revenueTrend
                                                        .values,
                                                    340,
                                                    160,
                                                )}
                                                stroke="hsl(142 71% 45%)"
                                                strokeWidth={2}
                                                fill="none"
                                            />
                                        </svg>
                                    ) : (
                                        <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-muted/20 text-sm text-muted-foreground">
                                            No revenue in this period
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <UserCheck className="size-5 text-primary" />
                                    <div>
                                        <h3 className="font-semibold">
                                            Trial Conversions
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Trial started vs converted
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-4">
                                    <div>
                                        <span className="text-2xl font-bold">
                                            {
                                                analytics.trialConversions
                                                    .conversionRate
                                            }
                                            %
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                            Conversion rate
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-lg font-semibold">
                                            {
                                                analytics.trialConversions
                                                    .converted
                                            }
                                        </span>
                                        <span className="text-muted-foreground">
                                            {' '}
                                            /{' '}
                                            {
                                                analytics.trialConversions
                                                    .started
                                            }{' '}
                                            converted
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-lg font-semibold text-accent-600 dark:text-accent-400">
                                            {analytics.trialConversions.churned}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {' '}
                                            churned
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <UserX className="size-5 text-accent-600 dark:text-accent-400" />
                                    <div>
                                        <h3 className="font-semibold">Churn</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Cancelled/expired tenants
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-2 text-2xl font-bold text-accent-600 dark:text-accent-400">
                                    {analytics.churn.total}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Total churned (all time)
                                </p>
                                {analytics.churn.values.some((v) => v > 0) && (
                                    <div className="mt-4 h-24">
                                        <svg
                                            width="100%"
                                            height="100%"
                                            viewBox="0 0 400 100"
                                            preserveAspectRatio="xMidYMid meet"
                                        >
                                            <path
                                                d={
                                                    buildLinePath(
                                                        analytics.churn.values,
                                                        340,
                                                        80,
                                                    ) + ' L 370 90 L 30 90 Z'
                                                }
                                                fill="var(--accent)"
                                                fillOpacity={0.2}
                                            />
                                            <path
                                                d={buildLinePath(
                                                    analytics.churn.values,
                                                    340,
                                                    80,
                                                )}
                                                stroke="var(--accent)"
                                                strokeWidth={2}
                                                fill="none"
                                            />
                                        </svg>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Churned per month (last 12)
                                        </p>
                                    </div>
                                )}
                            </CardHeader>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <h3 className="font-semibold">Revenue by Tenant</h3>
                            <p className="text-sm text-muted-foreground">
                                Top 10 tenants by invoice revenue (last 12
                                months)
                            </p>
                        </CardHeader>
                        <CardContent>
                            {analytics.revenueByTenant.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    No invoice revenue yet
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {analytics.revenueByTenant.map((t, i) => {
                                        const maxRev = Math.max(
                                            ...analytics.revenueByTenant.map(
                                                (x) => x.revenue,
                                            ),
                                            1,
                                        );
                                        const pct = (t.revenue / maxRev) * 100;
                                        return (
                                            <div
                                                key={t.tenant_id}
                                                className="flex items-center gap-3"
                                            >
                                                <span className="w-6 text-right text-xs text-muted-foreground">
                                                    {i + 1}.
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <Link
                                                            href={superAdmin.tenants.show.url(
                                                                t.tenant_id,
                                                            )}
                                                            className="truncate font-medium hover:underline"
                                                        >
                                                            {t.tenant_name}
                                                        </Link>
                                                        <span className="shrink-0 font-medium">
                                                            {formatMoney(
                                                                t.revenue,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-primary/70"
                                                            style={{
                                                                width: `${pct}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">
                                Security Alerts
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Failed logins (3+ attempts) in last 24h —{' '}
                                {stats.failed_logins_24h} total
                            </p>
                        </CardHeader>
                        <CardContent>
                            {securityAlerts.length === 0 ? (
                                <p className="py-4 text-center text-muted-foreground">
                                    No alerts
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="h-9 px-3 text-left font-medium">
                                                    IP
                                                </th>
                                                <th className="h-9 px-3 text-left font-medium">
                                                    Email
                                                </th>
                                                <th className="h-9 px-3 text-right font-medium">
                                                    Attempts
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {securityAlerts.map((a, i) => (
                                                <tr
                                                    key={i}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="px-3 py-2 font-mono">
                                                        {a.ip_address}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {a.email ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-accent-600">
                                                        {a.attempts}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">
                                Response time (last hour)
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Slowest paths by avg latency
                            </p>
                        </CardHeader>
                        <CardContent>
                            {latencyData.length === 0 ? (
                                <p className="py-4 text-center text-muted-foreground">
                                    No data yet
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="h-9 px-3 text-left font-medium">
                                                    Path
                                                </th>
                                                <th className="h-9 px-3 text-right font-medium">
                                                    Avg (ms)
                                                </th>
                                                <th className="h-9 px-3 text-right font-medium">
                                                    Requests
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {latencyData.map((r, i) => (
                                                <tr
                                                    key={i}
                                                    className="border-b last:border-0"
                                                >
                                                    <td className="px-3 py-2 font-mono text-xs">
                                                        {r.path}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {r.avg_ms}
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        {r.requests}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">
                            Top Tenants by Quotation Volume
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Resource usage heatmap — tenants with most activity
                        </p>
                    </CardHeader>
                    <CardContent>
                        {topTenantsByQuotations.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No tenants yet
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="h-10 px-4 text-left font-medium">
                                                Tenant
                                            </th>
                                            <th className="h-10 px-4 text-right font-medium">
                                                Quotations
                                            </th>
                                            <th className="h-10 px-4 text-right font-medium">
                                                Tiles
                                            </th>
                                            <th className="h-10 px-4 text-right font-medium">
                                                Stock
                                            </th>
                                            <th className="h-10 px-4 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topTenantsByQuotations.map((t) => (
                                            <tr
                                                key={t.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {t.business_name}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {t.quotations_count}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {t.tiles_count}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {t.stocks_count}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={superAdmin.tenants.show.url(
                                                            t.id,
                                                        )}
                                                        className="text-primary hover:underline"
                                                    >
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
