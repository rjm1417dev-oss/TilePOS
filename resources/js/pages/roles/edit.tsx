import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { PermissionsChecklist } from '@/components/permissions-checklist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { edit, index, update } from '@/routes/roles';
import type { BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    permissions: string[];
}

interface Props {
    role: Role;
    permissions: string[];
}

export default function RolesEdit({ role, permissions }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions,
    });

    const togglePermission = (name: string, checked: boolean) => {
        setData(
            'permissions',
            checked
                ? [...data.permissions, name]
                : data.permissions.filter((p) => p !== name),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url(role.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Roles', href: index.url() },
        { title: 'Edit', href: edit.url(role.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Role" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Roles
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Edit Role"
                            description={role.name}
                        />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Permissions</Label>
                                <PermissionsChecklist
                                    permissions={permissions}
                                    selected={data.permissions}
                                    onToggle={togglePermission}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Update Role
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={index.url()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
