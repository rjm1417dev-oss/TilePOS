import { Head, router, useForm } from '@inertiajs/react';
import { Save, Mail, FileJson, FileText } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import SuperAdminSettingsLayout from '@/layouts/super-admin-settings-layout';
import superAdmin from '@/routes/super-admin';
import type { BreadcrumbItem } from '@/types';

interface Props {
    maintenance_mode: boolean;
    maintenance_message: string | null;
    force_super_admin_2fa: boolean;
    super_admin_ip_whitelist: string;
    smtp: { host: string; port: number; encryption: string; username: string };
    feature_flags: Record<string, boolean>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: superAdmin.dashboard.url() },
    { title: 'Settings', href: superAdmin.settings.profile.url() },
    { title: 'Global Settings', href: superAdmin.settings.global.url() },
];

const FEATURE_KEYS = [
    'tiles',
    'quotations',
    'tile_returns',
    'accounts_payable',
    'accounts_receivable',
] as const;

export default function SettingsGlobal(props: Props) {
    const { data, setData, put, processing } = useForm({
        maintenance_mode: props.maintenance_mode,
        maintenance_message: props.maintenance_message ?? '',
        force_super_admin_2fa: props.force_super_admin_2fa,
        super_admin_ip_whitelist: props.super_admin_ip_whitelist ?? '',
        smtp_host: props.smtp?.host ?? '',
        smtp_port: props.smtp?.port ?? '',
        smtp_encryption: props.smtp?.encryption ?? '',
        smtp_username: props.smtp?.username ?? '',
        smtp_password: '',
    });

    return (
        <SuperAdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Global Settings" />

            <h1 className="sr-only">Global Settings</h1>

            <SuperAdminSettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Global Settings"
                        description="Maintenance mode, feature flags, SMTP, security"
                    />

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            put(superAdmin.settings.update.url());
                        }}
                        className="space-y-6"
                    >
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold">
                                    Maintenance Mode
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Block non–super-admin access when enabled
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="maintenance_mode"
                                        checked={data.maintenance_mode}
                                        onCheckedChange={(v) =>
                                            setData('maintenance_mode', !!v)
                                        }
                                    />
                                    <Label htmlFor="maintenance_mode">
                                        Enable maintenance mode
                                    </Label>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="maintenance_message">
                                        Custom message
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
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold">
                                    Feature Flags
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Toggle modules on/off globally
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {FEATURE_KEYS.map((key) => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between"
                                    >
                                        <Label
                                            htmlFor={`flag-${key}`}
                                            className="font-normal capitalize"
                                        >
                                            {key.replace(/_/g, ' ')}
                                        </Label>
                                        <Checkbox
                                            id={`flag-${key}`}
                                            checked={
                                                props.feature_flags[key] ?? true
                                            }
                                            onCheckedChange={(v) => {
                                                router.put(
                                                    superAdmin.settings.featureFlags.url(),
                                                    {
                                                        flags: {
                                                            ...Object.fromEntries(
                                                                FEATURE_KEYS.map(
                                                                    (k) => [
                                                                        k,
                                                                        props
                                                                            .feature_flags[
                                                                            k
                                                                        ] ??
                                                                            true,
                                                                    ],
                                                                ),
                                                            ),
                                                            [key]: !!v,
                                                        },
                                                    },
                                                );
                                            }}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold">
                                    Security
                                </h2>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="force_2fa"
                                        checked={data.force_super_admin_2fa}
                                        onCheckedChange={(v) =>
                                            setData(
                                                'force_super_admin_2fa',
                                                !!v,
                                            )
                                        }
                                    />
                                    <Label htmlFor="force_2fa">
                                        Force 2FA for Super Admins
                                    </Label>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ip_whitelist">
                                        IP whitelist (one per line)
                                    </Label>
                                    <textarea
                                        id="ip_whitelist"
                                        value={data.super_admin_ip_whitelist}
                                        onChange={(e) =>
                                            setData(
                                                'super_admin_ip_whitelist',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="192.168.1.1&#10;10.0.0.0"
                                        rows={4}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold">
                                    SMTP / Mail
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Override default mail config
                                </p>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Host</Label>
                                    <Input
                                        value={data.smtp_host}
                                        onChange={(e) =>
                                            setData('smtp_host', e.target.value)
                                        }
                                        placeholder="smtp.mailgun.org"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Port</Label>
                                    <Input
                                        type="number"
                                        value={data.smtp_port}
                                        onChange={(e) =>
                                            setData(
                                                'smtp_port',
                                                parseInt(
                                                    e.target.value || '0',
                                                    10,
                                                ),
                                            )
                                        }
                                        placeholder="587"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Encryption</Label>
                                    <Input
                                        value={data.smtp_encryption}
                                        onChange={(e) =>
                                            setData(
                                                'smtp_encryption',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="tls"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Username</Label>
                                    <Input
                                        value={data.smtp_username}
                                        onChange={(e) =>
                                            setData(
                                                'smtp_username',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2 sm:col-span-2">
                                    <Label>
                                        Password (leave blank to keep)
                                    </Label>
                                    <Input
                                        type="password"
                                        value={data.smtp_password}
                                        onChange={(e) =>
                                            setData(
                                                'smtp_password',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.post(
                                                superAdmin.settings.testSmtp.url(),
                                            )
                                        }
                                    >
                                        <Mail className="size-4" />
                                        Test connection
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-semibold">
                                    Activity Log Export
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Export activity logs (last 90 days) as JSON
                                    or PDF
                                </p>
                            </CardHeader>
                            <CardContent className="flex gap-2">
                                <Button variant="outline" asChild>
                                    <a
                                        href={superAdmin.export.logs.url({
                                            query: { format: 'json' },
                                        })}
                                        download
                                    >
                                        <FileJson className="size-4" />
                                        Export JSON
                                    </a>
                                </Button>
                                <Button variant="outline" asChild>
                                    <a
                                        href={superAdmin.export.logs.url({
                                            query: { format: 'pdf' },
                                        })}
                                        download
                                    >
                                        <FileText className="size-4" />
                                        Export PDF
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>

                        <Button type="submit" disabled={processing}>
                            <Save className="size-4" />
                            Save settings
                        </Button>
                    </form>
                </div>
            </SuperAdminSettingsLayout>
        </SuperAdminLayout>
    );
}
