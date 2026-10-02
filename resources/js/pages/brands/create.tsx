import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { create, index, store } from '@/routes/brands';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Brands', href: index.url() },
    { title: 'Create Brand', href: create.url() },
];

export default function BrandsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        brand_name: '',
        brand_description: '',
        brand_logo: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store.url(), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Brand" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Brands
                    </Link>
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Create Brand"
                            description="Add a new product brand"
                        />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="brand_name">Brand Name *</Label>
                                <Input
                                    id="brand_name"
                                    value={data.brand_name}
                                    onChange={(e) =>
                                        setData('brand_name', e.target.value)
                                    }
                                    placeholder="e.g. Acme Tiles"
                                    required
                                />
                                <InputError message={errors.brand_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="brand_description">
                                    Description
                                </Label>
                                <textarea
                                    id="brand_description"
                                    value={data.brand_description}
                                    onChange={(e) =>
                                        setData(
                                            'brand_description',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Optional brand description"
                                    rows={3}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs md:text-sm"
                                />
                                <InputError
                                    message={errors.brand_description}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="brand_logo">Logo</Label>
                                <Input
                                    id="brand_logo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                    onChange={(e) =>
                                        setData(
                                            'brand_logo',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                                <InputError message={errors.brand_logo} />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Create Brand
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
