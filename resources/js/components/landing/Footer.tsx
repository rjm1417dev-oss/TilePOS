import { Link } from '@inertiajs/react';
import { Boxes, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

interface FooterProps {
    appName?: string;
}

const cols = [
    {
        title: 'Product',
        links: [
            { label: 'Features', href: '/features' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Working', href: '/how-it-works' },
            { label: 'FAQs', href: '/faqs' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/about-us' },
            { label: 'Blog', href: '#' },
            { label: 'About us', href: '/about-us' },
            { label: 'Contact us', href: '/contact-us' },
        ],
    },
    // {
    //     title: 'Resources',
    //     links: [
    //         { label: 'Help center', href: '/faqs' },
    //         { label: 'Documentation', href: '#' },
    //         { label: 'API reference', href: '#' },
    //         { label: 'Community', href: '#' },
    //         { label: 'Status', href: '#' },
    //     ],
    // },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy', href: '/privacy-policy' },
            { label: 'Terms', href: '/terms' },
            { label: 'Cookie policy', href: '/cookie-policy' },
        ],
    },
];

const socials = [Facebook, Twitter, Linkedin, Instagram];

export function Footer({ appName = 'TilePOS' }: FooterProps) {
    return (
        <footer className="border-t border-ink-100 bg-ink-950">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <a href="#top" className="flex items-center gap-2.5">
                            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-white">
                                <Boxes className="h-5 w-5" strokeWidth={2.2} />
                            </span>
                            <span className="font-700 font-display text-lg text-white">
                                {appName}
                            </span>
                        </a>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
                            The all-in-one business platform for tile retailers
                            and distributors. Quotations, inventory, invoices,
                            and analytics — built for the tile trade.
                        </p>
                        <div className="mt-5 flex gap-2">
                            {socials.map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    className="grid h-9 w-9 place-items-center rounded-lg bg-ink-800 text-ink-400 transition-colors hover:bg-brand-600 hover:text-white"
                                    aria-label="Social link"
                                >
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
                        {cols.map((c) => (
                            <div key={c.title}>
                                <h4 className="font-600 font-display text-sm text-white">
                                    {c.title}
                                </h4>
                                <ul className="mt-4 space-y-2.5">
                                    {c.links.map((l) => (
                                        <li key={l.label}>
                                            {l.href.startsWith('#') ? (
                                                <a
                                                    href={l.href}
                                                    className="text-sm text-ink-400 transition-colors hover:text-white"
                                                >
                                                    {l.label}
                                                </a>
                                            ) : (
                                                <Link
                                                    href={l.href}
                                                    className="text-sm text-ink-400 transition-colors hover:text-white"
                                                >
                                                    {l.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-800 pt-6 sm:flex-row">
                    <p className="text-xs text-ink-500">
                        © {new Date().getFullYear()} {appName}. All rights
                        reserved.
                    </p>
                    <p className="text-xs text-ink-500">
                        Created by Xopera Technologies.
                    </p>
                </div>
            </div>
        </footer>
    );
}
