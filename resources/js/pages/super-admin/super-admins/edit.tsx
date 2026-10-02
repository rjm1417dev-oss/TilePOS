import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import superAdmin from '@/routes/super-admin';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Props {
    user: User;
}

export default function SuperAdminsEdit({ user }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(superAdmin.superAdmins.update.url(user.id));
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: superAdmin.dashboard.url() },
        { title: 'Super Admins', href: superAdmin.superAdmins.index.url() },
        { title: user.name, href: superAdmin.superAdmins.edit.url(user.id) },
    ];

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Super Admin - ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link
                        href={superAdmin.superAdmins.index.url()}
                        className="w-fit"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Super Admins
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Edit Super Admin"
                            description="Update super administrator details"
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
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Leave blank to keep current password
                                </p>
                                <InputError message={errors.password} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm New Password
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
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Update Super Admin
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link
                                        href={superAdmin.superAdmins.index.url()}
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
