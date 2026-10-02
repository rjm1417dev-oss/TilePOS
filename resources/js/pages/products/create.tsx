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
import { create, index, store } from '@/routes/products';
import type { BreadcrumbItem } from '@/types';

interface Brand {
    id: number;
    brand_name: string;
}

interface Props {
    brands: Brand[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Products', href: index.url() },
    { title: 'Create Product', href: create.url() },
];

export default function ProductsCreate({ brands }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        product_name: '',
        brand_id: '',
        sale_price: '',
        product_image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Product" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Products
                    </Link>
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Create Product"
                            description="Add a new product to your inventory"
                        />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="product_name">
                                        Product Name *
                                    </Label>
                                    <Input
                                        id="product_name"
                                        value={data.product_name}
                                        onChange={(e) =>
                                            setData(
                                                'product_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. Cement Grout"
                                        required
                                    />
                                    <InputError message={errors.product_name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="brand_id">Brand</Label>
                                    <Select
                                        value={data.brand_id || 'none'}
                                        onValueChange={(v) =>
                                            setData(
                                                'brand_id',
                                                v === 'none' ? '' : v,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select brand (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                No brand
                                            </SelectItem>
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
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="sale_price">
                                        Sale Price (PKR) *
                                    </Label>
                                    <Input
                                        id="sale_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.sale_price}
                                        onChange={(e) =>
                                            setData(
                                                'sale_price',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                        required
                                    />
                                    <InputError message={errors.sale_price} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="product_image">
                                        Product Image
                                    </Label>
                                    <Input
                                        id="product_image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={(e) =>
                                            setData(
                                                'product_image',
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.product_image}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Create Product
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
