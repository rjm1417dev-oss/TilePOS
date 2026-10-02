import { Head, useForm } from '@inertiajs/react';
import { Save, Shield } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import SuperAdminSettingsLayout from '@/layouts/super-admin-settings-layout';
import superAdmin from '@/routes/super-admin';
import type { BreadcrumbItem } from '@/types';

interface Props {
    activity_log_retention_days: number;
    failed_login_retention_days: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: superAdmin.dashboard.url() },
    { title: 'Settings', href: superAdmin.settings.profile.url() },
    { title: 'Data & Privacy', href: superAdmin.settings.dataPrivacy.url() },
];

export default function SettingsDataPrivacy({
    activity_log_retention_days,
    failed_login_retention_days,
}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        activity_log_retention_days,
        failed_login_retention_days,
    });

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Data & Privacy" />

            <h1 className="sr-only">Data & Privacy</h1>

            <SuperAdminSettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Data Retention & Privacy"
                        description="GDPR-style retention policies and data handling"
                    />

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            put(superAdmin.settings.retention.update.url());
                        }}
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Shield className="size-5 text-muted-foreground" />
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            Retention Policy
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            How long to keep data before
                                            automatic cleanup
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="activity_log_retention_days">
                                        Activity logs retention (days)
                                    </Label>
                                    <Input
                                        id="activity_log_retention_days"
                                        type="number"
                                        min={7}
                                        max={730}
                                        value={data.activity_log_retention_days}
                                        onChange={(e) =>
                                            setData(
                                                'activity_log_retention_days',
                                                parseInt(e.target.value, 10) ||
                                                    90,
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Activity logs older than this are
                                        deleted daily (7–730 days)
                                    </p>
                                    {errors.activity_log_retention_days && (
                                        <p className="text-sm text-destructive">
                                            {errors.activity_log_retention_days}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="failed_login_retention_days">
                                        Failed login records retention (days)
                                    </Label>
                                    <Input
                                        id="failed_login_retention_days"
                                        type="number"
                                        min={7}
                                        max={365}
                                        value={data.failed_login_retention_days}
                                        onChange={(e) =>
                                            setData(
                                                'failed_login_retention_days',
                                                parseInt(e.target.value, 10) ||
                                                    30,
                                            )
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Failed login attempts older than this
                                        are deleted daily (7–365 days)
                                    </p>
                                    {errors.failed_login_retention_days && (
                                        <p className="text-sm text-destructive">
                                            {errors.failed_login_retention_days}
                                        </p>
                                    )}
                                </div>
                                <Button type="submit" disabled={processing}>
                                    <Save className="size-4" />
                                    Save retention policy
                                </Button>
                            </CardContent>
                        </Card>
                    </form>

                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">
                                User Data Tools
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                GDPR right of access and right to erasure
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>
                                <strong>Export user data:</strong> From each
                                tenant&apos;s user list, use &quot;Export
                                data&quot; to download a user&apos;s personal
                                data (profile + activity logs) as JSON.
                            </p>
                            <p>
                                <strong>Delete user data:</strong> Deleting a
                                user from a tenant removes their account and
                                anonymizes their activity log entries.
                            </p>
                            <p className="text-muted-foreground">
                                Navigate to Tenants → [Tenant] → Users to export
                                or delete user data.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </SuperAdminSettingsLayout>
        </SuperAdminLayout>
    );
}
