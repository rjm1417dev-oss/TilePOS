import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { create, index, store } from '@/routes/stocks';
import type { BreadcrumbItem } from '@/types';

interface TileOption {
    id: number;
    tile_code: string | null;
    label: string;
    price_per_box: number;
    cost_per_m2: number;
    packing_m2: number;
}

interface SupplierOption {
    id: number;
    supplier_name: string;
    label: string;
}

interface Props {
    tiles: TileOption[];
    suppliers: SupplierOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Stock', href: index.url() },
    { title: 'Add Stock', href: create.url() },
];

export default function StocksCreate({
    tiles,
    suppliers: initialSuppliers,
}: Props) {
    const [suppliers, setSuppliers] =
        useState<SupplierOption[]>(initialSuppliers);
    const [addSupplierOpen, setAddSupplierOpen] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
        supplier_name: '',
        contact_person: '',
        phone: '',
        cnic: '',
        alternate_phone: '',
    });
    const [addSupplierError, setAddSupplierError] = useState<string | null>(
        null,
    );
    const [addSupplierLoading, setAddSupplierLoading] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        tile_id: '',
        supplier_id: '',
        new_stock: '0',
        minimum_stock_level: '0',
        stock_location: '',
        purchased_price: '0',
        paid_amount: '0',
    });

    const selectedTile = data.tile_id
        ? tiles.find((t) => String(t.id) === data.tile_id)
        : null;
    const costPerBox = selectedTile
        ? selectedTile.price_per_box > 0
            ? selectedTile.price_per_box
            : selectedTile.cost_per_m2 * selectedTile.packing_m2
        : 0;
    const quantity = parseInt(data.new_stock, 10) || 0;
    const calculatedPurchasedPrice = (costPerBox * quantity).toFixed(2);

    useEffect(() => {
        setData('purchased_price', calculatedPurchasedPrice);
    }, [data.tile_id, data.new_stock]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    const handleAddSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddSupplierError(null);
        setAddSupplierLoading(true);
        try {
            const res = await fetch('/suppliers/quick-create', {
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
                body: JSON.stringify(newSupplier),
            });
            const json = await res.json();
            if (!res.ok) {
                const msg = json?.errors
                    ? Object.values(json.errors).flat().join(' ')
                    : (json?.message ?? 'Failed to create supplier');
                throw new Error(String(msg));
            }
            const created = json.supplier as {
                id: number;
                supplier_name: string;
            };
            const option: SupplierOption = {
                id: created.id,
                supplier_name: created.supplier_name,
                label: created.supplier_name,
            };
            setSuppliers((prev) =>
                [...prev, option].sort((a, b) =>
                    a.supplier_name.localeCompare(b.supplier_name),
                ),
            );
            setData('supplier_id', String(created.id));
            setNewSupplier({
                supplier_name: '',
                contact_person: '',
                phone: '',
                cnic: '',
                alternate_phone: '',
            });
            setAddSupplierOpen(false);
        } catch (err) {
            setAddSupplierError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create supplier',
            );
        } finally {
            setAddSupplierLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Stock" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Stock
                    </Link>
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Add Stock"
                            description="Record new stock received"
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
                                    <Label htmlFor="supplier_id">
                                        Supplier *
                                    </Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={
                                                data.supplier_id &&
                                                data.supplier_id !==
                                                    '__add_new__'
                                                    ? data.supplier_id
                                                    : ''
                                            }
                                            onValueChange={(v) => {
                                                if (v === '__add_new__') {
                                                    setAddSupplierOpen(true);
                                                } else {
                                                    setData('supplier_id', v);
                                                }
                                            }}
                                            required
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select supplier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {suppliers.map((s) => (
                                                    <SelectItem
                                                        key={s.id}
                                                        value={String(s.id)}
                                                    >
                                                        {s.label}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="__add_new__">
                                                    <span className="flex items-center gap-2 text-muted-foreground">
                                                        <Plus className="size-4" />
                                                        Add new supplier...
                                                    </span>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            title="Add new supplier"
                                            onClick={() => {
                                                setAddSupplierOpen(true);
                                                setData('supplier_id', '');
                                            }}
                                        >
                                            <Plus className="size-4" />
                                        </Button>
                                    </div>
                                    <InputError message={errors.supplier_id} />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="new_stock">
                                        Quantity to Add *
                                    </Label>
                                    <Input
                                        id="new_stock"
                                        type="number"
                                        min="0"
                                        value={data.new_stock}
                                        onChange={(e) =>
                                            setData('new_stock', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={errors.new_stock} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="minimum_stock_level">
                                        Minimum Stock Level *
                                    </Label>
                                    <Input
                                        id="minimum_stock_level"
                                        type="number"
                                        min="0"
                                        value={data.minimum_stock_level}
                                        onChange={(e) =>
                                            setData(
                                                'minimum_stock_level',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.minimum_stock_level}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="stock_location">
                                        Stock Location *
                                    </Label>
                                    <Input
                                        id="stock_location"
                                        value={data.stock_location}
                                        onChange={(e) =>
                                            setData(
                                                'stock_location',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. Warehouse A, Section 1"
                                        required
                                    />
                                    <InputError
                                        message={errors.stock_location}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="purchased_price">
                                        Purchased Price (Rs)
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
                                        readOnly
                                        className="bg-muted"
                                    />
                                    {/* {selectedTile && (
                                        <p className="text-xs text-muted-foreground">
                                            Auto-calculated from tile cost (Rs {(costPerBox).toFixed(2)}/box × {quantity} boxes)
                                        </p>
                                    )} */}
                                    <InputError
                                        message={errors.purchased_price}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="paid_amount">
                                        Paid Amount (Rs)
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
                                    />
                                    <InputError message={errors.paid_amount} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="remaining_amount">
                                        Remaining Amount (Rs)
                                    </Label>
                                    <Input
                                        id="remaining_amount"
                                        type="text"
                                        value={Math.max(
                                            parseFloat(data.purchased_price) -
                                                parseFloat(data.paid_amount),
                                            0,
                                        ).toFixed(2)}
                                        readOnly
                                        className="bg-muted"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Add Stock
                                </Button>
                                <Button variant="outline" type="button" asChild>
                                    <Link href={index.url()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={addSupplierOpen}
                onOpenChange={(open) => {
                    setAddSupplierOpen(open);
                    if (!open) setAddSupplierError(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add new supplier</DialogTitle>
                        <DialogDescription>
                            Create a new supplier to select in the stock form.
                            Required fields: name, contact person, phone.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSupplier} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="new_supplier_name">
                                Supplier Name *
                            </Label>
                            <Input
                                id="new_supplier_name"
                                value={newSupplier.supplier_name}
                                onChange={(e) =>
                                    setNewSupplier((s) => ({
                                        ...s,
                                        supplier_name: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new_contact_person">
                                Contact Person *
                            </Label>
                            <Input
                                id="new_contact_person"
                                value={newSupplier.contact_person}
                                onChange={(e) =>
                                    setNewSupplier((s) => ({
                                        ...s,
                                        contact_person: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new_phone">Phone *</Label>
                            <Input
                                id="new_phone"
                                type="tel"
                                value={newSupplier.phone}
                                onChange={(e) =>
                                    setNewSupplier((s) => ({
                                        ...s,
                                        phone: e.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new_cnic">CNIC (optional)</Label>
                            <Input
                                id="new_cnic"
                                value={newSupplier.cnic}
                                onChange={(e) =>
                                    setNewSupplier((s) => ({
                                        ...s,
                                        cnic: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="new_alternate_phone">
                                Alternate Phone (optional)
                            </Label>
                            <Input
                                id="new_alternate_phone"
                                type="tel"
                                value={newSupplier.alternate_phone}
                                onChange={(e) =>
                                    setNewSupplier((s) => ({
                                        ...s,
                                        alternate_phone: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        {addSupplierError && (
                            <p className="text-sm text-destructive">
                                {addSupplierError}
                            </p>
                        )}
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddSupplierOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addSupplierLoading}>
                                {addSupplierLoading
                                    ? 'Creating...'
                                    : 'Create supplier'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
