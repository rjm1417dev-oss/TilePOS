import { Head, useForm } from '@inertiajs/react';
import { Download, FileUp, Package, Truck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index, store, template } from '@/routes/import';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Bulk Import', href: index.url() },
];

const importTypes = [
    { value: 'customers', label: 'Customers', icon: Users },
    { value: 'suppliers', label: 'Suppliers', icon: Truck },
    { value: 'products', label: 'Products', icon: Package },
];

interface ImportResult {
    created: number;
    skipped: number;
    errors: string[];
}

interface Props {
    import_result?: ImportResult | null;
    import_error?: string | null;
}

export default function ImportIndex({ import_result, import_error }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'customers' as 'customers' | 'suppliers' | 'products',
        file: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            forceFormData: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setData('file', file ?? null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bulk Import" />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Bulk Import
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Import products, customers, or suppliers from CSV.
                        Download a template to get started.
                    </p>
                </div>

                {import_error && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                        {import_error}
                    </div>
                )}

                {import_result && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Import Result</CardTitle>
                            <CardDescription>
                                {import_result.created} record(s) imported
                                {import_result.skipped > 0 &&
                                    `, ${import_result.skipped} skipped`}
                            </CardDescription>
                        </CardHeader>
                        {import_result.errors.length > 0 && (
                            <CardContent>
                                <ul className="max-h-48 list-inside list-disc space-y-1 overflow-y-auto text-sm text-muted-foreground">
                                    {import_result.errors
                                        .slice(0, 20)
                                        .map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    {import_result.errors.length > 20 && (
                                        <li>
                                            ... and{' '}
                                            {import_result.errors.length - 20}{' '}
                                            more
                                        </li>
                                    )}
                                </ul>
                            </CardContent>
                        )}
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileUp className="size-5" />
                            Upload CSV
                        </CardTitle>
                        <CardDescription>
                            Select the entity type and upload a CSV file. First
                            row must be headers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Entity Type
                                    </label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(v) =>
                                            setData(
                                                'type',
                                                v as
                                                    | 'customers'
                                                    | 'suppliers'
                                                    | 'products',
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {importTypes.map((t) => {
                                                const Icon = t.icon;
                                                return (
                                                    <SelectItem
                                                        key={t.value}
                                                        value={t.value}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Icon className="size-4" />
                                                            {t.label}
                                                        </span>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        CSV File
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept=".csv,.txt"
                                            onChange={handleFileChange}
                                            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-2 text-sm file:mr-4 file:border-0 file:bg-transparent file:text-sm file:font-medium"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            asChild
                                        >
                                            <a
                                                href={template.url({
                                                    type: data.type,
                                                })}
                                                download
                                            >
                                                <Download className="size-4" />
                                            </a>
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Max 2MB. Download template for required
                                        columns.
                                    </p>
                                    {errors.file && (
                                        <p className="text-sm text-destructive">
                                            {errors.file}
                                        </p>
                                    )}
                                    {errors.type && (
                                        <p className="text-sm text-destructive">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={processing || !data.file}
                            >
                                {processing ? 'Importing...' : 'Import'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
