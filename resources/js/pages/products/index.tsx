import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { create, destroy, edit, index } from '@/routes/products';
import type { BreadcrumbItem } from '@/types';

interface Brand {
    id: number;
    brand_name: string;
}

interface Product {
    id: number;
    product_name: string;
    sale_price: string;
    product_image: string | null;
    brand: Brand | null;
    created_at: string;
    updated_at: string;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    products: PaginatedProducts;
    brands: Brand[];
    filters: { search?: string; brand_id?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: index.url() },
];

function storageUrl(path: string | null): string {
    if (!path) return '';
    return `/storage/${path}`;
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

export default function ProductsIndex({ products, brands, filters }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [search, setSearch] = useState(filters.search || '');
    const [brandId, setBrandId] = useState(filters.brand_id || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string | undefined> = {};
        if (search) params.search = search;
        if (brandId && brandId !== 'all') params.brand_id = brandId;
        router.get(index.url(), params, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
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
            <Head title="Products" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Products
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your product inventory
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="size-4" />
                            Add Product
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
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-xs"
                            />
                            <Select
                                value={brandId || 'all'}
                                onValueChange={(v) =>
                                    setBrandId(v === 'all' ? '' : v)
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All brands" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All brands
                                    </SelectItem>
                                    {brands.map((b) => (
                                        <SelectItem
                                            key={b.id}
                                            value={String(b.id)}
                                        >
                                            {b.brand_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {products.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                                    <Package className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        No products yet
                                    </p>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Get started by adding your first product
                                    </p>
                                    <Button asChild>
                                        <Link href={create.url()}>
                                            <Plus className="size-4" />
                                            Add Product
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Image
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Product Name
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Brand
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Sale Price
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.data.map((product) => (
                                                <tr
                                                    key={product.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <Avatar className="size-10">
                                                            <AvatarImage
                                                                src={storageUrl(
                                                                    product.product_image,
                                                                )}
                                                                alt={
                                                                    product.product_name
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {product.product_name
                                                                    .slice(0, 2)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {product.product_name}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {product.brand
                                                            ?.brand_name ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {formatMoney(
                                                            product.sale_price,
                                                        )}
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
                                                                        product.id,
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
                                                                    handleDelete(
                                                                        product.id,
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {products.data.length > 0 &&
                                products.last_page > 1 && (
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        {products.links.map((link, i) =>
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
                        <DialogTitle>Delete product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this product? This
                            action cannot be undone.
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
