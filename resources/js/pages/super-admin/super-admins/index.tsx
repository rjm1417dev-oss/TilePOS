import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Shield, Trash2 } from 'lucide-react';
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

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface Props {
    users: User[];
}

export default function SuperAdminsIndex({ users }: Props) {
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string };
    };
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const breadcrumbs = [
        { title: 'Dashboard', href: superAdmin.dashboard.url() },
        { title: 'Super Admins', href: superAdmin.superAdmins.index.url() },
    ];

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(superAdmin.superAdmins.destroy.url(deleteId), {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Super Admins" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Super Admins
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage super administrator accounts with full system
                            access
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={superAdmin.superAdmins.create.url()}>
                            <Plus className="size-4" />
                            Add Super Admin
                        </Link>
                    </Button>
                </div>

                {(flash?.success || flash?.error) && (
                    <div
                        className={
                            flash?.error
                                ? 'rounded-md bg-destructive/10 p-4 text-sm text-destructive dark:bg-destructive/20'
                                : 'rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }
                    >
                        {flash?.success ?? flash?.error}
                    </div>
                )}

                <Card>
                    <CardContent className="pt-6">
                        {users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                                <Shield className="mb-4 size-12 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    No super admins yet
                                </p>
                                <p className="mb-4 text-sm text-muted-foreground">
                                    Create the first super admin account
                                </p>
                                <Button asChild>
                                    <Link
                                        href={superAdmin.superAdmins.create.url()}
                                    >
                                        <Plus className="size-4" />
                                        Add Super Admin
                                    </Link>
                                </Button>
                            </div>
                        ) : (
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
                                                Created
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
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {user.created_at
                                                        ? new Date(
                                                              user.created_at,
                                                          ).toLocaleDateString()
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={superAdmin.superAdmins.edit.url(
                                                                    user.id,
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
                                                                    user.id,
                                                                )
                                                            }
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            title="Delete"
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
                        <DialogTitle>Delete super admin</DialogTitle>
                        <DialogDescription>
                            This will permanently remove the super admin
                            account. You cannot delete your own account.
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
