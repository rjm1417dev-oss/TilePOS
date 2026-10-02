import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import superAdmin from '@/routes/super-admin';

interface Tenant {
    id: number;
    business_name: string;
}

interface Role {
    id: number;
    name: string;
    permissions_count: number;
}

interface Props {
    tenant: Tenant;
    roles: Role[];
}

export default function TenantRolesIndex({ tenant, roles }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const breadcrumbs = [
        { title: 'Dashboard', href: superAdmin.dashboard.url() },
        { title: 'Tenants', href: superAdmin.tenants.index.url() },
        {
            title: tenant.business_name,
            href: superAdmin.tenants.show.url(tenant.id),
        },
        {
            title: 'Roles',
            href: superAdmin.tenants.roles.index.url(tenant.id),
        },
    ];

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(
                superAdmin.tenants.roles.destroy.url({
                    tenant: tenant.id,
                    role: deleteId,
                }),
                { preserveScroll: true, onSuccess: () => setDeleteId(null) },
            );
        }
    };

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Roles - ${tenant.business_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link
                        href={superAdmin.tenants.show.url(tenant.id)}
                        className="w-fit"
                    >
                        <ArrowLeft className="size-4" />
                        Back to {tenant.business_name}
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Roles
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage roles for {tenant.business_name}
                        </p>
                    </div>
                    <Button asChild>
                        <Link
                            href={superAdmin.tenants.roles.create.url(
                                tenant.id,
                            )}
                        >
                            <Plus className="size-4" />
                            Add Role
                        </Link>
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="h-10 px-4 text-left font-medium">
                                            Name
                                        </th>
                                        <th className="h-10 px-4 text-left font-medium">
                                            Permissions
                                        </th>
                                        <th className="h-10 px-4 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map((role) => (
                                        <tr
                                            key={role.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {role.name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {role.permissions_count}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={superAdmin.tenants.roles.edit.url(
                                                                {
                                                                    tenant: tenant.id,
                                                                    role: role.id,
                                                                },
                                                            )}
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() =>
                                                            setDeleteId(role.id)
                                                        }
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete role</DialogTitle>
                        <DialogDescription>
                            Users with this role will lose these permissions.
                            Continue?
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
