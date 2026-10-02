import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calculator,
    FileText,
    Layers,
    Package,
    Pencil,
    Receipt,
    ShoppingCart,
    Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
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
import { create, index, store } from '@/routes/quotations';
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
    tile_code: string | null;
    price_per_box: string | null;
    no_of_tiles_per_box: number | null;
    image: string | null;
    brand: Brand;
    size: Size;
    available_boxes?: number;
}

interface Product {
    id: number;
    product_name: string;
    sale_price: string | null;
    product_image: string | null;
    brand: Brand | null;
}

interface Customer {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
}

interface CalculationResult {
    tile: Tile;
    floor_area: number;
    wall_area: number;
    total_area_sqft: number;
    total_area_m2: number;
    tile_area_sqft: number;
    tiles_needed: number;
    wastage_percentage: number;
    wastage_tiles: number;
    total_tiles_with_wastage: number;
    boxes_required: number;
    tiles_per_box: number;
    price_per_box: number;
    total_cost: number;
    cost_per_sqft: number;
}

interface CartItem {
    id: string;
    item_type: 'tile' | 'product';
    tile_id?: number;
    product_id?: number;
    item_name: string;
    image: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    boxes_required?: number;
    loose_tiles?: number;
    room_type?: string;
    surface_type?: string;
    total_area?: number;
}

interface Props {
    tiles: Tile[];
    products: Product[];
    customers: Customer[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Order/Quotation', href: index.url() },
    { title: 'New Order / Quotation', href: create.url() },
];

const ROOM_TYPES = [
    'BedRoom',
    'LivingRoom',
    'Kitchen',
    'Bathroom',
    'Others',
] as const;
const SURFACE_TYPES = ['Floor Only', 'Walls Only', 'Floor + Walls'] as const;
const UNITS = [
    { value: 'ft', label: 'Feet (ft)' },
    { value: 'm', label: 'Meter (m)' },
    { value: 'in', label: 'Inches (In)' },
] as const;
const WASTAGE_OPTIONS = [
    { value: 5, label: '5% - Professional Installation' },
    { value: 10, label: '10% - Standard' },
    { value: 15, label: '15% - DIY' },
] as const;

function formatMoney(value: number): string {
    return (
        'Rs ' +
        new Intl.NumberFormat('en-PK', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    );
}

function convertToFeet(value: number, unit: string): number {
    switch (unit?.toLowerCase()) {
        case 'm':
        case 'meters':
            return value * 3.28084;
        case 'in':
        case 'inches':
            return value / 12;
        default:
            return value;
    }
}

function convertTileToSquareFeet(
    sizeString: string,
    unit: 'inches' | 'feet' = 'inches',
): number {
    if (!sizeString) return 0;
    const parts = sizeString.toLowerCase().split('x').map(Number);
    const length = parts[0] || 0;
    const width = parts[1] || 0;
    return unit === 'inches' ? (length / 12) * (width / 12) : length * width;
}

export default function OrderQuotationCreate({
    tiles,
    products,
    customers,
}: Props) {
    const { errors: pageErrors } = usePage().props as {
        errors?: Record<string, string>;
    };
    const [activeTab, setActiveTab] = useState<'tiles' | 'products'>('tiles');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [processing, setProcessing] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState<
        'quotation' | 'invoice' | null
    >(null);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    // Tile form
    const [roomType, setRoomType] = useState<string>('BedRoom');
    const [surfaceType, setSurfaceType] = useState<string>('Floor + Walls');
    const [length, setLength] = useState<string>('');
    const [width, setWidth] = useState<string>('');
    const [height, setHeight] = useState<string>('0');
    const [unit, setUnit] = useState<string>('ft');
    const [selectedTileId, setSelectedTileId] = useState<string>('');
    const [wastagePercentage, setWastagePercentage] = useState<number>(5);
    const [calculationResults, setCalculationResults] =
        useState<CalculationResult | null>(null);
    const [calcError, setCalcError] = useState<string | null>(null);

    // Product form
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [productQty, setProductQty] = useState<number>(1);
    const [productPrice, setProductPrice] = useState<number>(0);

    // Customer modal
    const [customerId, setCustomerId] = useState<string>('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerCnic, setCustomerCnic] = useState('');
    const [discountPct, setDiscountPct] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [notes, setNotes] = useState('');

    const selectedTile = tiles.find((t) => t.id === parseInt(selectedTileId));
    const selectedProduct = products.find(
        (p) => p.id === parseInt(selectedProductId),
    );

    const productSubtotal = useMemo(
        () =>
            selectedProductId && productQty > 0 ? productQty * productPrice : 0,
        [selectedProductId, productQty, productPrice],
    );

    const tilesSubtotal = useMemo(
        () =>
            cart
                .filter((i) => i.item_type === 'tile')
                .reduce((s, i) => s + i.subtotal, 0),
        [cart],
    );
    const productsSubtotal = useMemo(
        () =>
            cart
                .filter((i) => i.item_type === 'product')
                .reduce((s, i) => s + i.subtotal, 0),
        [cart],
    );
    const subtotal = tilesSubtotal + productsSubtotal;
    const discountAmt = subtotal * (discountPct / 100);
    const grandTotal = subtotal - discountAmt;
    const remainingAmount = grandTotal - paidAmount;

    const roomsCount = useMemo(
        () =>
            new Set(
                cart
                    .filter((i) => i.item_type === 'tile')
                    .map((i) => i.room_type),
            ).size,
        [cart],
    );
    const tileItemsCount = cart.filter((i) => i.item_type === 'tile').length;
    const productItemsCount = cart.filter(
        (i) => i.item_type === 'product',
    ).length;

    const resetTileForm = () => {
        setRoomType('BedRoom');
        setSurfaceType('Floor + Walls');
        setLength('');
        setWidth('');
        setHeight('0');
        setUnit('ft');
        setSelectedTileId('');
        setWastagePercentage(5);
        setCalculationResults(null);
        setCalcError(null);
    };

    const resetProductForm = () => {
        setSelectedProductId('');
        setProductQty(1);
        setProductPrice(0);
    };

    const calculate = () => {
        setCalcError(null);
        if (!selectedTile || !length || !width) {
            setCalcError('Please fill in all required fields.');
            return;
        }
        const len = parseFloat(length);
        const wid = parseFloat(width);
        const h = parseFloat(height || '0');
        if (isNaN(len) || isNaN(wid) || len <= 0 || wid <= 0) {
            setCalcError('Please enter valid length and width.');
            return;
        }

        const lengthFt = convertToFeet(len, unit);
        const widthFt = convertToFeet(wid, unit);
        const heightFt = convertToFeet(h, unit);

        const floorArea = lengthFt * widthFt;
        const wallArea =
            heightFt > 0
                ? 2 * (lengthFt * heightFt) + 2 * (widthFt * heightFt)
                : 0;

        let totalArea: number;
        switch (surfaceType) {
            case 'Floor Only':
                totalArea = floorArea;
                break;
            case 'Walls Only':
                totalArea = wallArea;
                break;
            default:
                totalArea = floorArea + wallArea;
        }

        const sizeStr = selectedTile.size?.size_in_inches ?? '';
        const tileAreaSqFt = convertTileToSquareFeet(sizeStr, 'inches');
        if (tileAreaSqFt <= 0) {
            setCalcError('Invalid tile size. Please check tile configuration.');
            return;
        }

        const tilesNeeded = totalArea / tileAreaSqFt;
        const wastageAmount = (tilesNeeded * wastagePercentage) / 100;
        const tilesWithWastage = tilesNeeded + wastageAmount;
        const tilesPerBox = selectedTile.no_of_tiles_per_box ?? 1;
        const pricePerBox = parseFloat(selectedTile.price_per_box || '0');
        const boxesRequired = Math.ceil(tilesWithWastage / tilesPerBox);
        const totalCost = boxesRequired * pricePerBox;
        const costPerSqFt = totalArea > 0 ? totalCost / totalArea : 0;
        const totalAreaM2 = totalArea / 10.764;

        setCalculationResults({
            tile: selectedTile,
            floor_area: Math.round(floorArea * 100) / 100,
            wall_area: Math.round(wallArea * 100) / 100,
            total_area_sqft: Math.round(totalArea * 100) / 100,
            total_area_m2: Math.round(totalAreaM2 * 100) / 100,
            tile_area_sqft: Math.round(tileAreaSqFt * 10000) / 10000,
            tiles_needed: Math.round(tilesNeeded * 100) / 100,
            wastage_percentage: wastagePercentage,
            wastage_tiles: Math.round(wastageAmount * 100) / 100,
            total_tiles_with_wastage: Math.round(tilesWithWastage * 100) / 100,
            boxes_required: boxesRequired,
            tiles_per_box: tilesPerBox,
            price_per_box: pricePerBox,
            total_cost: Math.round(totalCost * 100) / 100,
            cost_per_sqft: Math.round(costPerSqFt * 100) / 100,
        });
    };

    const addTileToCart = () => {
        if (!calculationResults) return;
        const r = calculationResults;
        const available = selectedTile?.available_boxes ?? null;
        if (available !== null && r.boxes_required > available) {
            setCalcError(
                `Insufficient stock. Required: ${r.boxes_required} boxes. Available: ${available} boxes.`,
            );
            return;
        }
        const name =
            (r.tile.tile_code || 'N/A') +
            (r.tile.brand ? ' - ' + r.tile.brand.brand_name : '') +
            (r.tile.size ? ' (' + r.tile.size.size_in_inches + ')' : '');

        const item: CartItem = {
            id: editingItemId || `tile_${Date.now()}_${Math.random()}`,
            item_type: 'tile',
            tile_id: r.tile.id,
            item_name: name,
            image: r.tile.image,
            quantity: r.boxes_required,
            unit_price: r.price_per_box,
            subtotal: r.total_cost,
            boxes_required: r.boxes_required,
            loose_tiles: Math.floor(
                r.total_tiles_with_wastage % r.tiles_per_box,
            ),
            room_type: roomType,
            surface_type: surfaceType,
            total_area: r.total_area_sqft,
        };

        if (editingItemId) {
            setCart((c) => c.map((i) => (i.id === editingItemId ? item : i)));
            setEditingItemId(null);
        } else {
            setCart((c) => [...c, item]);
        }
        resetTileForm();
    };

    const addProductToCart = () => {
        if (!selectedProduct || productQty <= 0) return;
        const price =
            productPrice || parseFloat(selectedProduct.sale_price || '0');
        const subtotalVal = productQty * price;
        const name =
            selectedProduct.product_name +
            (selectedProduct.brand
                ? ' - ' + selectedProduct.brand.brand_name
                : '');

        const item: CartItem = {
            id: editingItemId || `product_${Date.now()}_${Math.random()}`,
            item_type: 'product',
            product_id: selectedProduct.id,
            item_name: name,
            image: selectedProduct.product_image,
            quantity: productQty,
            unit_price: price,
            subtotal: subtotalVal,
        };

        if (editingItemId) {
            setCart((c) => c.map((i) => (i.id === editingItemId ? item : i)));
            setEditingItemId(null);
        } else {
            setCart((c) => [...c, item]);
        }
        resetProductForm();
    };

    const removeFromCart = (id: string) => {
        setCart((c) => c.filter((i) => i.id !== id));
    };

    const editCartItem = (item: CartItem) => {
        setEditingItemId(item.id);
        if (item.item_type === 'tile') {
            setRoomType(item.room_type ?? 'BedRoom');
            setSurfaceType(item.surface_type ?? 'Floor + Walls');
            setSelectedTileId(String(item.tile_id ?? ''));
            setActiveTab('tiles');
        } else {
            setSelectedProductId(String(item.product_id ?? ''));
            setProductQty(item.quantity);
            setProductPrice(item.unit_price);
            setActiveTab('products');
        }
    };

    const openGenerateModal = (type: 'quotation' | 'invoice') => {
        setShowGenerateModal(type);
        const cust = customerId
            ? customers.find((c) => c.id === parseInt(customerId))
            : null;
        if (cust) {
            setCustomerName(cust.name);
            setCustomerPhone(cust.phone || '');
            setCustomerAddress(cust.address || '');
        }
    };

    const handleGenerate = () => {
        if (cart.length === 0 || !showGenerateModal) return;
        const cust = customerId
            ? customers.find((c) => c.id === parseInt(customerId))
            : null;

        setProcessing(true);
        router.post(
            store.url(),
            {
                type: showGenerateModal,
                customer_id: cust ? cust.id : null,
                customer_name: customerName || (cust?.name ?? ''),
                customer_phone: customerPhone || (cust?.phone ?? ''),
                customer_address: customerAddress || (cust?.address ?? ''),
                customer_cnic: customerCnic,
                discount_percentage: discountPct,
                discount_amount: 0,
                tax_percentage: 0,
                paid_amount: showGenerateModal === 'invoice' ? paidAmount : 0,
                notes: notes,
                items: cart.map((i) => ({
                    item_type: i.item_type,
                    tile_id: i.tile_id,
                    product_id: i.product_id,
                    item_name: i.item_name,
                    quantity: i.quantity,
                    unit_price: i.unit_price,
                    subtotal: i.subtotal,
                    boxes_required: i.boxes_required,
                    loose_tiles: i.loose_tiles ?? 0,
                    room_type: i.room_type,
                    surface_type: i.surface_type,
                    total_area: i.total_area,
                })),
            },
            {
                onFinish: () => setProcessing(false),
            },
        );
    };

    const imageUrl = (path: string | null) => (path ? `/storage/${path}` : '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New Order / Quotation" />

            <div className="relative flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={index.url()} className="w-fit">
                        <ArrowLeft className="size-4" />
                        Back to Order/Quotation
                    </Link>
                </Button>

                <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
                    <div className="flex flex-col gap-4">
                        {/* Tabs */}
                        <Card className="w-full overflow-hidden">
                            <CardHeader>
                                <Heading
                                    variant="small"
                                    title="New Order / Quotation"
                                    description="Add tiles or products and generate your quote"
                                />
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="flex gap-1 border-b bg-muted/30 px-4 pt-2">
                                    <button
                                        type="button"
                                        className={`flex items-center gap-2 rounded-t-lg border px-5 py-3 font-medium transition-colors ${
                                            activeTab === 'tiles'
                                                ? 'border-b-transparent bg-background text-foreground'
                                                : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                                        }`}
                                        onClick={() => setActiveTab('tiles')}
                                    >
                                        <Layers className="size-4 shrink-0" />
                                        Tiles
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex items-center gap-2 rounded-t-lg border px-5 py-3 font-medium transition-colors ${
                                            activeTab === 'products'
                                                ? 'border-b-transparent bg-background text-foreground'
                                                : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                                        }`}
                                        onClick={() => setActiveTab('products')}
                                    >
                                        <Package className="size-4 shrink-0" />
                                        Additional Items
                                    </button>
                                </div>

                                <div className="p-6">
                                    {activeTab === 'tiles' && (
                                        <div className="space-y-8">
                                            {/* Room Information */}
                                            <div>
                                                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Room Information
                                                </h3>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <Label>Room Type</Label>
                                                        <Select
                                                            value={roomType}
                                                            onValueChange={
                                                                setRoomType
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {ROOM_TYPES.map(
                                                                    (r) => (
                                                                        <SelectItem
                                                                            key={
                                                                                r
                                                                            }
                                                                            value={
                                                                                r
                                                                            }
                                                                        >
                                                                            {r}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>
                                                            Surface Type
                                                        </Label>
                                                        <Select
                                                            value={surfaceType}
                                                            onValueChange={
                                                                setSurfaceType
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {SURFACE_TYPES.map(
                                                                    (s) => (
                                                                        <SelectItem
                                                                            key={
                                                                                s
                                                                            }
                                                                            value={
                                                                                s
                                                                            }
                                                                        >
                                                                            {s}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Room Dimensions */}
                                            <div>
                                                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Room Dimensions
                                                </h3>
                                                <div className="grid gap-4 sm:grid-cols-4">
                                                    <div>
                                                        <Label>Length *</Label>
                                                        <Input
                                                            type="number"
                                                            step={0.01}
                                                            value={length}
                                                            onChange={(e) =>
                                                                setLength(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Width *</Label>
                                                        <Input
                                                            type="number"
                                                            step={0.01}
                                                            value={width}
                                                            onChange={(e) =>
                                                                setWidth(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>
                                                            Height (For Walls)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            step={0.01}
                                                            value={height}
                                                            onChange={(e) =>
                                                                setHeight(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="0"
                                                            disabled={
                                                                surfaceType !==
                                                                    'Walls Only' &&
                                                                surfaceType !==
                                                                    'Floor + Walls'
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Unit *</Label>
                                                        <Select
                                                            value={unit}
                                                            onValueChange={
                                                                setUnit
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {UNITS.map(
                                                                    (u) => (
                                                                        <SelectItem
                                                                            key={
                                                                                u.value
                                                                            }
                                                                            value={
                                                                                u.value
                                                                            }
                                                                        >
                                                                            {
                                                                                u.label
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tile Selection */}
                                            <div>
                                                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                                    Tile Selection
                                                </h3>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <Label>
                                                            Select Tile *
                                                        </Label>
                                                        <Select
                                                            value={
                                                                selectedTileId
                                                            }
                                                            onValueChange={(
                                                                id,
                                                            ) => {
                                                                setSelectedTileId(
                                                                    id,
                                                                );
                                                                setCalculationResults(
                                                                    null,
                                                                );
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select an option" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {tiles.map(
                                                                    (t) => (
                                                                        <SelectItem
                                                                            key={
                                                                                t.id
                                                                            }
                                                                            value={String(
                                                                                t.id,
                                                                            )}
                                                                        >
                                                                            {t.tile_code ||
                                                                                'N/A'}{' '}
                                                                            -{' '}
                                                                            {
                                                                                t
                                                                                    .brand
                                                                                    ?.brand_name
                                                                            }{' '}
                                                                            (
                                                                            {
                                                                                t
                                                                                    .size
                                                                                    ?.size_in_inches
                                                                            }
                                                                            )
                                                                            {t.available_boxes !=
                                                                                null &&
                                                                                ` · ${t.available_boxes} in stock`}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        {selectedTile &&
                                                            selectedTile.available_boxes !=
                                                                null && (
                                                                <p className="mt-1.5 text-xs text-muted-foreground">
                                                                    Available:{' '}
                                                                    {
                                                                        selectedTile.available_boxes
                                                                    }{' '}
                                                                    boxes
                                                                </p>
                                                            )}
                                                    </div>
                                                    <div>
                                                        <Label>
                                                            % Wastage Percentage
                                                            *
                                                        </Label>
                                                        <Select
                                                            value={String(
                                                                wastagePercentage,
                                                            )}
                                                            onValueChange={(
                                                                v,
                                                            ) =>
                                                                setWastagePercentage(
                                                                    parseInt(v),
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {WASTAGE_OPTIONS.map(
                                                                    (w) => (
                                                                        <SelectItem
                                                                            key={
                                                                                w.value
                                                                            }
                                                                            value={String(
                                                                                w.value,
                                                                            )}
                                                                        >
                                                                            {
                                                                                w.label
                                                                            }
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>

                                            {calculationResults && (
                                                <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
                                                    <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                                        Calculation Results
                                                    </h3>
                                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                        <div className="rounded-lg border bg-background/80 p-4 shadow-sm transition-shadow hover:shadow-md">
                                                            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                                Total Area
                                                            </p>
                                                            <p className="mt-2 text-xl font-bold tabular-nums">
                                                                {
                                                                    calculationResults.total_area_sqft
                                                                }{' '}
                                                                sq.ft
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {
                                                                    calculationResults.total_area_m2
                                                                }{' '}
                                                                m²
                                                            </p>
                                                        </div>
                                                        <div className="rounded-lg border bg-background/80 p-4 shadow-sm transition-shadow hover:shadow-md">
                                                            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                                Tiles Needed
                                                            </p>
                                                            <p className="mt-2 text-xl font-bold tabular-nums">
                                                                {
                                                                    calculationResults.tiles_needed
                                                                }
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                +
                                                                {
                                                                    calculationResults.wastage_percentage
                                                                }
                                                                % wastage ={' '}
                                                                {
                                                                    calculationResults.total_tiles_with_wastage
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="rounded-lg border bg-background/80 p-4 shadow-sm transition-shadow hover:shadow-md">
                                                            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                                Boxes Required
                                                            </p>
                                                            <p className="mt-2 text-xl font-bold tabular-nums">
                                                                {
                                                                    calculationResults.boxes_required
                                                                }
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                                {
                                                                    calculationResults.tiles_per_box
                                                                }{' '}
                                                                tiles/box
                                                            </p>
                                                            {selectedTile?.available_boxes !=
                                                                null && (
                                                                <p
                                                                    className={`mt-1 text-xs font-medium ${calculationResults.boxes_required > selectedTile.available_boxes ? 'text-destructive' : 'text-muted-foreground'}`}
                                                                >
                                                                    In stock:{' '}
                                                                    {
                                                                        selectedTile.available_boxes
                                                                    }{' '}
                                                                    boxes
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                                                            <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                                                                Total Cost
                                                            </p>
                                                            <p className="mt-2 text-2xl font-bold text-primary tabular-nums">
                                                                {formatMoney(
                                                                    calculationResults.total_cost,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {calcError && (
                                                <p className="text-sm text-destructive">
                                                    {calcError}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-3 border-t pt-6">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={resetTileForm}
                                                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                                                >
                                                    Reset
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={calculate}
                                                >
                                                    <Calculator className="size-4" />
                                                    Calculate
                                                </Button>
                                                <Button
                                                    type="button"
                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                    onClick={addTileToCart}
                                                    disabled={
                                                        !calculationResults
                                                    }
                                                >
                                                    <ShoppingCart className="size-4" />
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'products' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                                    <Package className="size-4" />
                                                    Product Information
                                                </h3>
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <Label>
                                                            Select Product *
                                                        </Label>
                                                        <Select
                                                            value={
                                                                selectedProductId
                                                            }
                                                            onValueChange={(
                                                                id,
                                                            ) => {
                                                                setSelectedProductId(
                                                                    id,
                                                                );
                                                                const p =
                                                                    products.find(
                                                                        (x) =>
                                                                            x.id ===
                                                                            parseInt(
                                                                                id,
                                                                            ),
                                                                    );
                                                                if (p)
                                                                    setProductPrice(
                                                                        parseFloat(
                                                                            p.sale_price ||
                                                                                '0',
                                                                        ),
                                                                    );
                                                            }}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select an option" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {products.map(
                                                                    (p) => (
                                                                        <SelectItem
                                                                            key={
                                                                                p.id
                                                                            }
                                                                            value={String(
                                                                                p.id,
                                                                            )}
                                                                        >
                                                                            {
                                                                                p.product_name
                                                                            }{' '}
                                                                            {p.brand
                                                                                ? `- ${p.brand.brand_name}`
                                                                                : ''}
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>
                                                            Quantity *
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min={0.01}
                                                            step={0.01}
                                                            value={productQty}
                                                            onChange={(e) =>
                                                                setProductQty(
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>
                                                            Unit Price (Rs)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            step={0.01}
                                                            value={productPrice}
                                                            onChange={(e) =>
                                                                setProductPrice(
                                                                    parseFloat(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>
                                                            Subtotal (Rs)
                                                        </Label>
                                                        <div className="flex h-9 w-full items-center rounded-md border bg-muted/50 px-3 py-1 font-semibold">
                                                            {formatMoney(
                                                                productSubtotal,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 border-t pt-6">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={resetProductForm}
                                                >
                                                    New Item
                                                </Button>
                                                <Button
                                                    type="button"
                                                    className="bg-emerald-600 hover:bg-emerald-700"
                                                    onClick={addProductToCart}
                                                    disabled={
                                                        !selectedProduct ||
                                                        productQty <= 0
                                                    }
                                                >
                                                    <ShoppingCart className="size-4" />
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items in Quote */}
                        <Card className="w-full overflow-hidden">
                            <CardContent className="p-6">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                    <ShoppingCart className="size-5 text-primary" />
                                    Items in Quote
                                    {cart.length > 0 && (
                                        <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                            {cart.length} item
                                            {cart.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </h3>
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 py-16 text-center">
                                        <div className="rounded-lg bg-muted/50 p-6">
                                            <ShoppingCart className="size-16 text-muted-foreground/50" />
                                        </div>
                                        <p className="mt-6 text-lg font-semibold">
                                            Your cart is empty
                                        </p>
                                        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                            Add tiles from the Tiles tab or
                                            products from Additional Items to
                                            build your quote
                                        </p>
                                        <div className="mt-6 flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setActiveTab('tiles')
                                                }
                                            >
                                                <Layers className="size-4" />
                                                Add Tiles
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setActiveTab('products')
                                                }
                                            >
                                                <Package className="size-4" />
                                                Add Products
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-xl border shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="h-12 w-16 px-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Image
                                                    </th>
                                                    <th className="h-12 px-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Item Name
                                                    </th>
                                                    <th className="h-12 px-4 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Quantity
                                                    </th>
                                                    <th className="h-12 px-4 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Subtotal
                                                    </th>
                                                    <th className="h-12 w-28 px-4 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cart.map((item, idx) => (
                                                    <tr
                                                        key={item.id}
                                                        className={`border-b transition-colors last:border-0 ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'} hover:bg-muted/40`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            {item.image ? (
                                                                <img
                                                                    src={imageUrl(
                                                                        item.image,
                                                                    )}
                                                                    alt=""
                                                                    className="size-12 rounded-lg object-cover ring-1 ring-border/50"
                                                                />
                                                            ) : (
                                                                <div className="flex size-12 items-center justify-center rounded-lg bg-muted/80 text-xs font-medium text-muted-foreground">
                                                                    —
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium">
                                                            {item.item_name}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {item.item_type ===
                                                            'tile'
                                                                ? `${item.boxes_required ?? 0} box${(item.boxes_required ?? 0) !== 1 ? 'es' : ''}${
                                                                      (item.loose_tiles ??
                                                                          0) > 0
                                                                          ? `, ${item.loose_tiles} loose tile${item.loose_tiles !== 1 ? 's' : ''}`
                                                                          : ''
                                                                  }`
                                                                : `${item.quantity} unit${item.quantity !== 1 ? 's' : ''}`}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-semibold">
                                                            {formatMoney(
                                                                item.subtotal,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        editCartItem(
                                                                            item,
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil className="size-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:text-destructive"
                                                                    onClick={() =>
                                                                        removeFromCart(
                                                                            item.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quote Summary */}
                    <Card className="h-fit w-full overflow-hidden lg:sticky lg:top-6">
                        <CardContent className="p-0">
                            <div className="border-b px-6 py-4">
                                <h3 className="text-base font-medium">
                                    Quote Summary
                                </h3>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Review totals before generating
                                </p>
                                {pageErrors?.items && (
                                    <p className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                        {Array.isArray(pageErrors.items)
                                            ? pageErrors.items[0]
                                            : pageErrors.items}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1 p-6">
                                <div className="flex justify-between py-3 text-sm">
                                    <span className="text-muted-foreground">
                                        Tiles Subtotal
                                    </span>
                                    <span className="font-medium tabular-nums">
                                        {formatMoney(tilesSubtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between py-3 text-sm">
                                    <span className="text-muted-foreground">
                                        Products Subtotal
                                    </span>
                                    <span className="font-medium tabular-nums">
                                        {formatMoney(productsSubtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t py-3 text-sm">
                                    <span className="font-medium text-foreground">
                                        Subtotal
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {formatMoney(subtotal)}
                                    </span>
                                </div>
                                {discountPct > 0 && (
                                    <div className="flex justify-between py-2 text-sm text-emerald-600 dark:text-emerald-400">
                                        <span>Discount ({discountPct}%)</span>
                                        <span className="font-medium tabular-nums">
                                            −{formatMoney(discountAmt)}
                                        </span>
                                    </div>
                                )}
                                <div className="mt-6 flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3">
                                    <span className="text-base font-bold">
                                        Grand Total
                                    </span>
                                    <span className="text-2xl font-bold text-primary tabular-nums">
                                        {formatMoney(grandTotal)}
                                    </span>
                                </div>
                            </div>
                            {cart.length > 0 && (
                                <div className="border-t px-6 py-4 text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground/80">
                                        This quote includes
                                    </p>
                                    <ul className="mt-2 space-y-1">
                                        <li>
                                            • {roomsCount} room
                                            {roomsCount !== 1 ? 's' : ''}
                                        </li>
                                        <li>
                                            • {tileItemsCount} tile item
                                            {tileItemsCount !== 1 ? 's' : ''}
                                        </li>
                                        <li>
                                            • {productItemsCount} product
                                            {productItemsCount !== 1 ? 's' : ''}
                                        </li>
                                    </ul>
                                </div>
                            )}
                            <div className="flex flex-col gap-3 p-6 pt-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-12 border-amber-500/50 text-amber-600 hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-500/20"
                                    onClick={() =>
                                        openGenerateModal('quotation')
                                    }
                                    disabled={cart.length === 0}
                                >
                                    <FileText className="size-5 shrink-0" />
                                    Generate Quotation
                                </Button>
                                <Button
                                    size="lg"
                                    className="h-12 bg-emerald-600 font-semibold hover:bg-emerald-700"
                                    onClick={() => openGenerateModal('invoice')}
                                    disabled={cart.length === 0}
                                >
                                    <Receipt className="size-5 shrink-0" />
                                    Generate Receipt / Sale
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog
                open={!!showGenerateModal}
                onOpenChange={() => setShowGenerateModal(null)}
            >
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {showGenerateModal === 'invoice'
                                ? 'Generate Order / Invoice'
                                : 'Generate Quotation'}
                        </DialogTitle>
                        <DialogDescription>
                            Enter customer details and options
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2">
                            <Label>Existing Customer (optional)</Label>
                            <Select
                                value={customerId || '__new__'}
                                onValueChange={(id) => {
                                    setCustomerId(id === '__new__' ? '' : id);
                                    const c =
                                        id !== '__new__'
                                            ? customers.find(
                                                  (x) => x.id === parseInt(id),
                                              )
                                            : null;
                                    if (c) {
                                        setCustomerName(c.name);
                                        setCustomerPhone(c.phone || '');
                                        setCustomerAddress(c.address || '');
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer or enter new" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__new__">
                                        — New customer —
                                    </SelectItem>
                                    {customers.map((c) => (
                                        <SelectItem
                                            key={c.id}
                                            value={String(c.id)}
                                        >
                                            {c.name}{' '}
                                            {c.phone ? `(${c.phone})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Customer Name *</Label>
                            <Input
                                value={customerName}
                                onChange={(e) =>
                                    setCustomerName(e.target.value)
                                }
                                placeholder="Name"
                                required
                            />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input
                                value={customerPhone}
                                onChange={(e) =>
                                    setCustomerPhone(e.target.value)
                                }
                                placeholder="Phone"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label>Address</Label>
                            <textarea
                                value={customerAddress}
                                onChange={(e) =>
                                    setCustomerAddress(e.target.value)
                                }
                                placeholder="Address"
                                rows={2}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <Label>CNIC</Label>
                            <Input
                                value={customerCnic}
                                onChange={(e) =>
                                    setCustomerCnic(e.target.value)
                                }
                                placeholder="CNIC"
                            />
                        </div>
                        <div>
                            <Label>Discount %</Label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                step={0.01}
                                value={discountPct}
                                onChange={(e) =>
                                    setDiscountPct(
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                            />
                        </div>
                        {showGenerateModal === 'invoice' && (
                            <div className="col-span-2">
                                <Label>Paid Amount (Rs)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={paidAmount}
                                    onChange={(e) =>
                                        setPaidAmount(
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Remaining: {formatMoney(remainingAmount)}
                                </p>
                            </div>
                        )}
                        <div className="col-span-2">
                            <Label>Notes</Label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Notes"
                                rows={2}
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowGenerateModal(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGenerate}
                            disabled={
                                processing ||
                                !customerName.trim() ||
                                cart.length === 0
                            }
                        >
                            {showGenerateModal === 'invoice'
                                ? 'Generate Order'
                                : 'Generate Quotation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
