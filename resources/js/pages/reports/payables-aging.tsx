import { Head, Link } from '@inertiajs/react';
import { Banknote, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index, payablesAging } from '@/routes/reports';
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

interface PayableItem {
    id: number;
    stock_reference: string | null;
    tile_code: string | null;
    supplier: string | null;
    purchased_price: number;
    remaining_amount: number;
    created_at: string;
    days_overdue: number;
}

interface Props {
    buckets: Record<string, number>;
    items: Record<string, PayableItem[]>;
}

const bucketOrder = ['0-30', '31-60', '61-90', '90+'] as const;
const bucketLabels: Record<string, string> = {
    '0-30': '0–30 days',
    '31-60': '31–60 days',
    '61-90': '61–90 days',
    '90+': '90+ days',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: index.url() },
    { title: 'Payables Aging', href: payablesAging.url() },
];

export default function ReportPayablesAging({ buckets, items }: Props) {
    const total = bucketOrder.reduce((sum, b) => sum + buckets[b], 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payables Aging" />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Link
                    href={index.url()}
                    className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                    Back to Reports
                </Link>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {bucketOrder.map((key) => (
                        <Card key={key}>
                            <CardHeader className="pb-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {bucketLabels[key]}
                                </p>
                                <p className="text-xl font-bold text-destructive">
                                    {formatMoney(buckets[key])}
                                </p>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Banknote className="size-5 text-primary" />
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Total Outstanding
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        By age bucket
                                    </p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold">
                                {formatMoney(total)}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {total === 0 ? (
                            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
                                No outstanding payables
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {bucketOrder.map((bucket) => {
                                    const bucketItems = items[bucket] ?? [];
                                    if (bucketItems.length === 0) return null;
                                    return (
                                        <div key={bucket}>
                                            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                                                {bucketLabels[bucket]} (
                                                {formatMoney(buckets[bucket])})
                                            </h3>
                                            <div className="overflow-x-auto rounded-lg border">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b bg-muted/50">
                                                            <th className="px-4 py-2 text-left font-medium">
                                                                Reference
                                                            </th>
                                                            <th className="px-4 py-2 text-left font-medium">
                                                                Tile
                                                            </th>
                                                            <th className="px-4 py-2 text-left font-medium">
                                                                Supplier
                                                            </th>
                                                            <th className="px-4 py-2 text-right font-medium">
                                                                Remaining
                                                            </th>
                                                            <th className="px-4 py-2 text-right font-medium">
                                                                Days
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bucketItems.map(
                                                            (item) => (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="border-b last:border-0 hover:bg-muted/30"
                                                                >
                                                                    <td className="px-4 py-2">
                                                                        {item.stock_reference ??
                                                                            '—'}
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        {item.tile_code ??
                                                                            '—'}
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        {item.supplier ??
                                                                            '—'}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-right font-medium">
                                                                        {formatMoney(
                                                                            item.remaining_amount,
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-right text-muted-foreground">
                                                                        {
                                                                            item.days_overdue
                                                                        }
                                                                        d
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
