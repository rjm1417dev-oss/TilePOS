import { Head, Link, usePage } from '@inertiajs/react';
import {
    Banknote,
    Boxes,
    FileDown,
    FileOutput,
    Package,
    Receipt,
    Tag,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as exportIndex } from '@/routes/export';
import { index as importIndex } from '@/routes/import';
import {
    index,
    profitLoss,
    payablesAging,
    receivablesAging,
    salesByProduct,
    salesByBrand,
    salesByCustomer,
    stockValuation,
} from '@/routes/reports';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reports', href: index.url() }];

const reportCards = [
    {
        title: 'Profit & Loss',
        description: 'Revenue vs costs over time',
        href: profitLoss.url(),
        icon: TrendingUp,
    },
    {
        title: 'Payables Aging',
        description: 'Outstanding amounts by age (30/60/90 days)',
        href: payablesAging.url(),
        icon: Banknote,
    },
    {
        title: 'Receivables Aging',
        description: 'Outstanding receivables by age',
        href: receivablesAging.url(),
        icon: Receipt,
    },
    {
        title: 'Sales by Product',
        description: 'Best sellers by product/tile',
        href: salesByProduct.url(),
        icon: Package,
    },
    {
        title: 'Sales by Brand',
        description: 'Sales breakdown by brand',
        href: salesByBrand.url(),
        icon: Tag,
    },
    {
        title: 'Sales by Customer',
        description: 'Customer behavior and top buyers',
        href: salesByCustomer.url(),
        icon: Users,
    },
    {
        title: 'Stock Valuation',
        description: 'Inventory value and movement',
        href: stockValuation.url(),
        icon: Boxes,
    },
];

export default function ReportsIndex() {
    const { auth } = usePage().props as { auth?: { permissions?: string[] } };
    const canImport = auth?.permissions?.includes('import.create') ?? false;
    const canExport = auth?.permissions?.includes('export.create') ?? false;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Reports & Analytics
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Financial reports, aging analysis, sales insights, and
                        stock valuation
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {reportCards.map((report) => {
                        const Icon = report.icon;
                        return (
                            <Link key={report.href} href={report.href}>
                                <Card className="h-full transition-colors hover:border-primary/30 hover:bg-muted/50">
                                    <CardHeader className="flex flex-row items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                            <Icon className="size-5 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="text-base">
                                                {report.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm">
                                                {report.description}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {(canImport || canExport) && (
                    <div className="mt-2 border-t pt-6">
                        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                            Tools
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {canExport && (
                                <Link href={exportIndex.url()}>
                                    <Card className="h-full border-primary/30 bg-primary/5 transition-colors hover:border-primary/50 hover:bg-primary/10">
                                        <CardHeader className="flex flex-row items-center gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                                                <FileOutput className="size-5 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <CardTitle className="text-base">
                                                    Data Export (CSV)
                                                </CardTitle>
                                                <CardDescription className="text-sm">
                                                    Export products, customers,
                                                    quotations, and more to CSV
                                                    for reporting or backups.
                                                </CardDescription>
                                            </div>
                                            <span className="text-sm font-medium text-primary">
                                                Export →
                                            </span>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            )}
                            {canImport && (
                                <Link href={importIndex.url()}>
                                    <Card className="h-full border-primary/30 bg-primary/5 transition-colors hover:border-primary/50 hover:bg-primary/10">
                                        <CardHeader className="flex flex-row items-center gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                                                <FileDown className="size-5 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <CardTitle className="text-base">
                                                    Bulk Import (CSV)
                                                </CardTitle>
                                                <CardDescription className="text-sm">
                                                    Import products, customers,
                                                    or suppliers from CSV.
                                                    Reduces manual entry when
                                                    migrating or managing many
                                                    records.
                                                </CardDescription>
                                            </div>
                                            <span className="text-sm font-medium text-primary">
                                                Import →
                                            </span>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
