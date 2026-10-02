import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Banknote,
    Boxes,
    FileDown,
    FileOutput,
    FileText,
    KeyRound,
    Layers,
    LayoutGrid,
    Package,
    Receipt,
    RotateCcw,
    Ruler,
    Tag,
    Truck,
    UserCog,
    Users,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as accountsPayablesIndex } from '@/routes/accounts-payables';
import { index as accountsReceivablesIndex } from '@/routes/accounts-receivables';
import { index as brandsIndex } from '@/routes/brands';
import { index as customersIndex } from '@/routes/customers';
import { index as exportIndex } from '@/routes/export';
import { index as importIndex } from '@/routes/import';
import { index as productsIndex } from '@/routes/products';
import { index as quotationsIndex } from '@/routes/quotations';
import { index as reportsIndex } from '@/routes/reports';
import { index as rolesIndex } from '@/routes/roles';
import { index as sizesIndex } from '@/routes/sizes';
import { index as stocksIndex } from '@/routes/stocks';
import { index as suppliersIndex } from '@/routes/suppliers';
import { index as tileReturnsIndex } from '@/routes/tile-returns';
import { index as tilesIndex } from '@/routes/tiles';
import { index as usersIndex } from '@/routes/users';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

// Groups and order match Tiles Filament navigation
export const allNavItems: NavItem[] = [
    { title: 'Overview', href: dashboard(), icon: LayoutGrid },
    // Sales & Orders
    {
        title: 'Order/Quotation',
        href: quotationsIndex.url(),
        icon: FileText,
        permission: 'quotations.view',
        featureKey: 'quotations',
        group: 'Sales & Orders',
    },
    {
        title: 'Customers',
        href: customersIndex.url(),
        icon: Users,
        permission: 'customers.view',
        group: 'Sales & Orders',
    },
    {
        title: 'Returns / Exchange',
        href: tileReturnsIndex.url(),
        icon: RotateCcw,
        permission: 'tile_returns.view',
        featureKey: 'tile_returns',
        group: 'Sales & Orders',
    },
    // Parties
    {
        title: 'Suppliers',
        href: suppliersIndex.url(),
        icon: Truck,
        permission: 'suppliers.view',
        group: 'Parties',
    },
    // Inventory Management
    {
        title: 'Tiles',
        href: tilesIndex.url(),
        icon: Layers,
        permission: 'tiles.view',
        featureKey: 'tiles',
        group: 'Inventory Management',
    },
    {
        title: 'Brands',
        href: brandsIndex.url(),
        icon: Tag,
        permission: 'brands.view',
        group: 'Inventory Management',
    },
    {
        title: 'Sizes',
        href: sizesIndex.url(),
        icon: Ruler,
        permission: 'sizes.view',
        group: 'Inventory Management',
    },
    {
        title: 'Stock',
        href: stocksIndex.url(),
        icon: Boxes,
        permission: 'stocks.view',
        group: 'Inventory Management',
    },
    {
        title: 'Products',
        href: productsIndex.url(),
        icon: Package,
        permission: 'products.view',
        group: 'Inventory Management',
    },
    // Accounts
    {
        title: 'Payables',
        href: accountsPayablesIndex.url(),
        icon: Banknote,
        permission: 'accounts_payables.view',
        featureKey: 'accounts_payable',
        group: 'Accounts',
    },
    {
        title: 'Receivables',
        href: accountsReceivablesIndex.url(),
        icon: Receipt,
        permission: 'accounts_receivables.view',
        featureKey: 'accounts_receivable',
        group: 'Accounts',
    },
    // Reports
    {
        title: 'Reports',
        href: reportsIndex.url(),
        icon: BarChart3,
        permission: 'reports.view',
        group: 'Reports',
    },
    // Administration
    {
        title: 'Export',
        href: exportIndex.url(),
        icon: FileOutput,
        permission: 'export.create',
        group: 'Administration',
    },
    {
        title: 'Import',
        href: importIndex.url(),
        icon: FileDown,
        permission: 'import.create',
        group: 'Administration',
    },
    {
        title: 'Users',
        href: usersIndex.url(),
        icon: UserCog,
        permission: 'users.view',
        group: 'Administration',
    },
    {
        title: 'Roles',
        href: rolesIndex.url(),
        icon: KeyRound,
        permission: 'roles.view',
        group: 'Administration',
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { auth } = usePage().props as {
        auth?: {
            permissions?: string[];
            enabledFeatures?: string[];
            tenant?: {
                business_name: string;
                logo?: string | null;
            } | null;
        };
    };
    const permissions = auth?.permissions ?? [];
    const enabledFeatures = auth?.enabledFeatures ?? [];
    const mainNavItems = allNavItems.filter((item) => {
        if (item.featureKey && !enabledFeatures.includes(item.featureKey)) {
            return false;
        }
        return !item.permission || permissions.includes(item.permission);
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="mb-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                {auth?.tenant?.logo ? (
                                    <>
                                        <img
                                            src={auth.tenant.logo}
                                            alt={`${auth.tenant.business_name} logo`}
                                            className="h-24 w-30 rounded-lg object-contain"
                                        />
                                        {/* <div className="ml-1 grid flex-1 text-left text-sm">
                                            <span className="mb-0.5 truncate leading-tight font-semibold">
                                                {auth.tenant.business_name}
                                            </span>
                                        </div> */}
                                    </>
                                ) : (
                                    <AppLogo />
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
