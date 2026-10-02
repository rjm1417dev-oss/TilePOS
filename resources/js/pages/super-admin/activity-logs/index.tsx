import { Head, router } from '@inertiajs/react';
import { Activity, Download, FilterX } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import superAdmin from '@/routes/super-admin';

interface Causer {
    id: number;
    name: string;
    email: string;
}

interface ActivityLog {
    id: number;
    description: string;
    event: string | null;
    subject_type: string | null;
    subject_id: number | null;
    causer: Causer | null;
    tenant_id: number | null;
    tenant_name: string | null;
    properties: Record<string, unknown> | null;
    created_at: string;
}

interface Filters {
    tenant_id: number | null;
    user_id: number | null;
    date_from: string | null;
    date_to: string | null;
    subject_type: string | null;
    event: string | null;
}

interface FilterOptions {
    tenants: Record<number, string>;
    users: Record<number, string>;
    subjectTypes: string[];
    events: string[];
}

interface Props {
    activityLogs: ActivityLog[];
    filters: Filters;
    filterOptions: FilterOptions;
}

function formatSubject(log: ActivityLog): string {
    if (log.subject_type && log.subject_id) {
        return `${log.subject_type}#${log.subject_id}`;
    }
    return '—';
}

export default function ActivityLogsIndex({
    activityLogs,
    filters,
    filterOptions,
}: Props) {
    const [tenantId, setTenantId] = useState(
        filters.tenant_id ? String(filters.tenant_id) : 'all',
    );
    const [userId, setUserId] = useState(
        filters.user_id ? String(filters.user_id) : 'all',
    );
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [subjectType, setSubjectType] = useState(
        filters.subject_type ?? 'all',
    );
    const [event, setEvent] = useState(filters.event ?? 'all');

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (tenantId && tenantId !== 'all') params.tenant_id = tenantId;
        if (userId && userId !== 'all') params.user_id = userId;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (subjectType && subjectType !== 'all')
            params.subject_type = subjectType;
        if (event && event !== 'all') params.event = event;
        router.get(superAdmin.activityLogs.index.url(), params, {
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setTenantId('all');
        setUserId('all');
        setDateFrom('');
        setDateTo('');
        setSubjectType('all');
        setEvent('all');
        router.get(
            superAdmin.activityLogs.index.url(),
            {},
            {
                preserveState: true,
            },
        );
    };

    const hasActiveFilters =
        tenantId !== 'all' ||
        userId !== 'all' ||
        dateFrom ||
        dateTo ||
        subjectType !== 'all' ||
        event !== 'all';

    const tenantEntries = Object.entries(filterOptions.tenants) as [
        string,
        string,
    ][];
    const userEntries = Object.entries(filterOptions.users) as [
        string,
        string,
    ][];

    return (
        <SuperAdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: superAdmin.dashboard.url() },
                {
                    title: 'Activity Logs',
                    href: superAdmin.activityLogs.index.url(),
                },
            ]}
        >
            <Head title="Activity Logs" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Activity Logs
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View system activity across tenants
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <a
                            href={superAdmin.export.logs.url()}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Download className="size-4" />
                            Export JSON
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-4">
                        <form
                            onSubmit={applyFilters}
                            className="flex flex-wrap items-end gap-2"
                        >
                            <Select
                                value={tenantId}
                                onValueChange={(v) => setTenantId(v)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All tenants" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All tenants
                                    </SelectItem>
                                    {tenantEntries.map(([id, name]) => (
                                        <SelectItem key={id} value={id}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={userId}
                                onValueChange={(v) => setUserId(v)}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All users
                                    </SelectItem>
                                    {userEntries.map(([id, label]) => (
                                        <SelectItem key={id} value={id}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">
                                    From date
                                </label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="w-[140px]"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground">
                                    To date
                                </label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-[140px]"
                                />
                            </div>
                            <Select
                                value={subjectType}
                                onValueChange={(v) => setSubjectType(v)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Subject type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All types
                                    </SelectItem>
                                    {filterOptions.subjectTypes.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={event}
                                onValueChange={(v) => setEvent(v)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Event" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All events
                                    </SelectItem>
                                    {filterOptions.events.map((ev) => (
                                        <SelectItem key={ev} value={ev}>
                                            {ev}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary">
                                Apply filters
                            </Button>
                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    <FilterX className="size-4" />
                                    Clear
                                </Button>
                            )}
                        </form>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {activityLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                                <Activity className="mb-4 size-12 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    No activity logs yet
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Activity will appear here as you use the
                                    system
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="h-10 px-4 text-left font-medium">
                                                Date
                                            </th>
                                            <th className="h-10 px-4 text-left font-medium">
                                                Tenant
                                            </th>
                                            <th className="h-10 px-4 text-left font-medium">
                                                User
                                            </th>
                                            <th className="h-10 px-4 text-left font-medium">
                                                Description
                                            </th>
                                            <th className="h-10 px-4 text-left font-medium">
                                                Subject
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activityLogs.map((log) => (
                                            <tr
                                                key={log.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                                    {log.created_at
                                                        ? new Date(
                                                              log.created_at,
                                                          ).toLocaleString()
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {log.tenant_name ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {log.causer?.email ?? '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {log.description}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatSubject(log)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </SuperAdminLayout>
    );
}
