import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import SuperAdminSettingsLayout from '@/layouts/super-admin-settings-layout';
import superAdmin from '@/routes/super-admin';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: superAdmin.dashboard.url() },
    { title: 'Settings', href: superAdmin.settings.profile.url() },
    { title: 'Profile', href: superAdmin.settings.profile.url() },
];

export default function Profile({
    mustVerifyEmail,
    status,
    profileImage,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    profileImage?: string | null;
}) {
    const { auth } = usePage().props;
    const [imagePreview, setImagePreview] = useState<string | null>(
        profileImage ?? null,
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SuperAdminSettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name, email, phone number, and address"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone number</Label>

                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.phone ?? ''}
                                        name="phone"
                                        autoComplete="tel"
                                        placeholder="Phone number"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.phone}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>

                                    <Input
                                        id="address"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.address ?? ''}
                                        name="address"
                                        autoComplete="street-address"
                                        placeholder="Address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.address}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="profile_image">
                                        Profile image
                                    </Label>

                                    {imagePreview && (
                                        <img
                                            src={imagePreview}
                                            alt="Profile image preview"
                                            className="h-24 w-24 rounded-full border object-cover"
                                        />
                                    )}

                                    <Input
                                        id="profile_image"
                                        type="file"
                                        name="profile_image"
                                        accept="image/*"
                                        className="mt-1 block w-full cursor-pointer"
                                        onChange={handleImageChange}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.profile_image}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has
                                                    been sent to your email
                                                    address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SuperAdminSettingsLayout>
        </SuperAdminLayout>
    );
}
