import { Link, router } from '@inertiajs/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { register as tenantRegister } from '@/routes/tenant';

interface CTAProps {
    appName?: string;
    canRegister?: boolean;
}

export function CTA({ appName = 'TilePOS', canRegister = true }: CTAProps) {
    const registerHref = tenantRegister.url();

    return (
        <section id="cta" className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
                    {/* Decorative */}
                    <div className="bg-dots absolute inset-0 opacity-20" />
                    <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
                    <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />

                    <div className="relative grid items-center gap-8 lg:grid-cols-2">
                        <div>
                            <h2 className="font-800 font-display text-3xl tracking-tight text-white sm:text-4xl">
                                Ready to modernize your tile business?
                            </h2>
                            <p className="mt-4 text-lg text-brand-50/90">
                                Join 850+ tile retailers who replaced
                                spreadsheets with {appName}. Start your free
                                14-day trial today — no credit card required.
                            </p>
                            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-brand-50/90">
                                {[
                                    'Setup in minutes',
                                    'All modules included',
                                    'Cancel anytime',
                                ].map((t) => (
                                    <span
                                        key={t}
                                        className="inline-flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 className="h-4 w-4" /> {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="w-full max-w-md lg:justify-self-end">
                            <div className="shadow-glow rounded-2xl bg-white/95 p-6 backdrop-blur">
                                <h3 className="font-700 font-display text-lg text-ink-900">
                                    Start your free trial
                                </h3>
                                <p className="mt-1 text-sm text-ink-500">
                                    No credit card required.
                                </p>
                                {canRegister ? (
                                    <form
                                        className="mt-4 space-y-3"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            router.get(registerHref);
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Business name"
                                            className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-sm text-ink-900 transition outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Work email"
                                            className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-sm text-ink-900 transition outline-none placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                                        />
                                        <button
                                            type="submit"
                                            className="font-600 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm text-white transition-colors hover:bg-brand-700"
                                        >
                                            Create my workspace
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </form>
                                ) : (
                                    <div className="mt-4">
                                        <Link
                                            href="/contact-us"
                                            className="font-600 block w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-center text-sm text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
                                        >
                                            Contact sales
                                        </Link>
                                    </div>
                                )}
                                <p className="mt-3 text-center text-xs text-ink-400">
                                    By signing up you agree to our Terms &
                                    Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
