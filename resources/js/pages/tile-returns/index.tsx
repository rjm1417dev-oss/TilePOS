import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { create, index, show } from '@/routes/tile-returns';
import type { BreadcrumbItem } from '@/types';

interface TileReturnRecord {
    id: number;
    receipt_number: string;
    type: string;
    return_total_amount: number;
    exchange_total_amount: number | null;
    payment_difference: number | null;
    created_at: string;
    customer?: { id: number; name: string } | null;
    return_tile?: { id: number; tile_code: string | null } | null;
    exchange_tile?: { id: number; tile_code: string | null } | null;
}

interface PaginatedReturns {
    data: TileReturnRecord[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    returns: PaginatedReturns;
    filters: { type?: string; search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Returns / Exchange', href: index.url() },
];

function formatMoney(value: number | null | undefined): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-PK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function TileReturnsIndex({ returns, filters }: Props) {
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (typeFilter) params.type = typeFilter;
        if (search) params.search = search;
        router.get(index.url(), params, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Returns / Exchange" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Returns / Exchange
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage tile returns and exchanges
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="size-4" />
                            Create Tile Return
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <form
                            onSubmit={handleFilter}
                            className="flex flex-wrap gap-2"
                        >
                            <Input
                                placeholder="Search receipt, customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-xs"
                            />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">All types</option>
                                <option value="return">Return</option>
                                <option value="exchange">Exchange</option>
                            </select>
                            <Button type="submit" variant="secondary">
                                Filter
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {returns.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                                    <RotateCcw className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        No returns yet
                                    </p>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Create your first tile return or
                                        exchange
                                    </p>
                                    <Button asChild>
                                        <Link href={create.url()}>
                                            <Plus className="size-4" />
                                            Create Tile Return
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Receipt
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Type
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Customer
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Returned Tile
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Return Amount
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {returns.data.map((r) => (
                                                <tr
                                                    key={r.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        {r.receipt_number}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                r.type ===
                                                                'exchange'
                                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            }`}
                                                        >
                                                            {r.type === 'return'
                                                                ? 'Return'
                                                                : 'Exchange'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {r.customer?.name ??
                                                            '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {r.return_tile
                                                            ?.tile_code ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {formatMoney(
                                                            r.return_total_amount,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={show.url(
                                                                    r.id,
                                                                )}
                                                            >
                                                                <Eye className="size-4" />
                                                                <span className="sr-only">
                                                                    View
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {returns.data.length > 0 &&
                                returns.last_page > 1 && (
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        {returns.links.map((link, i) =>
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
