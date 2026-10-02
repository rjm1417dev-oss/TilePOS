import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: superAdmin.dashboard.url() },
    { title: 'Tenants', href: superAdmin.tenants.index.url() },
    { title: 'Create Tenant', href: superAdmin.tenants.create.url() },
];

export default function TenantsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        business_email: '',
        business_phone: '',
        business_address: '',
        password: '',
        password_confirmation: '',
        trial_ends_at: '',
        subscription_status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(superAdmin.tenants.store.url());
    };

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Tenant" />

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

                <Card className="w-full">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Create Tenant"
                            description="Add a new business tenant"
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
                                        placeholder="Acme Tiles"
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
                                        placeholder="admin@acme.com"
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
                                        placeholder="0300-1234567"
                                    />
                                    <InputError
                                        message={errors.business_phone}
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
                                    placeholder="Full address"
                                    rows={2}
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                />
                                <InputError message={errors.business_address} />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        required
                                        autoComplete="new-password"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password *
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

                            <div className="grid gap-2">
                                <Label htmlFor="trial_ends_at">
                                    Trial Ends At
                                </Label>
                                <Input
                                    id="trial_ends_at"
                                    type="date"
                                    value={data.trial_ends_at}
                                    onChange={(e) =>
                                        setData('trial_ends_at', e.target.value)
                                    }
                                />
                                <InputError message={errors.trial_ends_at} />
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    Create Tenant
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={superAdmin.tenants.index.url()}>
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
