import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Clock,
    Mail,
    MapPin,
    MessageSquareText,
    Phone,
    Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLenis } from '@/hooks/use-lenis';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import MarketingLayout from '@/layouts/marketing-layout';
import { register as tenantRegister } from '@/routes/tenant';

const CONTACT_INFO = [
    {
        icon: Mail,
        label: 'Email',
        value: 'support@example.com',
        href: 'mailto:support@example.com',
    },
    {
        icon: Phone,
        label: 'Phone',
        value: '+92 301 0511550',
        href: 'tel:+923010511550',
    },
    {
        icon: MapPin,
        label: 'Office',
        value: 'CBT 312 Hassan Colony Taxila',
        href: null,
    },
    {
        icon: Clock,
        label: 'Support hours',
        value: 'Monday - Friday, 9am - 6pm PST',
        href: null,
    },
];

export default function ContactUs({
    appName = 'TilePOS',
    tagline,
}: {
    appName?: string;
    tagline?: string;
}) {
    useLenis();
    useScrollReveal();

    const { flash } =
        (usePage().props as { flash?: { success?: string } }) ?? {};
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    return (
        <MarketingLayout appName={appName} tagline={tagline}>
            <Head title={`Contact Us - ${appName}`} />

            {/* Hero */}
            <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-white to-white" />
                <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
                <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
                <div className="absolute top-40 -left-24 -z-10 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl" />

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="font-600 animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1.5 text-xs text-brand-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-brand-500" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
                            </span>
                            Get in touch
                        </div>

                        <h1
                            className="font-800 animate-fade-up mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            Let&apos;s start a{' '}
                            <span className="text-gradient">conversation</span>
                        </h1>

                        <p
                            className="animate-fade-up mt-5 text-lg leading-relaxed text-ink-600"
                            style={{ animationDelay: '120ms' }}
                        >
                            Have a question about pricing, features, or
                            migration? Our team is here to help you get the most
                            out of {appName}.
                        </p>

                        <div
                            className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-500"
                            style={{ animationDelay: '180ms' }}
                        >
                            {[
                                'Response within 24 hours',
                                'Dedicated onboarding support',
                                'Tile-trade expertise',
                            ].map((h) => (
                                <span
                                    key={h}
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-brand-500" />
                                    {h}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact info + form */}
            <section className="bg-gradient-to-b from-white to-brand-50/40 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="reveal grid gap-12 lg:grid-cols-2 lg:gap-16">
                        {/* Left: info */}
                        <div>
                            <span className="font-600 text-sm text-brand-600">
                                Contact details
                            </span>
                            <h2 className="font-700 mt-3 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                                We&apos;d love to hear from you
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-ink-600">
                                Whether you need a quick answer, a tailored
                                demo, or help migrating your existing data,
                                reach out and we&apos;ll get back to you as soon
                                as possible.
                            </p>

                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                {CONTACT_INFO.map((item, i) => (
                                    <div
                                        key={item.label}
                                        className="card-lift flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5 transition-all hover:border-brand-200 hover:shadow-card"
                                        style={{
                                            transitionDelay: `${i * 60}ms`,
                                        }}
                                    >
                                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                                            <item.icon
                                                className="h-5 w-5"
                                                strokeWidth={2}
                                            />
                                        </span>
                                        <div>
                                            <p className="text-xs font-medium tracking-wider text-ink-500 uppercase">
                                                {item.label}
                                            </p>
                                            {item.href ? (
                                                <a
                                                    href={item.href}
                                                    className="mt-1 text-sm font-medium text-ink-900 hover:text-brand-600"
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <p className="mt-1 text-sm font-medium text-ink-900">
                                                    {item.value}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                                <div className="flex items-start gap-3">
                                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                                        <MessageSquareText className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="font-600 text-sm text-ink-900">
                                            Prefer a live demo?
                                        </p>
                                        <p className="mt-1 text-sm text-ink-600">
                                            Book a 30-minute walkthrough with
                                            our team and see how {appName} fits
                                            your workflow.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: form */}
                        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
                            <h3 className="font-700 font-display text-xl text-ink-900">
                                Send us a message
                            </h3>
                            <p className="mt-1 text-sm text-ink-500">
                                Fill out the form and we&apos;ll reply within 24
                                hours.
                            </p>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    post('/contact-us');
                                }}
                                className="mt-6 space-y-5"
                            >
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className="mt-2"
                                        placeholder="Your name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className="mt-2"
                                        placeholder="you@example.com"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) =>
                                            setData('subject', e.target.value)
                                        }
                                        className="mt-2"
                                        placeholder="How can we help?"
                                        required
                                    />
                                    {errors.subject && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.subject}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="message">Message</Label>
                                    <textarea
                                        id="message"
                                        value={data.message}
                                        onChange={(e) =>
                                            setData('message', e.target.value)
                                        }
                                        className="mt-2 flex min-h-[140px] w-full rounded-lg border border-input  px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
                                        placeholder="Tell us more..."
                                        required
                                    />
                                    {errors.message && (
                                        <p className="mt-1 text-sm text-destructive">
                                            {errors.message}
                                        </p>
                                    )}
                                </div>
                                {flash?.success && (
                                    <div className="rounded-lg bg-brand-50 p-4 text-sm text-brand-700">
                                        {flash.success}
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-brand-600 hover:bg-brand-700"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Send message
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-14 sm:px-12 lg:py-20">
                        <div className="bg-dots absolute inset-0 opacity-20" />
                        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand-400/30 blur-3xl" />
                        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl" />
                        <div className="relative">
                            <h2 className="font-800 font-display text-3xl tracking-tight text-white sm:text-4xl">
                                Prefer to get started?
                            </h2>
                            <p className="mt-4 text-lg text-brand-50/90">
                                Start your free 14-day trial today — no credit
                                card required.
                            </p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link
                                    href={tenantRegister.url()}
                                    className="font-600 shadow-soft inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm text-brand-700 transition hover:bg-ink-50"
                                >
                                    Start free trial
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/faqs"
                                    className="font-600 inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm text-white transition hover:bg-white/10"
                                >
                                    Read FAQs
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
