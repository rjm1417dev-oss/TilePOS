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
import AppLayout from '@/layouts/app-layout';
import { edit, index, update } from '@/routes/accounts-receivables';
import type { BreadcrumbItem } from '@/types';

interface Receivable {
    id: number;
    tile_id: number | null;
    tile_code_display: string | null;
    customer_name: string | null;
    customer_phone: string | null;
    total_amount: string;
    paid_amount: string;
    remaining_amount: string;
}

interface TileOption {
    id: number;
    tile_code: string | null;
    label: string;
}

interface Props {
    receivable: Receivable;
    tiles: TileOption[];
}

export default function AccountsReceivablesEdit({ receivable, tiles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tile_id: receivable.tile_id ? String(receivable.tile_id) : '',
        tile_code_display: receivable.tile_code_display ?? '',
        customer_name: receivable.customer_name ?? '',
        customer_phone: receivable.customer_phone ?? '',
        total_amount: receivable.total_amount,
        paid_amount: receivable.paid_amount,
        _method: 'put',
    });

    const remaining = Math.max(
        parseFloat(data.total_amount) - parseFloat(data.paid_amount),
        0,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accounts Receivables', href: index.url() },
        { title: 'Edit Receivable', href: edit.url(receivable.id) },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update.url(receivable.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Receivable" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Receivables
                    </Link>
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Edit Receivable"
                            description="Update receivable information"
                        />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="tile_id">
                                        Tile (optional)
                                    </Label>
                                    <Select
                                        value={data.tile_id || 'none'}
                                        onValueChange={(v) =>
                                            setData(
                                                'tile_id',
                                                v === 'none' ? '' : v,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select tile" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                No tile
                                            </SelectItem>
                                            {tiles.map((t) => (
                                                <SelectItem
                                                    key={t.id}
                                                    value={String(t.id)}
                                                >
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.tile_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tile_code_display">
                                        Tile Reference (optional)
                                    </Label>
                                    <Input
                                        id="tile_code_display"
                                        value={data.tile_code_display}
                                        onChange={(e) =>
                                            setData(
                                                'tile_code_display',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.tile_code_display}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="customer_name">
                                        Customer Name *
                                    </Label>
                                    <Input
                                        id="customer_name"
                                        value={data.customer_name}
                                        onChange={(e) =>
                                            setData(
                                                'customer_name',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.customer_name}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="customer_phone">
                                        Customer Phone
                                    </Label>
                                    <Input
                                        id="customer_phone"
                                        type="tel"
                                        value={data.customer_phone}
                                        onChange={(e) =>
                                            setData(
                                                'customer_phone',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.customer_phone}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="total_amount">
                                        Total Amount (PKR) *
                                    </Label>
                                    <Input
                                        id="total_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.total_amount}
                                        onChange={(e) =>
                                            setData(
                                                'total_amount',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError message={errors.total_amount} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="paid_amount">
                                        Paid Amount (PKR) *
                                    </Label>
                                    <Input
                                        id="paid_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.paid_amount}
                                        onChange={(e) =>
                                            setData(
                                                'paid_amount',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError message={errors.paid_amount} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Remaining Amount (PKR)</Label>
                                <p className="text-lg font-medium">
                                    {remaining.toFixed(2)}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Update Receivable
                                </Button>
                                <Button variant="outline" type="button" asChild>
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
