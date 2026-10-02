import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Building2, Eye, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { cn } from '@/lib/utils';
import superAdmin from '@/routes/super-admin';
import type { BreadcrumbItem } from '@/types';

interface Tenant {
    id: number;
    business_name: string;
    business_email: string;
    business_phone: string | null;
    is_active: boolean;
    trial_ends_at: string | null;
    subscription_status: string;
    maintenance_mode: boolean;
    quotations_count: number;
    users_count: number;
    tiles_count: number;
}

interface Props {
    tenants: Tenant[];
}

export default function TenantsIndex({ tenants }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const allSelected =
        tenants.length > 0 && selectedIds.size === tenants.length;
    const someSelected = selectedIds.size > 0;

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(tenants.map((t) => t.id)));
        }
    };

    const toggleSelect = (id: number) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const clearSelection = () => setSelectedIds(new Set());

    const bulkActivate = () => {
        router.post(
            superAdmin.tenants.bulkActivate.url(),
            {
                tenant_ids: Array.from(selectedIds),
            },
            { preserveScroll: true, onSuccess: clearSelection },
        );
    };

    const bulkDeactivate = () => {
        router.post(
            superAdmin.tenants.bulkDeactivate.url(),
            {
                tenant_ids: Array.from(selectedIds),
            },
            { preserveScroll: true, onSuccess: clearSelection },
        );
    };

    const bulkExport = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = superAdmin.tenants.bulkExport.url();
        const token = document.querySelector<HTMLMetaElement>(
            'meta[name="csrf-token"]',
        )?.content;
        if (token) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = '_token';
            input.value = token;
            form.appendChild(input);
        }
        Array.from(selectedIds).forEach((id) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'tenant_ids[]';
            input.value = String(id);
            form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        form.remove();
    };

    const toggleActive = (tenant: Tenant) => {
        router.post(
            superAdmin.tenants.toggleActive.url(tenant.id),
            {},
            { preserveScroll: true },
        );
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(superAdmin.tenants.destroy.url(deleteId), {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <SuperAdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: superAdmin.dashboard.url() },
                { title: 'Tenants', href: superAdmin.tenants.index.url() },
            ]}
        >
            <Head title="Tenants" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Tenants
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage business tenants
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={superAdmin.tenants.create.url()}>
                            <Plus className="size-4" />
                            Create Tenant
                        </Link>
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                {someSelected && (
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
                        <span className="text-sm font-medium">
                            {selectedIds.size} tenant(s) selected
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={bulkActivate}
                            >
                                Activate
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={bulkDeactivate}
                            >
                                Deactivate
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={bulkExport}
                            >
                                <Download className="size-4" />
                                Export
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSelection}
                        >
                            Clear selection
                        </Button>
                    </div>
                )}

                <Card>
                    <CardContent className="pt-6">
                        {tenants.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                                <Building2 className="mb-4 size-12 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    No tenants yet
                                </p>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Create the first tenant to get started
                                </p>
                                <Button asChild>
                                    <Link
                                        href={superAdmin.tenants.create.url()}
                                    >
                                        <Plus className="size-4" />
                                        Create Tenant
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th
                                                className="h-10 w-10 px-2"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Checkbox
                                                    checked={allSelected}
                                                    onCheckedChange={
                                                        toggleSelectAll
                                                    }
                                                    aria-label="Select all"
                                                />
                                            </th>
                                            <th className="h-10 px-4 text-left font-medium">
                                                Business
                                            </th>
                                            <th className="h-10 px-4 text-left font-medium">
                                                Email
                                            </th>
                                            <th className="h-10 px-4 text-center font-medium">
                                                Active
                                            </th>
                                            <th className="h-10 px-4 text-right font-medium">
                                                Quotations
                                            </th>
                                            <th className="h-10 px-4 text-right font-medium">
                                                Users
                                            </th>
                                            <th className="h-10 px-4 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tenants.map((tenant) => (
                                            <tr
                                                key={tenant.id}
                                                className={cn(
                                                    'cursor-pointer border-b transition-colors last:border-0 hover:bg-muted/50',
                                                    selectedIds.has(
                                                        tenant.id,
                                                    ) && 'bg-primary/5',
                                                )}
                                                onClick={() =>
                                                    router.get(
                                                        superAdmin.tenants.show.url(
                                                            tenant.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                <td
                                                    className="w-10 px-2 py-3"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Checkbox
                                                        checked={selectedIds.has(
                                                            tenant.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleSelect(
                                                                tenant.id,
                                                            )
                                                        }
                                                        aria-label={`Select ${tenant.business_name}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {tenant.business_name}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {tenant.business_email}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-center"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Checkbox
                                                        checked={
                                                            tenant.is_active
                                                        }
                                                        onCheckedChange={() =>
                                                            toggleActive(tenant)
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {tenant.quotations_count}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {tenant.users_count}
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-right"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={superAdmin.tenants.show.url(
                                                                    tenant.id,
                                                                )}
                                                            >
                                                                <Eye className="size-4" />
                                                                <span className="sr-only">
                                                                    View
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={superAdmin.tenants.edit.url(
                                                                    tenant.id,
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
                                                                    tenant.id,
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
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete tenant</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this tenant? This
                            action cannot be undone and will remove all
                            associated data.
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
        </SuperAdminLayout>
    );
}
