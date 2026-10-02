import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index, download } from '@/routes/quotations';
import type { BreadcrumbItem } from '@/types';

interface QuotationItem {
    id: number;
    item_type: string;
    item_name: string;
    quantity: string;
    unit_price: string;
    subtotal: string;
    boxes_required: number | null;
    loose_tiles: number;
}

interface Quotation {
    id: number;
    quotation_number: string;
    type: string;
    customer_name: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    customer_cnic: string | null;
    total_amount: string;
    paid_amount: string;
    remaining_amount: string;
    discount_percentage: string;
    discount_amount: string;
    tax_percentage: string;
    tax_amount: string;
    invoice_date: string | null;
    due_date: string | null;
    notes: string | null;
    items: QuotationItem[];
}

interface Props {
    quotation: Quotation;
}

function formatMoney(value: string | number | null): string {
    if (value == null || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 2,
    }).format(num);
}

function formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function OrderQuotationShow({ quotation }: Props) {
    const isInvoice = quotation.type === 'invoice';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Order/Quotation',
            href: index.url(),
        },
        {
            title: quotation.quotation_number,
            href: '#',
        },
    ];

    const handlePrint = () => {
        const url = download.url(
            { quotation: quotation.id },
            { mergeQuery: { inline: '1' } },
        );
        const printWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (printWindow) {
            setTimeout(() => printWindow.print(), 2500);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${quotation.quotation_number} - ${isInvoice ? 'Order' : 'Quotation'}`}
            />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950 print:p-0">
                <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={index.url()} className="w-fit">
                            <ArrowLeft className="size-4" />
                            Back to Order/Quotation
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="size-4" />
                            Print
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={download.url({ quotation: quotation.id })}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Download className="size-4" />
                                Download PDF
                            </a>
                        </Button>
                    </div>
                </div>

                <Card className="print:border-0 print:shadow-none" id="receipt">
                    <CardHeader className="border-b pb-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {isInvoice ? 'Invoice' : 'Quotation'}{' '}
                                    {quotation.quotation_number}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Date: {formatDate(quotation.invoice_date)}
                                    {quotation.due_date && (
                                        <>
                                            {' '}
                                            • Due:{' '}
                                            {formatDate(quotation.due_date)}
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Customer
                                </h3>
                                <p className="font-medium">
                                    {quotation.customer_name ?? '—'}
                                </p>
                                {quotation.customer_phone && (
                                    <p className="text-sm">
                                        {quotation.customer_phone}
                                    </p>
                                )}
                                {quotation.customer_address && (
                                    <p className="text-sm text-muted-foreground">
                                        {quotation.customer_address}
                                    </p>
                                )}
                                {quotation.customer_cnic && (
                                    <p className="text-sm">
                                        CNIC: {quotation.customer_cnic}
                                    </p>
                                )}
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
                                            Unit Price
                                        </th>
                                        <th className="h-10 px-4 text-right font-medium">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotation.items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {item.item_name}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {item.item_type === 'tile'
                                                    ? `${item.boxes_required ?? 0} box(es)${
                                                          (item.loose_tiles ??
                                                              0) > 0
                                                              ? `, ${item.loose_tiles} loose`
                                                              : ''
                                                      }`
                                                    : `${item.quantity} unit(s)`}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatMoney(item.unit_price)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatMoney(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <div className="w-full max-w-xs space-y-2">
                                {parseFloat(
                                    quotation.discount_percentage || '0',
                                ) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Discount
                                        </span>
                                        <span>
                                            {formatMoney(
                                                quotation.discount_amount,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {parseFloat(quotation.tax_percentage || '0') >
                                    0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Tax
                                        </span>
                                        <span>
                                            {formatMoney(quotation.tax_amount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                    <span>Total</span>
                                    <span>
                                        {formatMoney(quotation.total_amount)}
                                    </span>
                                </div>
                                {isInvoice && (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Paid
                                            </span>
                                            <span>
                                                {formatMoney(
                                                    quotation.paid_amount,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium">
                                            <span className="text-muted-foreground">
                                                Remaining
                                            </span>
                                            <span>
                                                {formatMoney(
                                                    quotation.remaining_amount,
                                                )}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {quotation.notes && (
                            <div className="mt-6 border-t pt-4">
                                <h3 className="text-sm font-medium text-muted-foreground">
                                    Notes
                                </h3>
                                <p className="mt-1 whitespace-pre-wrap">
                                    {quotation.notes}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
