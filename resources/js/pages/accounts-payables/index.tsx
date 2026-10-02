import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Banknote } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index } from '@/routes/accounts-payables';
import type { BreadcrumbItem } from '@/types';

interface Payable {
    id: number;
    tile_id: number | null;
    stock_reference: string | null;
    purchased_price: string;
    paid_amount: string;
    remaining_amount: string;
    tile: { tile_code: string | null } | null;
    created_at: string;
}

interface PaginatedPayables {
    data: Payable[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Tile {
    id: number;
    tile_code: string | null;
}

interface Props {
    payables: PaginatedPayables;
    tiles: Tile[];
    filters: { search?: string; tile_id?: string; payment_status?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Accounts Payables', href: index.url() },
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

function paymentStatus(record: Payable): { label: string; className: string } {
    const remaining = parseFloat(record.remaining_amount);
    const paid = parseFloat(record.paid_amount);
    const purchased = parseFloat(record.purchased_price);
    if (remaining <= 0)
        return {
            label: 'Completed',
            className:
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        };
    if (purchased > 0 && paid >= purchased / 2)
        return {
            label: 'Partial',
            className:
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        };
    return {
        label: 'Pending',
        className:
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
}

export default function AccountsPayablesIndex({
    payables,
    tiles,
    filters,
}: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [search, setSearch] = useState(filters.search || '');
    const [tileId, setTileId] = useState(filters.tile_id || '');
    const [status, setStatus] = useState(filters.payment_status || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string | undefined> = {};
        if (search) params.search = search;
        if (tileId) params.tile_id = tileId;
        if (status) params.payment_status = status;
        router.get(index.url(), params, { preserveState: true });
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(destroy.url(deleteId), {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts Payables" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Accounts Payables
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track amounts you owe to suppliers
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="size-4" />
                            Add Payable
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
                        <form
                            onSubmit={handleSearch}
                            className="flex flex-wrap gap-2"
                        >
                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-xs"
                            />
                            <Select
                                value={tileId || 'all'}
                                onValueChange={(v) =>
                                    setTileId(v === 'all' ? '' : v)
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All tiles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All tiles
                                    </SelectItem>
                                    {tiles.map((t) => (
                                        <SelectItem
                                            key={t.id}
                                            value={String(t.id)}
                                        >
                                            {t.tile_code ?? '—'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={status || 'all'}
                                onValueChange={(v) =>
                                    setStatus(v === 'all' ? '' : v)
                                }
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="partial">
                                        Partial
                                    </SelectItem>
                                    <SelectItem value="completed">
                                        Completed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {payables.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                                    <Banknote className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        No payables yet
                                    </p>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Record amounts you owe to suppliers
                                    </p>
                                    <Button asChild>
                                        <Link href={create.url()}>
                                            <Plus className="size-4" />
                                            Add Payable
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Tile
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Reference
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Purchased
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Paid
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Remaining
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Status
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payables.data.map((p) => {
                                                const ps = paymentStatus(p);
                                                return (
                                                    <tr
                                                        key={p.id}
                                                        className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-3 font-medium">
                                                            {p.tile
                                                                ?.tile_code ??
                                                                '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {p.stock_reference ??
                                                                '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {formatMoney(
                                                                p.purchased_price,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-green-600">
                                                            {formatMoney(
                                                                p.paid_amount,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span
                                                                className={
                                                                    parseFloat(
                                                                        p.remaining_amount,
                                                                    ) > 0
                                                                        ? 'font-medium text-red-600'
                                                                        : ''
                                                                }
                                                            >
                                                                {formatMoney(
                                                                    p.remaining_amount,
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${ps.className}`}
                                                            >
                                                                {ps.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={edit.url(
                                                                            p.id,
                                                                        )}
                                                                    >
                                                                        <Pencil className="size-4" />
                                                                        <span className="sr-only">
                                                                            Edit
                                                                        </span>
                                                                    </Link>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        setDeleteId(
                                                                            p.id,
                                                                        )
                                                                    }
                                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                    <span className="sr-only">
                                                                        Delete
                                                                    </span>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {payables.data.length > 0 &&
                                payables.last_page > 1 && (
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        {payables.links.map((link, i) =>
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

            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete payable</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this payable entry?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
