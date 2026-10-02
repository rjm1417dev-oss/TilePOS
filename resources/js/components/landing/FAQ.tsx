import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQProps {
    appName?: string;
}

export function FAQ({ appName = 'TilePOS' }: FAQProps) {
    const [open, setOpen] = useState<number | null>(0);

    const faqs = [
        {
            q: `Is ${appName} really built for the tile business?`,
            a: `Yes. Every module — from quotations with area and wastage calculations to inventory by box quantity — is designed around how tile retailers and distributors actually work. No generic accounting software workarounds.`,
        },
        {
            q: 'What does multi-tenant mean?',
            a: `Each business gets its own isolated workspace with separate data, users, branding, and settings. You can serve many independent tile companies from a single ${appName} installation — perfect for distributors or franchise operations.`,
        },
        {
            q: 'Can I import my existing customers and products?',
            a: 'Absolutely. Use our downloadable CSV templates to bulk import customers, suppliers, and products. You can also export any module to CSV at any time.',
        },
        {
            q: 'Do I need to install anything?',
            a: `No. ${appName} runs entirely in your browser. Just sign up, create your workspace, and start working. There is nothing to install or maintain.`,
        },
        {
            q: 'Can I control what my staff can access?',
            a: 'Yes. Create custom roles like Salesperson or Accountant and control exactly who can create quotations, view reports, import data, or change settings.',
        },
        {
            q: 'What happens after the 14-day trial?',
            a: 'You pick the plan that fits your business. If you decide not to continue, your data stays available for 30 days before being permanently deleted. No charges unless you choose to subscribe.',
        },
    ];

    return (
        <section id="faq" className="py-20 lg:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="reveal text-center">
                    <span className="font-600 text-sm text-brand-600">FAQ</span>
                    <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                        Questions, answered
                    </h2>
                </div>

                <div className="mt-10 space-y-3">
                    {faqs.map((f, i) => {
                        const isOpen = open === i;
                        return (
                            <div
                                key={i}
                                className="reveal overflow-hidden rounded-xl border border-ink-100 bg-white"
                            >
                                <button
                                    onClick={() => setOpen(isOpen ? null : i)}
                                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-ink-50/50"
                                >
                                    <span className="font-600 font-display text-base text-ink-900">
                                        {f.q}
                                    </span>
                                    <ChevronDown
                                        className={`h-5 w-5 shrink-0 text-brand-600 transition-transform duration-300 ${
                                            isOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                                <div
                                    className={`grid transition-all duration-300 ${
                                        isOpen
                                            ? 'grid-rows-[1fr] opacity-100'
                                            : 'grid-rows-[0fr] opacity-0'
                                    }`}
                                >
                                    <div className="overflow-hidden">
                                        <p className="px-5 pb-4 text-sm leading-relaxed text-ink-600">
                                            {f.a}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
