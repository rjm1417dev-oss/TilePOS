import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import superAdmin from '@/routes/super-admin';
import type { BreadcrumbItem } from '@/types';

interface Tenant {
    id: number;
    business_name: string;
    business_email: string;
    business_phone: string;
    business_address: string;
    is_active: boolean;
    trial_ends_at: string;
    subscription_status: string;
    maintenance_mode: boolean;
    maintenance_message: string;
}

interface Props {
    tenant: Tenant;
}

export default function TenantsEdit({ tenant }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        business_name: tenant.business_name,
        business_email: tenant.business_email,
        business_phone: tenant.business_phone || '',
        business_address: tenant.business_address || '',
        is_active: tenant.is_active,
        trial_ends_at: tenant.trial_ends_at || '',
        subscription_status: tenant.subscription_status,
        maintenance_mode: tenant.maintenance_mode,
        maintenance_message: tenant.maintenance_message || '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(superAdmin.tenants.update.url(tenant.id));
    };

    return (
        <SuperAdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: superAdmin.dashboard.url() },
                { title: 'Tenants', href: superAdmin.tenants.index.url() },
                {
                    title: tenant.business_name,
                    href: superAdmin.tenants.show.url(tenant.id),
                },
                {
                    title: 'Edit',
                    href: superAdmin.tenants.edit.url(tenant.id),
                },
            ]}
        >
            <Head title={`Edit ${tenant.business_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link
                        href={superAdmin.tenants.show.url(tenant.id)}
                        className="w-fit"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Tenant
                    </Link>
                </Button>

                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title={`Edit ${tenant.business_name}`}
                            description="Update tenant details"
                        />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="business_name">
                                        Business Name *
                                    </Label>
                                    <Input
                                        id="business_name"
                                        value={data.business_name}
                                        onChange={(e) =>
                                            setData(
                                                'business_name',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.business_name}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="business_email">
                                        Business Email *
                                    </Label>
                                    <Input
                                        id="business_email"
                                        type="email"
                                        value={data.business_email}
                                        onChange={(e) =>
                                            setData(
                                                'business_email',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.business_email}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="business_phone">
                                        Phone
                                    </Label>
                                    <Input
                                        id="business_phone"
                                        type="tel"
                                        value={data.business_phone}
                                        onChange={(e) =>
                                            setData(
                                                'business_phone',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.business_phone}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(v) =>
                                            setData('is_active', !!v)
                                        }
                                    />
                                    <Label htmlFor="is_active">Active</Label>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="business_address">
                                    Address
                                </Label>
                                <textarea
                                    id="business_address"
                                    value={data.business_address}
                                    onChange={(e) =>
                                        setData(
                                            'business_address',
                                            e.target.value,
                                        )
                                    }
                                    rows={2}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                />
                                <InputError message={errors.business_address} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="trial_ends_at">
                                        Trial Ends At
                                    </Label>
                                    <Input
                                        id="trial_ends_at"
                                        type="date"
                                        value={data.trial_ends_at}
                                        onChange={(e) =>
                                            setData(
                                                'trial_ends_at',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.trial_ends_at}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="subscription_status">
                                        Subscription Status
                                    </Label>
                                    <Select
                                        value={data.subscription_status}
                                        onValueChange={(v) =>
                                            setData('subscription_status', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="trial">
                                                Trial
                                            </SelectItem>
                                            <SelectItem value="cancelled">
                                                Cancelled
                                            </SelectItem>
                                            <SelectItem value="expired">
                                                Expired
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="maintenance_mode"
                                        checked={data.maintenance_mode}
                                        onCheckedChange={(v) =>
                                            setData('maintenance_mode', !!v)
                                        }
                                    />
                                    <Label htmlFor="maintenance_mode">
                                        Maintenance Mode
                                    </Label>
                                </div>
                                {data.maintenance_mode && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="maintenance_message">
                                            Maintenance Message
                                        </Label>
                                        <textarea
                                            id="maintenance_message"
                                            value={data.maintenance_message}
                                            onChange={(e) =>
                                                setData(
                                                    'maintenance_message',
                                                    e.target.value,
                                                )
                                            }
                                            rows={2}
                                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        />
                                        <InputError
                                            message={errors.maintenance_message}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        New Password (leave blank to keep)
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        autoComplete="new-password"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    Update Tenant
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link
                                        href={superAdmin.tenants.show.url(
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
