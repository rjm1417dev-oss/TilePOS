import { Head, Link, router, usePage } from '@inertiajs/react';
import { FileText, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { create, index, show } from '@/routes/quotations';
import type { BreadcrumbItem } from '@/types';

interface Item {
    id: number;
    quotation_number: string;
    type: string;
    customer_name: string | null;
    customer_phone: string | null;
    total_amount: string;
    paid_amount: string;
    remaining_amount: string;
    items_count: number;
    created_at: string;
}

interface PaginatedItems {
    data: Item[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    items: PaginatedItems;
    filters: { search?: string; type?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Order/Quotation', href: index.url() },
];

function formatMoney(value: string | number | null): string {
    if (value == null || value === '') return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 2,
    }).format(num);
}

export default function OrderQuotationIndex({ items, filters }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState<string>(filters.type || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (typeFilter !== 'all') params.type = typeFilter;
        router.get(index.url(), params, { preserveState: true });
    };

    const handleTypeChange = (type: string) => {
        setTypeFilter(type);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (type !== 'all') params.type = type;
        router.get(index.url(), params, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order/Quotation" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Order/Quotation
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your quotations and orders
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="size-4" />
                            New Order/Quotation
                        </Link>
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex gap-2">
                                <Button
                                    variant={
                                        typeFilter === 'all'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => handleTypeChange('all')}
                                >
                                    All
                                </Button>
                                <Button
                                    variant={
                                        typeFilter === 'quotation'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        handleTypeChange('quotation')
                                    }
                                >
                                    Quotations
                                </Button>
                                <Button
                                    variant={
                                        typeFilter === 'invoice'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => handleTypeChange('invoice')}
                                >
                                    Orders
                                </Button>
                            </div>
                            <form
                                onSubmit={handleSearch}
                                className="flex gap-2"
                            >
                                <Input
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="max-w-xs"
                                />
                                <Button type="submit" variant="secondary">
                                    <Search className="size-4" />
                                    Search
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {items.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                                    <FileText className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        No quotations or orders yet
                                    </p>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Create your first order or quotation
                                    </p>
                                    <Button asChild>
                                        <Link href={create.url()}>
                                            <Plus className="size-4" />
                                            New Order/Quotation
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Number
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Type
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Customer
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Items
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Total
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Paid
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Due
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Date
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.data.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        {item.quotation_number}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                                                                item.type ===
                                                                'invoice'
                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                            }`}
                                                        >
                                                            {item.type ===
                                                            'invoice'
                                                                ? 'Order'
                                                                : 'Quotation'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {item.customer_name ??
                                                            '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {item.items_count}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {formatMoney(
                                                            item.total_amount,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                                        {formatMoney(
                                                            item.paid_amount,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                                        {formatMoney(
                                                            item.remaining_amount,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                                        {new Date(
                                                            item.created_at,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={show.url(
                                                                    item.id,
                                                                )}
                                                            >
                                                                View
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {items.data.length > 0 && items.last_page > 1 && (
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {items.links.map((link, i) =>
                                        link.url ? (
                                            <Link key={i} href={link.url}>
                                                <Button
                                                    variant={
                                                        link.active
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                >
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <span
                                                key={i}
                                                className="inline-flex h-8 items-center px-3 text-sm text-muted-foreground"
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
