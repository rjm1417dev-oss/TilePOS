import { Head, router } from '@inertiajs/react';
import { CalendarX2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';

export default function SubscriptionExpired() {
    const handleLogout = () => {
        router.post(logout().url);
    };

    return (
        <AuthLayout
            title="Subscription Expired"
            description="Your trial or subscription has ended. Please contact support or upgrade to continue using the application."
        >
            <Head title="Subscription Expired" />

            <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-accent-50 dark:bg-accent-900/30">
                    <CalendarX2 className="size-8 text-accent-600 dark:text-accent-400" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold">
                        Your access has expired
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Your trial or subscription has ended. Please contact
                        your administrator or upgrade your plan to regain
                        access.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full sm:w-auto"
                >
                    Log out
                </Button>
            </div>
        </AuthLayout>
    );
}
