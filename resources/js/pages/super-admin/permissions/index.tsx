import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import superAdmin from '@/routes/super-admin';

interface Permission {
    id: number;
    name: string;
}

interface Props {
    permissions: Permission[];
}

export default function PermissionsIndex({ permissions }: Props) {
    const { flash } = usePage().props as { flash?: { success?: string } };
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(superAdmin.permissions.store.url(), {
            onSuccess: () => {
                reset();
                setShowCreate(false);
            },
        });
    };

    const confirmDelete = () => {
        if (deleteId) {
            router.delete(superAdmin.permissions.destroy.url(deleteId), {
                preserveScroll: true,
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <SuperAdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: superAdmin.dashboard.url() },
                {
                    title: 'Permissions',
                    href: superAdmin.permissions.index.url(),
                },
            ]}
        >
            <Head title="Permissions" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Permissions
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage global permissions for all tenants
                        </p>
                    </div>
                    <Button onClick={() => setShowCreate(true)}>
                        <Plus className="size-4" />
                        Add Permission
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
                                        <th className="h-10 px-4 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permissions.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="px-4 py-3 font-mono text-sm">
                                                {p.name}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        setDeleteId(p.id)
                                                    }
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent>
                    <form onSubmit={handleCreate}>
                        <DialogHeader>
                            <DialogTitle>Add Permission</DialogTitle>
                            <DialogDescription>
                                Use lowercase with dots (e.g. module.action)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="e.g. reports.export"
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreate(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete permission</DialogTitle>
                        <DialogDescription>
                            This will remove the permission from all roles. This
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
        </SuperAdminLayout>
    );
}
