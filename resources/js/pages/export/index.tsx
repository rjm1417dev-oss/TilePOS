import { Head, Link } from '@inertiajs/react';
import {
    Banknote,
    Boxes,
    FileDown,
    FileText,
    Layers,
    Package,
    Receipt,
    RotateCcw,
    Ruler,
    Tag,
    Truck,
    Users,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { download, index } from '@/routes/export';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Data Export', href: index.url() },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    products: Package,
    customers: Users,
    suppliers: Truck,
    quotations: FileText,
    tiles: Layers,
    stocks: Boxes,
    brands: Tag,
    sizes: Ruler,
    'accounts-payables': Banknote,
    'accounts-receivables': Receipt,
    'tile-returns': RotateCcw,
};

interface ExportType {
    value: string;
    label: string;
    description: string;
}

interface Props {
    exportTypes: ExportType[];
}

export default function ExportIndex({ exportTypes }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Export" />
            <div className="relative flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Data Export
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Export your data to CSV for reporting or backups. Files
                        can be opened in Excel or any spreadsheet application.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileDown className="size-5" />
                            Export to CSV
                        </CardTitle>
                        <CardDescription>
                            Select the data type to export. Each export includes
                            all records for your business.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {exportTypes.map((t) => {
                                const Icon = iconMap[t.value] ?? Package;
                                const downloadUrl = `${download.url()}?type=${encodeURIComponent(t.value)}&format=csv`;
                                return (
                                    <Link
                                        key={t.value}
                                        href={downloadUrl}
                                        className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                            <Icon className="size-5 text-primary" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium">
                                                {t.label}
                                            </p>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {t.description}
                                            </p>
                                        </div>
                                        <FileDown className="size-4 shrink-0 text-muted-foreground" />
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
