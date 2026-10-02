import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { edit, index, update } from '@/routes/sizes';
import type { BreadcrumbItem } from '@/types';

interface Size {
    id: number;
    size_in_inches: string;
    description: string | null;
}

interface Props {
    size: Size;
}

export default function SizesEdit({ size }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        size_in_inches: size.size_in_inches,
        description: size.description || '',
        _method: 'put',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Sizes', href: index.url() },
        {
            title: `Edit ${size.size_in_inches}`,
            href: edit.url(size.id),
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update.url(size.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${size.size_in_inches}`} />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Sizes
                    </Link>
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Edit Size"
                            description="Update size information"
                        />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="size_in_inches">
                                    Size (inches) *
                                </Label>
                                <Input
                                    id="size_in_inches"
                                    value={data.size_in_inches}
                                    onChange={(e) =>
                                        setData(
                                            'size_in_inches',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="e.g. 12x12"
                                    required
                                />
                                <InputError message={errors.size_in_inches} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Optional description"
                                    rows={3}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs md:text-sm"
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Update Size
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
