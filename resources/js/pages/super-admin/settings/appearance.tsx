import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import SuperAdminSettingsLayout from '@/layouts/super-admin-settings-layout';
import superAdmin from '@/routes/super-admin';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: superAdmin.dashboard.url() },
    { title: 'Settings', href: superAdmin.settings.profile.url() },
    {
        title: 'Appearance',
        href: superAdmin.settings.appearance.url(),
    },
];

export default function Appearance() {
    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance Settings</h1>

            <SuperAdminSettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Appearance settings"
                        description="Update your account's appearance settings"
                    />
                    <AppearanceTabs />
                </div>
            </SuperAdminSettingsLayout>
        </SuperAdminLayout>
    );
}
