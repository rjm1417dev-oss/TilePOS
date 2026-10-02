import { Head, Link } from '@inertiajs/react';
import { Boxes, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index, stockValuation } from '@/routes/reports';
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

interface StockItem {
    id: number;
    tile_code: string | null;
    brand: string | null;
    in_stock: number;
    cost_per_box: number;
    valuation: number;
}

interface Props {
    items: StockItem[];
    total: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: index.url() },
    { title: 'Stock Valuation', href: stockValuation.url() },
];

export default function ReportStockValuation({ items, total }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stock Valuation" />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Link
                    href={index.url()}
                    className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="size-4" />
                    Back to Reports
                </Link>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Boxes className="size-5 text-primary" />
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Stock Valuation
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Inventory value by cost per box
                                    </p>
                                </div>
                            </div>
                            <p className="text-2xl font-bold">
                                {formatMoney(total)}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {items.length === 0 ? (
                            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
                                No stock with valuation
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-2 text-left font-medium">
                                                Tile Code
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium">
                                                Brand
                                            </th>
                                            <th className="px-4 py-2 text-right font-medium">
                                                In Stock
                                            </th>
                                            <th className="px-4 py-2 text-right font-medium">
                                                Cost/Box
                                            </th>
                                            <th className="px-4 py-2 text-right font-medium">
                                                Valuation
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-2 font-medium">
                                                    {item.tile_code ?? '—'}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {item.brand ?? '—'}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {item.in_stock.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {formatMoney(
                                                        item.cost_per_box,
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-right font-medium">
                                                    {formatMoney(
                                                        item.valuation,
                                                    )}
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
