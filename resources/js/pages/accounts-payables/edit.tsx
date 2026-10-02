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
import { edit, index, update } from '@/routes/accounts-payables';
import type { BreadcrumbItem } from '@/types';

interface Payable {
    id: number;
    tile_id: number | null;
    stock_reference: string | null;
    purchased_price: string;
    paid_amount: string;
    remaining_amount: string;
}

interface TileOption {
    id: number;
    tile_code: string | null;
    label: string;
}

interface Props {
    payable: Payable;
    tiles: TileOption[];
}

export default function AccountsPayablesEdit({ payable, tiles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        tile_id: payable.tile_id ? String(payable.tile_id) : '',
        stock_reference: payable.stock_reference ?? '',
        purchased_price: payable.purchased_price,
        paid_amount: payable.paid_amount,
        _method: 'put',
    });

    const remaining = Math.max(
        parseFloat(data.purchased_price) - parseFloat(data.paid_amount),
        0,
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Accounts Payables', href: index.url() },
        { title: 'Edit Payable', href: edit.url(payable.id) },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update.url(payable.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Payable" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Payables
                    </Link>
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Edit Payable"
                            description="Update payable information"
                        />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="tile_id">Tile *</Label>
                                    <Select
                                        value={data.tile_id}
                                        onValueChange={(v) =>
                                            setData('tile_id', v)
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select tile" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                    <Label htmlFor="stock_reference">
                                        Stock Reference / Supplier *
                                    </Label>
                                    <Input
                                        id="stock_reference"
                                        value={data.stock_reference}
                                        onChange={(e) =>
                                            setData(
                                                'stock_reference',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.stock_reference}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="purchased_price">
                                        Purchased Price (PKR) *
                                    </Label>
                                    <Input
                                        id="purchased_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.purchased_price}
                                        onChange={(e) =>
                                            setData(
                                                'purchased_price',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.purchased_price}
                                    />
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
                                    Update Payable
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
