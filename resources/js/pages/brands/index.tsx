import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index } from '@/routes/brands';
import type { BreadcrumbItem } from '@/types';

interface Brand {
    id: number;
    brand_name: string;
    brand_description: string | null;
    brand_logo: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginatedBrands {
    data: Brand[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    brands: PaginatedBrands;
    filters: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Brands',
        href: index.url(),
    },
];

function storageUrl(path: string | null): string {
    if (!path) return '';
    return `/storage/${path}`;
}

export default function BrandsIndex({ brands, filters }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            index.url(),
            { search: search || undefined },
            { preserveState: true },
        );
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
            <Head title="Brands" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Brands
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your product brands
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="size-4" />
                            Add Brand
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
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Search brands..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-sm"
                            />
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {brands.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                                    <Tag className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        No brands yet
                                    </p>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Get started by creating your first brand
                                    </p>
                                    <Button asChild>
                                        <Link href={create.url()}>
                                            <Plus className="size-4" />
                                            Add Brand
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Logo
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Brand Name
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Description
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Created
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Updated
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {brands.data.map((brand) => (
                                                <tr
                                                    key={brand.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3">
                                                        <Avatar className="size-10">
                                                            <AvatarImage
                                                                src={storageUrl(
                                                                    brand.brand_logo,
                                                                )}
                                                                alt={
                                                                    brand.brand_name
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {brand.brand_name
                                                                    .slice(0, 2)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {brand.brand_name}
                                                    </td>
                                                    <td className="max-w-xs px-4 py-3 text-muted-foreground">
                                                        <span className="line-clamp-2">
                                                            {brand.brand_description ||
                                                                '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {new Date(
                                                            brand.created_at,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {brand.updated_at
                                                            ? new Date(
                                                                  brand.updated_at,
                                                              ).toLocaleDateString()
                                                            : '—'}
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
                                                                        brand.id,
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
                                                                        brand.id,
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

                            {brands.data.length > 0 && brands.last_page > 1 && (
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {brands.links.map((link, i) =>
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
                        <DialogTitle>Delete brand</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this brand? This
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
