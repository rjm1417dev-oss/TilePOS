import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { edit, index, update } from '@/routes/tiles';
import type { BreadcrumbItem } from '@/types';

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
    brand_id: number;
    size_id: number;
    tile_code: string | null;
    packing_m2: string | null;
    no_of_tiles_per_box: number | null;
    cost_per_m2: string | null;
    price_per_box: string | null;
    image: string | null;
}

interface Props {
    tile: Tile;
    brands: Brand[];
    sizes: Size[];
}

function storageUrl(path: string | null): string {
    if (!path) return '';
    return `/storage/${path}`;
}

export default function TilesEdit({ tile, brands, sizes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        brand_id: String(tile.brand_id),
        size_id: String(tile.size_id),
        tile_code: tile.tile_code || '',
        packing_m2: tile.packing_m2 ?? '',
        no_of_tiles_per_box: String(tile.no_of_tiles_per_box ?? ''),
        cost_per_m2: tile.cost_per_m2 ?? '',
        image: null as File | null,
        _method: 'put',
    });

    const packing = parseFloat(data.packing_m2) || 0;
    const cost = parseFloat(data.cost_per_m2) || 0;
    const pricePerBox = packing && cost ? (packing * cost).toFixed(2) : '';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tiles', href: index.url() },
        {
            title: `Edit ${tile.tile_code || 'Tile'}`,
            href: edit.url(tile.id),
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update.url(tile.id), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${tile.tile_code || 'Tile'}`} />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Tiles
                    </Link>
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Edit Tile"
                            description="Update tile information"
                        />
                        {tile.image && (
                            <div className="mt-2">
                                <p className="mb-2 text-sm text-muted-foreground">
                                    Current image:
                                </p>
                                <Avatar className="size-16">
                                    <AvatarImage
                                        src={storageUrl(tile.image)}
                                        alt={tile.tile_code || 'Tile'}
                                    />
                                    <AvatarFallback>
                                        {tile.tile_code
                                            ?.slice(0, 2)
                                            ?.toUpperCase() || 'TL'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="brand_id">Brand *</Label>
                                    <Select
                                        value={data.brand_id}
                                        onValueChange={(v) =>
                                            setData('brand_id', v)
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select brand" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands.map((b) => (
                                                <SelectItem
                                                    key={b.id}
                                                    value={String(b.id)}
                                                >
                                                    {b.brand_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.brand_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="size_id">Size *</Label>
                                    <Select
                                        value={data.size_id}
                                        onValueChange={(v) =>
                                            setData('size_id', v)
                                        }
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sizes.map((s) => (
                                                <SelectItem
                                                    key={s.id}
                                                    value={String(s.id)}
                                                >
                                                    {s.size_in_inches}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.size_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tile_code">Tile Code</Label>
                                    <Input
                                        id="tile_code"
                                        value={data.tile_code}
                                        onChange={(e) =>
                                            setData('tile_code', e.target.value)
                                        }
                                        placeholder="e.g. TC-001"
                                        maxLength={100}
                                    />
                                    <InputError message={errors.tile_code} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="packing_m2">
                                        Packing (m²)
                                    </Label>
                                    <Input
                                        id="packing_m2"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.packing_m2}
                                        onChange={(e) =>
                                            setData(
                                                'packing_m2',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.packing_m2} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="no_of_tiles_per_box">
                                        No. of Tiles per Box
                                    </Label>
                                    <Input
                                        id="no_of_tiles_per_box"
                                        type="number"
                                        min="0"
                                        value={data.no_of_tiles_per_box}
                                        onChange={(e) =>
                                            setData(
                                                'no_of_tiles_per_box',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                    />
                                    <InputError
                                        message={errors.no_of_tiles_per_box}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cost_per_m2">
                                        Cost per m² (PKR)
                                    </Label>
                                    <Input
                                        id="cost_per_m2"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.cost_per_m2}
                                        onChange={(e) =>
                                            setData(
                                                'cost_per_m2',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                    />
                                    <InputError message={errors.cost_per_m2} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="price_per_box">
                                        Price per Box (Calculated)
                                    </Label>
                                    <Input
                                        id="price_per_box"
                                        value={pricePerBox}
                                        readOnly
                                        disabled
                                        className="bg-muted"
                                        placeholder="Packing × Cost"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image">
                                    {tile.image
                                        ? 'Replace Image'
                                        : 'Tile Image'}
                                </Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={(e) =>
                                        setData(
                                            'image',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <InputError message={errors.image} />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Update Tile
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
