import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { edit, index, update } from '@/routes/suppliers';
import type { BreadcrumbItem } from '@/types';

interface Supplier {
    id: number;
    supplier_name: string;
    contact_person: string;
    cnic: string | null;
    phone: string;
    alternate_phone: string | null;
}

interface Props {
    supplier: Supplier;
}

export default function SuppliersEdit({ supplier }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        supplier_name: supplier.supplier_name,
        contact_person: supplier.contact_person,
        cnic: supplier.cnic ?? '',
        phone: supplier.phone,
        alternate_phone: supplier.alternate_phone ?? '',
        _method: 'put',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Suppliers', href: index.url() },
        {
            title: `Edit ${supplier.supplier_name}`,
            href: edit.url(supplier.id),
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update.url(supplier.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${supplier.supplier_name}`} />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Suppliers
                    </Link>
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <Heading
                            variant="small"
                            title="Edit Supplier"
                            description="Update supplier information"
                        />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="supplier_name">
                                        Supplier Name *
                                    </Label>
                                    <Input
                                        id="supplier_name"
                                        value={data.supplier_name}
                                        onChange={(e) =>
                                            setData(
                                                'supplier_name',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. ABC Tiles Co."
                                        required
                                    />
                                    <InputError
                                        message={errors.supplier_name}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="contact_person">
                                        Contact Person *
                                    </Label>
                                    <Input
                                        id="contact_person"
                                        value={data.contact_person}
                                        onChange={(e) =>
                                            setData(
                                                'contact_person',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. John Doe"
                                        required
                                    />
                                    <InputError
                                        message={errors.contact_person}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="cnic">
                                        CNIC (optional)
                                    </Label>
                                    <Input
                                        id="cnic"
                                        value={data.cnic}
                                        onChange={(e) =>
                                            setData('cnic', e.target.value)
                                        }
                                        placeholder="99999-9999999-9"
                                    />
                                    <InputError message={errors.cnic} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        placeholder="0300-1234567"
                                        required
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="alternate_phone">
                                        Alternate Phone (optional)
                                    </Label>
                                    <Input
                                        id="alternate_phone"
                                        type="tel"
                                        value={data.alternate_phone}
                                        onChange={(e) =>
                                            setData(
                                                'alternate_phone',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="042-1234567"
                                    />
                                    <InputError
                                        message={errors.alternate_phone}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    Update Supplier
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
