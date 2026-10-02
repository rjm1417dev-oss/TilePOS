import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { PermissionsChecklist } from '@/components/permissions-checklist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import superAdmin from '@/routes/super-admin';

interface Tenant {
    id: number;
    business_name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: string[];
}

interface Props {
    tenant: Tenant;
    role: Role;
    permissions: string[];
}

export default function TenantRolesEdit({ tenant, role, permissions }: Props) {
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
        put(
            superAdmin.tenants.roles.update.url({
                tenant: tenant.id,
                role: role.id,
            }),
        );
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: superAdmin.dashboard.url() },
        { title: 'Tenants', href: superAdmin.tenants.index.url() },
        {
            title: tenant.business_name,
            href: superAdmin.tenants.show.url(tenant.id),
        },
        { title: 'Roles', href: superAdmin.tenants.roles.index.url(tenant.id) },
        {
            title: 'Edit',
            href: superAdmin.tenants.roles.edit.url({
                tenant: tenant.id,
                role: role.id,
            }),
        },
    ];

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role - ${tenant.business_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link
                        href={superAdmin.tenants.roles.index.url(tenant.id)}
                        className="w-fit"
                    >
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
                                    <Link
                                        href={superAdmin.tenants.roles.index.url(
                                            tenant.id,
                                        )}
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
