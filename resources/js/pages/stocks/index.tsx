import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Boxes } from 'lucide-react';
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
import { create, destroy, edit, index } from '@/routes/stocks';
import type { BreadcrumbItem } from '@/types';

interface TileInfo {
    id: number;
    tile_code: string | null;
    brand?: { brand_name: string };
    size?: { size_in_inches: string };
}

interface Stock {
    id: number;
    tile_id: number;
    in_stock: number;
    minimum_stock_level: number;
    stock_reference: string;
    stock_location: string;
    supplier?: { id: number; supplier_name: string } | null;
    tile: TileInfo;
    created_at: string;
}

interface PaginatedStocks {
    data: Stock[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface TileOption {
    id: number;
    tile_code: string | null;
    label: string;
}

interface Props {
    stocks: PaginatedStocks;
    tiles: TileOption[];
    filters: { search?: string; tile_id?: string; stock_status?: string };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Stock', href: index.url() }];

function stockStatusBadge(stock: Stock): { label: string; className: string } {
    if (stock.in_stock <= 0)
        return {
            label: 'Out of Stock',
            className:
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
    if (stock.in_stock <= stock.minimum_stock_level)
        return {
            label: 'Low Stock',
            className:
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        };
    return {
        label: 'In Stock',
        className:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
}

export default function StocksIndex({ stocks, tiles, filters }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [search, setSearch] = useState(filters.search || '');
    const [tileId, setTileId] = useState(filters.tile_id || '');
    const [stockStatus, setStockStatus] = useState(filters.stock_status || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string | undefined> = {};
        if (search) params.search = search;
        if (tileId) params.tile_id = tileId;
        if (stockStatus) params.stock_status = stockStatus;
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
            <Head title="Stock" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Stock
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage tile inventory
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="size-4" />
                            Add Stock
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
                                <SelectTrigger className="w-[200px]">
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
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={stockStatus || 'all'}
                                onValueChange={(v) =>
                                    setStockStatus(v === 'all' ? '' : v)
                                }
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All status
                                    </SelectItem>
                                    <SelectItem value="low_stock">
                                        Low stock
                                    </SelectItem>
                                    <SelectItem value="out_of_stock">
                                        Out of stock
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
                            {stocks.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                                    <Boxes className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        No stock entries yet
                                    </p>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Add stock by receiving new inventory
                                    </p>
                                    <Button asChild>
                                        <Link href={create.url()}>
                                            <Plus className="size-4" />
                                            Add Stock
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
                                                    In Stock
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Min Level
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Status
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Supplier
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Location
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stocks.data.map((stock) => {
                                                const status =
                                                    stockStatusBadge(stock);
                                                return (
                                                    <tr
                                                        key={stock.id}
                                                        className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-3 font-medium">
                                                            {
                                                                stock.tile
                                                                    .tile_code
                                                            }{' '}
                                                            {stock.tile.brand &&
                                                                `- ${stock.tile.brand.brand_name}`}{' '}
                                                            {stock.tile.size &&
                                                                `(${stock.tile.size.size_in_inches})`}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {stock.in_stock}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {
                                                                stock.minimum_stock_level
                                                            }
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                                                            >
                                                                {status.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {stock.supplier
                                                                ?.supplier_name ??
                                                                stock.stock_reference ??
                                                                '—'}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {
                                                                stock.stock_location
                                                            }
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
                                                                            stock.id,
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
                                                                            stock.id,
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

                            {stocks.data.length > 0 && stocks.last_page > 1 && (
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {stocks.links.map((link, i) =>
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
                        <DialogTitle>Delete stock entry</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this stock entry?
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
