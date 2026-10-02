import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
import {
    calculateAmount,
    create,
    customerTiles,
    index,
    store,
} from '@/routes/tile-returns';
import type { BreadcrumbItem } from '@/types';

interface Customer {
    id: number;
    name: string;
}

interface Brand {
    id: number;
    brand_name: string;
}

interface Size {
    id: number;
    size_in_inches: string;
}

interface Tile {
    id: number;
    tile_code: string | null;
    price_per_box: string | number | null;
    no_of_tiles_per_box: number | null;
    brand?: Brand;
    size?: Size;
}

interface Props {
    customers: Customer[];
    tiles: Tile[];
    customerTileIds: number[];
    customerId?: string;
}

const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Cheque'] as const;
const PAYMENT_STATUSES = [
    { value: 'paid_by_customer', label: 'Paid by Customer' },
    { value: 'refund_to_customer', label: 'Refund to Customer' },
    { value: 'no_difference', label: 'No Difference' },
] as const;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Returns / Exchange', href: index.url() },
    { title: 'Create Tile Return', href: create.url() },
];

function getTileLabel(tile: Tile): string {
    const brand = tile.brand?.brand_name ?? '';
    const size = tile.size?.size_in_inches ?? '';
    return [
        tile.tile_code ?? 'N/A',
        brand ? ` - ${brand}` : '',
        size ? ` (${size})` : '',
    ].join('');
}

export default function TileReturnsCreate({
    customers,
    tiles,
    customerTileIds,
    customerId: initialCustomerId,
}: Props) {
    const [filteredTileIds, setFilteredTileIds] =
        useState<number[]>(customerTileIds);
    const [returnAmount, setReturnAmount] = useState(0);
    const [exchangeAmount, setExchangeAmount] = useState(0);
    const [paymentDiff, setPaymentDiff] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: initialCustomerId || '',
        type: 'return' as 'return' | 'exchange',
        return_tile_id: '',
        return_no_of_boxes: '0',
        return_no_of_tiles: '0',
        return_payment_method: 'Cash' as (typeof PAYMENT_METHODS)[number],
        return_notes: '',
        exchange_tile_id: '',
        exchange_no_of_boxes: '0',
        exchange_no_of_tiles: '0',
        payment_status: 'no_difference' as string,
        exchange_payment_method: 'Cash' as (typeof PAYMENT_METHODS)[number],
        exchange_remarks: '',
    });

    const fetchCustomerTiles = useCallback(async (cid: string) => {
        if (!cid) {
            setFilteredTileIds([]);
            return;
        }
        try {
            const url = `${customerTiles.url()}?customer_id=${encodeURIComponent(cid)}`;
            const res = await fetch(url);
            const json = await res.json();
            setFilteredTileIds(json.tile_ids ?? []);
        } catch {
            setFilteredTileIds([]);
        }
    }, []);

    useEffect(() => {
        if (data.customer_id) {
            fetchCustomerTiles(data.customer_id);
        } else {
            setFilteredTileIds([]);
        }
    }, [data.customer_id, fetchCustomerTiles]);

    useEffect(() => {
        setFilteredTileIds(customerTileIds);
    }, [customerTileIds]);

    const computeReturnAmountClientSide = useCallback(
        (tileId: string, boxes: string, loose: string): number => {
            const tile = tiles.find((t) => String(t.id) === tileId);
            if (!tile) return 0;
            const pricePerBox = parseFloat(String(tile.price_per_box ?? 0));
            const tilesPerBox = Math.max(tile.no_of_tiles_per_box ?? 1, 1);
            const pricePerTile = pricePerBox / tilesPerBox;
            const b = parseInt(boxes, 10) || 0;
            const l = parseInt(loose, 10) || 0;
            return Math.round((b * pricePerBox + l * pricePerTile) * 100) / 100;
        },
        [tiles],
    );

    const fetchReturnAmount = useCallback(
        async (cid: string, tileId: string, boxes: string, loose: string) => {
            if (!cid || !tileId) {
                setReturnAmount(0);
                return;
            }
            const fallback = computeReturnAmountClientSide(
                tileId,
                boxes,
                loose,
            );
            try {
                const res = await fetch(calculateAmount.url(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({
                        customer_id: cid,
                        return_tile_id: tileId,
                        return_no_of_boxes: parseInt(boxes, 10) || 0,
                        return_no_of_tiles: parseInt(loose, 10) || 0,
                    }),
                });
                const json = await res.json();
                const apiAmount = json.amount ?? 0;
                setReturnAmount(apiAmount > 0 ? apiAmount : fallback);
            } catch {
                setReturnAmount(fallback);
            }
        },
        [computeReturnAmountClientSide],
    );

    useEffect(() => {
        fetchReturnAmount(
            data.customer_id,
            data.return_tile_id,
            data.return_no_of_boxes,
            data.return_no_of_tiles,
        );
    }, [
        data.customer_id,
        data.return_tile_id,
        data.return_no_of_boxes,
        data.return_no_of_tiles,
        fetchReturnAmount,
    ]);

    const exchangeTileId = data.exchange_tile_id
        ? parseInt(data.exchange_tile_id, 10)
        : null;
    const exchangeTile = exchangeTileId
        ? tiles.find((t) => t.id === exchangeTileId)
        : null;

    useEffect(() => {
        if (!exchangeTile) {
            setExchangeAmount(0);
            return;
        }
        const boxes = parseInt(data.exchange_no_of_boxes, 10) || 0;
        const loose = parseInt(data.exchange_no_of_tiles, 10) || 0;
        const pricePerBox = parseFloat(String(exchangeTile.price_per_box ?? 0));
        const tilesPerBox = Math.max(exchangeTile.no_of_tiles_per_box ?? 1, 1);
        const pricePerTile = pricePerBox / tilesPerBox;
        const amt = boxes * pricePerBox + loose * pricePerTile;
        setExchangeAmount(Math.round(amt * 100) / 100);
    }, [
        data.exchange_tile_id,
        data.exchange_no_of_boxes,
        data.exchange_no_of_tiles,
        exchangeTile,
    ]);

    useEffect(() => {
        setPaymentDiff(exchangeAmount - returnAmount);
    }, [exchangeAmount, returnAmount]);

    const availableReturnTiles = tiles.filter((t) =>
        filteredTileIds.length ? filteredTileIds.includes(t.id) : true,
    );

    const handleCustomerChange = (value: string) => {
        setData({
            ...data,
            customer_id: value,
            return_tile_id: '',
            return_no_of_boxes: '0',
            return_no_of_tiles: '0',
            return_payment_method: data.return_payment_method,
            return_notes: data.return_notes,
            type: data.type,
            exchange_tile_id: '',
            exchange_no_of_boxes: '0',
            exchange_no_of_tiles: '0',
            payment_status: data.payment_status,
            exchange_payment_method: data.exchange_payment_method,
            exchange_remarks: data.exchange_remarks,
        });
    };

    const handleTypeChange = (value: string) => {
        const type = value as 'return' | 'exchange';
        setData({
            ...data,
            type,
            ...(type === 'return'
                ? {
                      exchange_tile_id: '',
                      exchange_no_of_boxes: '0',
                      exchange_no_of_tiles: '0',
                      payment_status: 'no_difference',
                      exchange_payment_method: 'Cash' as const,
                      exchange_remarks: '',
                  }
                : {}),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    const handleCreateAndAnother = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            onSuccess: () => {
                router.visit(create.url());
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Tile Return" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Returns / Exchange
                    </Link>
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Create Tile Return"
                            description="Process a customer return or exchange"
                        />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="font-medium">
                                    Return / Exchange Details
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="customer_id">
                                            Customer *
                                        </Label>
                                        <Select
                                            value={data.customer_id}
                                            onValueChange={handleCustomerChange}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((c) => (
                                                    <SelectItem
                                                        key={c.id}
                                                        value={String(c.id)}
                                                    >
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.customer_id}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Type *</Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={handleTypeChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="return">
                                                    Return
                                                </SelectItem>
                                                <SelectItem value="exchange">
                                                    Exchange
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.type} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium">Tile to Return</h3>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor="return_tile_id">
                                            Tile *
                                        </Label>
                                        <Select
                                            value={data.return_tile_id}
                                            onValueChange={(v) =>
                                                setData('return_tile_id', v)
                                            }
                                            required
                                            disabled={
                                                !data.customer_id ||
                                                availableReturnTiles.length ===
                                                    0
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableReturnTiles.map(
                                                    (t) => (
                                                        <SelectItem
                                                            key={t.id}
                                                            value={String(t.id)}
                                                        >
                                                            {getTileLabel(t)}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {!data.customer_id && (
                                            <p className="text-xs text-muted-foreground">
                                                Select customer first
                                            </p>
                                        )}
                                        {data.customer_id &&
                                            availableReturnTiles.length ===
                                                0 && (
                                                <p className="text-xs text-amber-600">
                                                    No tiles found for this
                                                    customer
                                                </p>
                                            )}
                                        <InputError
                                            message={errors.return_tile_id}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="return_no_of_boxes">
                                            No. of Boxes
                                        </Label>
                                        <Input
                                            id="return_no_of_boxes"
                                            type="number"
                                            min={0}
                                            value={data.return_no_of_boxes}
                                            onChange={(e) =>
                                                setData(
                                                    'return_no_of_boxes',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.return_no_of_boxes}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="return_no_of_tiles">
                                            Loose Tiles
                                        </Label>
                                        <Input
                                            id="return_no_of_tiles"
                                            type="number"
                                            min={0}
                                            value={data.return_no_of_tiles}
                                            onChange={(e) =>
                                                setData(
                                                    'return_no_of_tiles',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.return_no_of_tiles}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Total Amount *</Label>
                                        <Input
                                            readOnly
                                            tabIndex={-1}
                                            value={returnAmount.toFixed(2)}
                                            className="cursor-default bg-muted"
                                            aria-readonly="true"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="return_payment_method">
                                            Payment Method *
                                        </Label>
                                        <Select
                                            value={data.return_payment_method}
                                            onValueChange={(v) =>
                                                setData(
                                                    'return_payment_method',
                                                    v as (typeof PAYMENT_METHODS)[number],
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PAYMENT_METHODS.map((m) => (
                                                    <SelectItem
                                                        key={m}
                                                        value={m}
                                                    >
                                                        {m}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                errors.return_payment_method
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="return_notes">
                                        Notes (optional)
                                    </Label>
                                    <textarea
                                        id="return_notes"
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.return_notes}
                                        onChange={(e) =>
                                            setData(
                                                'return_notes',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Notes..."
                                    />
                                </div>
                            </div>

                            {data.type === 'exchange' && (
                                <div className="space-y-4">
                                    <h3 className="font-medium">
                                        Exchange Details
                                    </h3>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="exchange_tile_id">
                                                New Tile *
                                            </Label>
                                            <Select
                                                value={data.exchange_tile_id}
                                                onValueChange={(v) =>
                                                    setData(
                                                        'exchange_tile_id',
                                                        v,
                                                    )
                                                }
                                                required={
                                                    data.type === 'exchange'
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an option" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tiles.map((t) => (
                                                        <SelectItem
                                                            key={t.id}
                                                            value={String(t.id)}
                                                        >
                                                            {getTileLabel(t)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    errors.exchange_tile_id
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="exchange_no_of_boxes">
                                                No. of Boxes *
                                            </Label>
                                            <Input
                                                id="exchange_no_of_boxes"
                                                type="number"
                                                min={0}
                                                value={
                                                    data.exchange_no_of_boxes
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'exchange_no_of_boxes',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors.exchange_no_of_boxes
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="exchange_no_of_tiles">
                                                Loose Tiles *
                                            </Label>
                                            <Input
                                                id="exchange_no_of_tiles"
                                                type="number"
                                                min={0}
                                                value={
                                                    data.exchange_no_of_tiles
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'exchange_no_of_tiles',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors.exchange_no_of_tiles
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label>New Tile Total (PKR)</Label>
                                            <Input
                                                readOnly
                                                value={exchangeAmount.toFixed(
                                                    2,
                                                )}
                                                className="bg-muted"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>
                                                Payment Difference (PKR)
                                            </Label>
                                            <Input
                                                readOnly
                                                value={paymentDiff.toFixed(2)}
                                                className="bg-muted"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="payment_status">
                                                Payment Status *
                                            </Label>
                                            <Select
                                                value={data.payment_status}
                                                onValueChange={(v) =>
                                                    setData('payment_status', v)
                                                }
                                                required={
                                                    data.type === 'exchange'
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an option" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PAYMENT_STATUSES.map(
                                                        (s) => (
                                                            <SelectItem
                                                                key={s.value}
                                                                value={s.value}
                                                            >
                                                                {s.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.payment_status}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="exchange_payment_method">
                                                Payment Method *
                                            </Label>
                                            <Select
                                                value={
                                                    data.exchange_payment_method
                                                }
                                                onValueChange={(v) =>
                                                    setData(
                                                        'exchange_payment_method',
                                                        v as (typeof PAYMENT_METHODS)[number],
                                                    )
                                                }
                                                required={
                                                    data.type === 'exchange'
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PAYMENT_METHODS.map(
                                                        (m) => (
                                                            <SelectItem
                                                                key={m}
                                                                value={m}
                                                            >
                                                                {m}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    errors.exchange_payment_method
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="exchange_remarks">
                                            Remarks
                                        </Label>
                                        <textarea
                                            id="exchange_remarks"
                                            rows={3}
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.exchange_remarks}
                                            onChange={(e) =>
                                                setData(
                                                    'exchange_remarks',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Remarks..."
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    Create
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCreateAndAnother}
                                    disabled={processing}
                                >
                                    Create & create another
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
