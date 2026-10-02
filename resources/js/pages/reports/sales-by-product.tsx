import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index, salesByProduct } from '@/routes/reports';
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

interface SaleItem {
    name: string;
    type: string;
    total: number;
    quantity: number;
}

interface Props {
    data: SaleItem[];
    filters: { months: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: index.url() },
    { title: 'Sales by Product', href: salesByProduct.url() },
];

export default function ReportSalesByProduct({ data, filters }: Props) {
    const handleMonthsChange = (value: string) => {
        router.get(
            salesByProduct.url(),
            { months: value },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales by Product" />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href={index.url()}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="size-4" />
                        Back to Reports
                    </Link>
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
                            <SelectItem value="12">Last 12 months</SelectItem>
                            <SelectItem value="24">Last 24 months</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Package className="size-5 text-primary" />
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Top 50 Products by Sales
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Best sellers (tiles & products)
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data.length === 0 ? (
                            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
                                No sales data for the selected period
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-2 text-left font-medium">
                                                #
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Product / Tile
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Type
                                            </th>
                                            <th className="px-4 py-2 text-right font-medium">
                                                Qty
                                            </th>
                                            <th className="px-4 py-2 text-right font-medium">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, i) => (
                                            <tr
                                                key={i}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-2 text-muted-foreground">
                                                    {i + 1}
                                                </td>
                                                <td className="px-4 py-2 font-medium">
                                                    {item.name}
                                                </td>
                                                <td className="px-4 py-2 capitalize">
                                                    {item.type}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {item.quantity.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2 text-right font-medium">
                                                    {formatMoney(item.total)}
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
        </AppLayout>
    );
}
