import { Link } from '@inertiajs/react';
import { Check, Sparkles } from 'lucide-react';
import { register as tenantRegister } from '@/routes/tenant';

const tiers = [
    {
        name: 'Starter',
        price: '₨ 2,500',
        period: '/month',
        desc: 'For single tile shops getting started.',
        features: [
            'Up to 3 users',
            'Dashboard & catalog',
            'Quotations & invoices',
            'Inventory (1 warehouse)',
            'Customer & supplier CRM',
            'Email support',
        ],
        cta: 'Start free trial',
        highlighted: false,
    },
    {
        name: 'Growth',
        price: '₨ 6,500',
        period: '/month',
        desc: 'For growing retailers with multiple staff.',
        features: [
            'Up to 15 users',
            'Everything in Starter',
            'Returns & exchanges',
            'Receivables & payables',
            'Reports & analytics',
            'Custom roles & permissions',
            'Priority support',
        ],
        cta: 'Start free trial',
        highlighted: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        desc: 'For distributors and multi-branch operations.',
        features: [
            'Unlimited users',
            'Everything in Growth',
            'Multi-tenant workspaces',
            'Multiple warehouses',
            'Per-tenant feature flags',
            'Branding & customization',
            'Dedicated account manager',
        ],
        cta: 'Contact sales',
        highlighted: false,
    },
];

export function Pricing() {
    return (
        <section
            id="pricing"
            className="bg-gradient-to-b from-brand-50/40 to-white py-20 lg:py-28"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="reveal mx-auto max-w-2xl text-center">
                    <span className="font-600 text-sm text-brand-600">
                        Pricing
                    </span>
                    <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="mt-4 text-lg text-ink-600">
                        Start free for 14 days. No credit card required. Cancel
                        anytime.
                    </p>
                </div>

                <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
                    {tiers.map((t, i) => (
                        <div
                            key={t.name}
                            className={`reveal card-lift relative rounded-2xl p-7 ${
                                t.highlighted
                                    ? 'shadow-glow border-2 border-brand-500 bg-white lg:-translate-y-3'
                                    : 'border border-ink-100 bg-white hover:border-brand-200 hover:shadow-card'
                            }`}
                            style={{ transitionDelay: `${i * 70}ms` }}
                        >
                            {t.highlighted && (
                                <span className="font-600 shadow-soft absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs text-white">
                                    <Sparkles className="h-3.5 w-3.5" /> Most
                                    popular
                                </span>
                            )}
                            <h3 className="font-700 font-display text-lg text-ink-900">
                                {t.name}
                            </h3>
                            <p className="mt-1 text-sm text-ink-500">
                                {t.desc}
                            </p>
                            <div className="mt-5 flex items-baseline gap-1">
                                <span className="font-800 font-display text-4xl text-ink-950">
                                    {t.price}
                                </span>
                                <span className="text-sm text-ink-500">
                                    {t.period}
                                </span>
                            </div>
                            <Link
                                href={
                                    t.highlighted
                                        ? tenantRegister.url()
                                        : '#cta'
                                }
                                className={`font-600 mt-5 block rounded-xl py-3 text-center text-sm transition-all ${
                                    t.highlighted
                                        ? 'shadow-soft bg-brand-600 text-white hover:bg-brand-700'
                                        : 'border border-ink-200 text-ink-700 hover:border-brand-300 hover:bg-brand-50'
                                }`}
                            >
                                {t.cta}
                            </Link>
                            <ul className="mt-6 space-y-3">
                                {t.features.map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-start gap-2.5 text-sm text-ink-600"
                                    >
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
