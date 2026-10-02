import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { edit, index, update } from '@/routes/users';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    role_ids: number[];
}

interface Props {
    user: User;
    roles: Record<number, string>;
}

export default function UsersEdit({ user, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role_ids: user.role_ids,
    });

    const toggleRole = (id: number, checked: boolean) => {
        setData(
            'role_ids',
            checked
                ? [...data.role_ids, id]
                : data.role_ids.filter((r) => r !== id),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update.url(user.id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: index.url() },
        { title: 'Edit', href: edit.url(user.id) },
    ];

    const roleEntries = Object.entries(roles);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Users
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Edit User"
                            description={user.email}
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
                                />
                            </div>
                            {roleEntries.length > 0 && (
                                <div className="grid gap-2">
                                    <Label>Roles</Label>
                                    <div className="flex flex-wrap gap-4">
                                        {roleEntries.map(([idStr, name]) => (
                                            <label
                                                key={idStr}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Checkbox
                                                    checked={data.role_ids.includes(
                                                        Number(idStr),
                                                    )}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        toggleRole(
                                                            Number(idStr),
                                                            !!checked,
                                                        )
                                                    }
                                                />
                                                {name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Update User
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
