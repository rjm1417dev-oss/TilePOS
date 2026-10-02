import { router, usePage } from '@inertiajs/react';
import {
    Bell,
    Box,
    CalendarClock,
    Check,
    CreditCard,
    Receipt,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { markRead } from '@/routes/notifications';

type NotificationItem = {
    type: string;
    title: string;
    message: string;
    href: string;
    icon: string;
    unread: boolean;
};

type NotificationsData = {
    items: NotificationItem[];
    unreadCount: number;
};

const iconMap = {
    box: Box,
    'credit-card': CreditCard,
    receipt: Receipt,
    'alert-triangle': ShieldAlert,
    users: Users,
    'calendar-clock': CalendarClock,
};

export function NotificationDropdown() {
    const { notifications } = usePage().props as {
        notifications?: NotificationsData;
    };
    const { items = [], unreadCount = 0 } = notifications ?? {};

    const handleMarkAllRead = () => {
        const types = items.map((i) => i.type);
        if (types.length === 0) return;
        router.post(markRead.url(), { types });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full"
                    aria-label="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-medium text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                collisionPadding={8}
                className="w-[calc(100vw-2rem)] max-w-[360px] p-0 sm:w-[360px]"
            >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <>
                                <span className="text-xs text-muted-foreground">
                                    {unreadCount} new
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1 text-xs"
                                    onClick={handleMarkAllRead}
                                >
                                    <Check className="size-3.5" />
                                    Mark all as read
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
                            <Bell className="h-10 w-10 opacity-40" />
                            <p>No new notifications</p>
                            <p className="text-xs">You're all caught up.</p>
                        </div>
                    ) : (
                        <div className="py-1">
                            {items.map((item) => {
                                const IconComponent =
                                    iconMap[
                                        item.icon as keyof typeof iconMap
                                    ] ?? Box;
                                return (
                                    <button
                                        key={item.type}
                                        type="button"
                                        className={cn(
                                            'flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                                            item.unread && 'bg-accent/30',
                                        )}
                                        onClick={() => {
                                            router.post(markRead.url(), {
                                                types: [item.type],
                                                redirect: item.href,
                                            });
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                                                item.type === 'low_stock' &&
                                                    'bg-accent-500/20 text-accent-600 dark:text-accent-400',
                                                item.type === 'payables' &&
                                                    'bg-red-500/20 text-red-600 dark:text-red-400',
                                                item.type === 'receivables' &&
                                                    'bg-orange-500/20 text-orange-600 dark:text-orange-400',
                                                item.type === 'failed_logins' &&
                                                    'bg-red-500/20 text-red-600 dark:text-red-400',
                                                item.type === 'new_tenants' &&
                                                    'bg-primary/20 text-primary',
                                                item.type ===
                                                    'expiring_trials' &&
                                                    'bg-accent-500/20 text-accent-600 dark:text-accent-400',
                                            )}
                                        >
                                            <IconComponent className="h-4 w-4 text-current" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="leading-tight font-medium">
                                                {item.title}
                                            </p>
                                            <p className="mt-0.5 break-words text-sm text-muted-foreground">
                                                {item.message}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
