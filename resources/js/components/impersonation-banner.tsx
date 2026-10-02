import { router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import superAdmin from '@/routes/super-admin';

interface ImpersonatingProps {
    active: boolean;
}

export function ImpersonationBanner() {
    const page = usePage();
    const impersonating = (page.props as { impersonating?: ImpersonatingProps })
        ?.impersonating;

    if (!impersonating?.active) return null;

    const handleStop = () => {
        router.post(superAdmin.impersonate.stop.url());
    };

    return (
        <div className="flex items-center justify-between gap-4 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-amber-800 dark:text-amber-200">
            <span className="text-sm font-medium">
                You are viewing as another user
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                className="border-amber-500/30 hover:bg-amber-500/20"
            >
                <X className="mr-1 size-4" />
                Stop impersonating
            </Button>
        </div>
    );
}
