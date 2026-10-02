import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, index } from '@/routes/customers';
import type { BreadcrumbItem } from '@/types';

interface Customer {
    id: number;
    name: string;
    phone: string | null;
    cnic: string | null;
    address: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginatedCustomers {
    data: Customer[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    customers: PaginatedCustomers;
    filters: { search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: index.url() },
];

export default function CustomersIndex({ customers, filters }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [search, setSearch] = useState(filters.search || '');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string | undefined> = {};
        if (search) params.search = search;
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
            <Head title="Customers" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Customers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your customer contacts
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create.url()}>
                            <Plus className="size-4" />
                            Add Customer
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
                                placeholder="Search customers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-xs"
                            />
                            <Button type="submit" variant="secondary">
                                Search
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {customers.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                                    <Users className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-sm font-medium">
                                        No customers yet
                                    </p>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        Get started by adding your first
                                        customer
                                    </p>
                                    <Button asChild>
                                        <Link href={create.url()}>
                                            <Plus className="size-4" />
                                            Add Customer
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Name
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Phone
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    CNIC
                                                </th>
                                                <th className="h-12 px-4 text-left font-medium">
                                                    Address
                                                </th>
                                                <th className="h-12 px-4 text-right font-medium">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customers.data.map((customer) => (
                                                <tr
                                                    key={customer.id}
                                                    className="border-b transition-colors last:border-0 hover:bg-muted/50"
                                                >
                                                    <td className="px-4 py-3 font-medium">
                                                        {customer.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {customer.phone ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {customer.cnic ?? '—'}
                                                    </td>
                                                    <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                                                        {customer.address ??
                                                            '—'}
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
                                                                        customer.id,
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
                                                                        customer.id,
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

                            {customers.data.length > 0 &&
                                customers.last_page > 1 && (
                                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        {customers.links.map((link, i) =>
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
                        <DialogTitle>Delete customer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this customer? This
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
