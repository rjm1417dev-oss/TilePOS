import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Boxes, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboard, login } from '@/routes';
import { register as tenantRegister } from '@/routes/tenant';

interface NavbarProps {
    appName?: string;
    canRegister?: boolean;
}

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '/features' },
    { label: 'Working', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faqs' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Contact Us', href: '/contact-us' },
];

export function Navbar({
    appName = 'TilePOS',
    canRegister = true,
}: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { auth } = (usePage().props as { auth?: { user?: unknown } }) ?? {};
    const isAuthenticated = auth?.user != null;

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const linkClass =
        'font-500 rounded-lg px-3.5 py-2 text-sm text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900';
    const mobileLinkClass =
        'font-500 block rounded-lg px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50';

    const handleNavClick = () => setOpen(false);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'shadow-soft border-b border-ink-100 bg-white/85 backdrop-blur-xl'
                    : 'border-b border-ink-100 bg-white/85 backdrop-blur-xl'
            }`}
        >
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="group flex items-center gap-2.5">
                        <span className="shadow-glow grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white transition-transform group-hover:scale-105">
                            <Boxes className="h-5 w-5" strokeWidth={2.2} />
                        </span>
                        <span className="font-700 font-display text-lg tracking-tight text-ink-900">
                            {appName}
                        </span>
                    </Link>

                    <div className="hidden items-center gap-1 md:flex">
                        {navLinks.map(({ label, href }) =>
                            href.includes('#') ? (
                                <a key={href} href={href} className={linkClass}>
                                    {label}
                                </a>
                            ) : (
                                <Link
                                    key={href}
                                    href={href}
                                    className={linkClass}
                                >
                                    {label}
                                </Link>
                            ),
                        )}
                    </div>

                    <div className="hidden items-center gap-2 md:flex">
                        {isAuthenticated ? (
                            <Link
                                href={dashboard.url()}
                                className="font-600 shadow-soft hover:shadow-glow inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm text-white transition-all hover:bg-brand-700"
                            >
                                Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login.url()}
                                    className="font-500 px-4 py-2 text-sm text-ink-700 transition-colors hover:text-ink-900"
                                >
                                    Sign in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={tenantRegister.url()}
                                        className="font-600 shadow-soft hover:shadow-glow inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm text-white transition-all hover:bg-brand-700"
                                    >
                                        Start free trial
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    <button
                        className="grid h-10 w-10 place-items-center rounded-lg text-ink-700 hover:bg-ink-50 md:hidden"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {open ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {open && (
                    <div className="animate-fade-in space-y-1 pb-4 md:hidden">
                        {navLinks.map(({ label, href }) =>
                            href.includes('#') ? (
                                <a
                                    key={href}
                                    href={href}
                                    onClick={handleNavClick}
                                    className={mobileLinkClass}
                                >
                                    {label}
                                </a>
                            ) : (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={handleNavClick}
                                    className={mobileLinkClass}
                                >
                                    {label}
                                </Link>
                            ),
                        )}
                        <div className="flex gap-2 pt-2">
                            <Link
                                href={login.url()}
                                className="font-500 flex-1 rounded-lg border border-ink-200 px-4 py-2.5 text-center text-sm text-ink-700"
                            >
                                Sign in
                            </Link>
                            {canRegister && (
                                <Link
                                    href={tenantRegister.url()}
                                    className="font-600 flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm text-white"
                                >
                                    Start free trial
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
