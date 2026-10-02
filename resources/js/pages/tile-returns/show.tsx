import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Printer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { create, download, index, show } from '@/routes/tile-returns';
import type { BreadcrumbItem } from '@/types';

interface Brand {
    id: number;
    brand_name: string;
}

interface Size {
    id: number;
    size_in_inches: string;
}

interface TileReturnData {
    id: number;
    receipt_number: string;
    type: string;
    customer_id: number | null;
    return_tile_id: number;
    return_no_of_boxes: number;
    return_no_of_tiles: number;
    return_total_amount: number;
    return_payment_method: string | null;
    return_notes: string | null;
    exchange_tile_id: number | null;
    exchange_no_of_boxes: number | null;
    exchange_no_of_tiles: number | null;
    exchange_total_amount: number | null;
    payment_difference: number | null;
    payment_status: string | null;
    exchange_payment_method: string | null;
    exchange_remarks: string | null;
    created_at: string;
    customer?: { id: number; name: string } | null;
    return_tile?: {
        id: number;
        tile_code: string | null;
        brand?: Brand;
        size?: Size;
    } | null;
    exchange_tile?: {
        id: number;
        tile_code: string | null;
        brand?: Brand;
        size?: Size;
    } | null;
}

interface Props {
    tileReturn: TileReturnData;
}

function formatMoney(value: number | null | undefined): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 2,
    }).format(value);
}

function formatDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getTileLabel(tile: {
    tile_code: string | null;
    brand?: Brand;
    size?: Size;
}): string {
    const brand = tile.brand?.brand_name ?? '';
    const size = tile.size?.size_in_inches ?? '';
    return [
        tile.tile_code ?? 'N/A',
        brand ? ` - ${brand}` : '',
        size ? ` (${size})` : '',
    ].join('');
}

export default function TileReturnsShow({ tileReturn: r }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Returns / Exchange', href: index.url() },
        { title: r.receipt_number, href: show.url(r.id) },
    ];

    const handlePrint = () => {
        const url = download.url(r.id, { mergeQuery: { inline: '1' } });
        const printWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (printWindow) {
            setTimeout(() => printWindow.print(), 2500);
        }
    };

    const typeLabel = r.type === 'return' ? 'Return' : 'Exchange';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${r.receipt_number} - ${typeLabel} Receipt`} />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950 print:p-0">
                <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={index.url()} className="w-fit">
                            <ArrowLeft className="size-4" />
                            Back to Returns / Exchange
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="size-4" />
                            Print
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={download.url(r.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download className="size-4" />
                                Download PDF
                            </a>
                        </Button>
                        <Button asChild>
                            <Link href={create.url()}>
                                <RotateCcw className="size-4" />
                                Create Another
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="print:border-0 print:shadow-none" id="receipt">
                    <CardHeader className="border-b pb-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {typeLabel} Receipt {r.receipt_number}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Date: {formatDate(r.created_at)}
                                </p>
                            </div>
                            <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                    r.type === 'exchange'
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                }`}
                            >
                                {typeLabel}
                            </span>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Customer
                                </h3>
                                <p className="font-medium">
                                    {r.customer?.name ?? '—'}
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="h-10 px-4 text-left font-medium">
                                            Item
                                        </th>
                                        <th className="h-10 px-4 text-right font-medium">
                                            Qty
                                        </th>
                                        <th className="h-10 px-4 text-right font-medium">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b last:border-0">
                                        <td className="px-4 py-3 font-medium">
                                            {r.return_tile
                                                ? getTileLabel(r.return_tile)
                                                : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {r.return_no_of_boxes} box(es)
                                            {(r.return_no_of_tiles ?? 0) > 0
                                                ? `, ${r.return_no_of_tiles} loose`
                                                : ''}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {formatMoney(r.return_total_amount)}
                                        </td>
                                    </tr>
                                    {r.type === 'exchange' &&
                                        r.exchange_tile_id &&
                                        r.exchange_tile && (
                                            <tr className="border-b last:border-0">
                                                <td className="px-4 py-3 font-medium">
                                                    Exchange:{' '}
                                                    {getTileLabel(
                                                        r.exchange_tile,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {r.exchange_no_of_boxes ??
                                                        0}{' '}
                                                    box(es)
                                                    {(r.exchange_no_of_tiles ??
                                                        0) > 0
                                                        ? `, ${r.exchange_no_of_tiles} loose`
                                                        : ''}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium">
                                                    {formatMoney(
                                                        r.exchange_total_amount,
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                    <span>Total</span>
                                    <span>
                                        {formatMoney(r.return_total_amount)}
                                    </span>
                                </div>
                                {r.type === 'exchange' &&
                                    (r.payment_difference ?? 0) !== 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Payment Difference
                                            </span>
                                            <span>
                                                {formatMoney(
                                                    r.payment_difference,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Payment Method
                                    </span>
                                    <span>
                                        {r.return_payment_method ?? '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {r.return_notes && (
                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Notes
                                </h3>
                                <p className="mt-1 whitespace-pre-wrap">
                                    {r.return_notes}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
