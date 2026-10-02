import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    FileText,
    KeyRound,
    Layers,
    UserCog,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import superAdmin from '@/routes/super-admin';
import type { BreadcrumbItem } from '@/types';

interface Tenant {
    id: number;
    business_name: string;
    business_email: string;
    business_phone: string | null;
    business_address: string | null;
    is_active: boolean;
    trial_ends_at: string | null;
    subscription_status: string;
    maintenance_mode: boolean;
    maintenance_message: string | null;
    created_at: string;
    quotations_count: number;
    users_count: number;
    tiles_count: number;
    customers_count: number;
}

interface TenantUser {
    id: number;
    name: string;
    email: string;
}

interface Props {
    tenant: Tenant;
    users?: TenantUser[];
}

export default function TenantsShow({ tenant, users = [] }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: superAdmin.dashboard.url() },
        { title: 'Tenants', href: superAdmin.tenants.index.url() },
        {
            title: tenant.business_name,
            href: superAdmin.tenants.show.url(tenant.id),
        },
    ];

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title={tenant.business_name} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link
                        href={superAdmin.tenants.index.url()}
                        className="w-fit"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Tenants
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {tenant.business_name}
                        </h1>
                        <p className="text-muted-foreground">
                            {tenant.business_email}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={users.length === 0}
                            onClick={() =>
                                users.length > 0 &&
                                router.post(
                                    superAdmin.tenants.impersonate.url(
                                        tenant.id,
                                    ),
                                )
                            }
                            title={
                                users.length > 0
                                    ? 'Impersonate first user'
                                    : 'No users in this tenant'
                            }
                        >
                            <UserCog className="size-4" />
                            View as Tenant
                        </Button>
                        <Button variant="outline" asChild>
                            <a
                                href={superAdmin.tenants.export.url(tenant.id)}
                                download
                            >
                                <Download className="size-4" />
                                Export Data
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link
                                href={superAdmin.tenants.roles.index.url(
                                    tenant.id,
                                )}
                            >
                                <KeyRound className="size-4" />
                                Roles
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link
                                href={superAdmin.tenants.users.index.url(
                                    tenant.id,
                                )}
                            >
                                <Users className="size-4" />
                                Users
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={superAdmin.tenants.edit.url(tenant.id)}>
                                Edit Tenant
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Quotations
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <FileText className="size-4" />
                                <span className="text-2xl font-bold">
                                    {tenant.quotations_count}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Users
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="size-4" />
                                <span className="text-2xl font-bold">
                                    {tenant.users_count}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Tiles
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Layers className="size-4" />
                                <span className="text-2xl font-bold">
                                    {tenant.tiles_count}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Customers
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">
                                    {tenant.customers_count}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {users.length > 0 && (
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Users</h2>
                            <p className="text-sm text-muted-foreground">
                                Impersonate a user to view the app as them
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between rounded-md border px-3 py-2"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.post(
                                                    superAdmin.tenants.users.impersonate.url(
                                                        {
                                                            tenant: tenant.id,
                                                            user: user.id,
                                                        },
                                                    ),
                                                )
                                            }
                                        >
                                            <UserCog className="size-4" />
                                            Impersonate
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Details</h2>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">
                                Status
                            </span>
                            <span
                                className={
                                    tenant.is_active
                                        ? 'text-green-600'
                                        : 'text-muted-foreground'
                                }
                            >
                                {tenant.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="flex justify-between border-t py-2">
                            <span className="text-muted-foreground">
                                Subscription
                            </span>
                            <span className="capitalize">
                                {tenant.subscription_status}
                            </span>
                        </div>
                        {tenant.trial_ends_at && (
                            <div className="flex justify-between border-t py-2">
                                <span className="text-muted-foreground">
                                    Trial Ends
                                </span>
                                <span>
                                    {new Date(
                                        tenant.trial_ends_at,
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {tenant.maintenance_mode && (
                            <div className="flex justify-between border-t py-2">
                                <span className="text-muted-foreground">
                                    Maintenance
                                </span>
                                <span className="text-amber-600">
                                    Enabled
                                    {tenant.maintenance_message &&
                                        `: ${tenant.maintenance_message}`}
                                </span>
                            </div>
                        )}
                        {tenant.business_phone && (
                            <div className="flex justify-between border-t py-2">
                                <span className="text-muted-foreground">
                                    Phone
                                </span>
                                <span>{tenant.business_phone}</span>
                            </div>
                        )}
                        {tenant.business_address && (
                            <div className="flex justify-between border-t py-2">
                                <span className="text-muted-foreground">
                                    Address
                                </span>
                                <span>{tenant.business_address}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
