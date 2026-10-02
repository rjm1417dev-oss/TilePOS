import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Download, Pencil, Plus, Trash2 } from 'lucide-react';
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

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
}

interface Props {
    tenant: Tenant;
    users: User[];
}

export default function TenantUsersIndex({ tenant, users }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const breadcrumbs = [
        { title: 'Dashboard', href: superAdmin.dashboard.url() },
        { title: 'Tenants', href: superAdmin.tenants.index.url() },
        {
            title: tenant.business_name,
            href: superAdmin.tenants.show.url(tenant.id),
        },
        { title: 'Users', href: superAdmin.tenants.users.index.url(tenant.id) },
    ];

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(
                superAdmin.tenants.users.destroy.url({
                    tenant: tenant.id,
                    user: deleteId,
                }),
                { preserveScroll: true, onSuccess: () => setDeleteId(null) },
            );
        }
    };

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Users - ${tenant.business_name}`} />

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
                            Users
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage users for {tenant.business_name}
                        </p>
                    </div>
                    <Button asChild>
                        <Link
                            href={superAdmin.tenants.users.create.url(
                                tenant.id,
                            )}
                        >
                            <Plus className="size-4" />
                            Add User
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
                                            Email
                                        </th>
                                        <th className="h-10 px-4 text-left font-medium">
                                            Roles
                                        </th>
                                        <th className="h-10 px-4 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {user.name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.roles.join(', ') || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        asChild
                                                        title="Export user data (GDPR)"
                                                    >
                                                        <a
                                                            href={superAdmin.tenants.users.exportData.url(
                                                                {
                                                                    tenant: tenant.id,
                                                                    user: user.id,
                                                                },
                                                            )}
                                                            download
                                                        >
                                                            <Download className="size-4" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={superAdmin.tenants.users.edit.url(
                                                                {
                                                                    tenant: tenant.id,
                                                                    user: user.id,
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
                                                            setDeleteId(user.id)
                                                        }
                                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        title="Delete user & data (GDPR)"
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
                        <DialogTitle>Delete user & data</DialogTitle>
                        <DialogDescription>
                            This will permanently remove the user and anonymize
                            their activity logs (GDPR right to erasure).
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
