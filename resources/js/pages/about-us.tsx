import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    ChevronRight,
    Globe2,
    HeartHandshake,
    Target,
    Users,
    Zap,
} from 'lucide-react';
import { useLenis } from '@/hooks/use-lenis';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import MarketingLayout from '@/layouts/marketing-layout';
import { register as tenantRegister } from '@/routes/tenant';

const STATS = [
    { value: '500+', label: 'Active businesses' },
    { value: '50K+', label: 'Quotations generated' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
];

const TEAM = [
    { name: 'Sarah Chen', role: 'CEO & Co-founder' },
    { name: 'Marcus Johnson', role: 'CTO' },
    { name: 'Elena Rodriguez', role: 'Head of Product' },
];

const VALUES = [
    {
        icon: Target,
        title: 'Our mission',
        description:
            'To simplify operations for tile and construction businesses with intuitive, powerful software that replaces spreadsheets and paperwork.',
    },
    {
        icon: Building2,
        title: 'Our vision',
        description:
            'A world where every materials business runs smoothly with modern, cloud-native tools built specifically for the trade.',
    },
    {
        icon: HeartHandshake,
        title: 'Our values',
        description:
            'Simplicity, reliability, and putting our customers first in everything we design, ship, and support.',
    },
];

function avatarUrl(name: string, size = 400): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=16837a&color=fff&bold=true`;
}

export default function AboutUs({
    appName = 'TilePOS',
    tagline,
}: {
    appName?: string;
    tagline?: string;
}) {
    useLenis();
    useScrollReveal();

    return (
        <MarketingLayout appName={appName} tagline={tagline}>
            <Head title={`About Us - ${appName}`} />

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
                            Our story
                        </div>

                        <h1
                            className="font-800 animate-fade-up mt-5 font-display text-4xl leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl"
                            style={{ animationDelay: '60ms' }}
                        >
                            Built by tile people,{' '}
                            <span className="text-gradient">
                                for tile people
                            </span>
                        </h1>

                        <p
                            className="animate-fade-up mt-5 text-lg leading-relaxed text-ink-600"
                            style={{ animationDelay: '120ms' }}
                        >
                            Founded in 2020, {appName} was born from a simple
                            observation: tile and construction materials
                            businesses were drowning in spreadsheets and
                            paperwork. We set out to build a modern ERP that
                            streamlines quotations, inventory, and customer
                            management so you can focus on growth.
                        </p>

                        <div
                            className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-3"
                            style={{ animationDelay: '180ms' }}
                        >
                            <Link
                                href={tenantRegister.url()}
                                className="font-600 hover:shadow-glow inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm text-white shadow-card transition-all hover:bg-brand-700"
                            >
                                Start your free trial
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="#values"
                                className="font-600 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3.5 text-sm text-ink-700 transition-colors hover:border-ink-300 hover:bg-ink-50"
                            >
                                Discover our values
                            </a>
                        </div>

                        <div
                            className="animate-fade-up mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-500"
                            style={{ animationDelay: '240ms' }}
                        >
                            {[
                                'Multi-tenant ERP',
                                'Cloud-native',
                                'ERP for the tile trade',
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

            {/* Mission / Vision / Values */}
            <section
                id="values"
                className="bg-gradient-to-b from-white to-brand-50/40 py-16 lg:py-24"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="reveal mx-auto max-w-2xl text-center">
                        <span className="font-600 text-sm text-brand-600">
                            What drives us
                        </span>
                        <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                            Mission, vision, and values
                        </h2>
                        <p className="mt-4 text-lg text-ink-600">
                            We believe great software should get out of the way
                            and let your business run faster.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {VALUES.map((value, i) => (
                            <div
                                key={value.title}
                                className="reveal card-lift rounded-2xl border border-ink-100 bg-white p-7 hover:border-brand-200 hover:shadow-card"
                                style={{ transitionDelay: `${i * 80}ms` }}
                            >
                                <span className="shadow-glow grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white">
                                    <value.icon
                                        className="h-6 w-6"
                                        strokeWidth={2}
                                    />
                                </span>
                                <h3 className="font-700 mt-5 font-display text-xl text-ink-900">
                                    {value.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="reveal grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <span className="font-600 text-sm text-brand-600">
                                Why we started
                            </span>
                            <h2 className="font-700 mt-3 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                                From cluttered spreadsheets to a single source
                                of truth
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-ink-600">
                                Tile retailers and distributors juggle
                                quotations, stock, invoices, and customer
                                records across disconnected tools. We
                                experienced the pain firsthand and decided to
                                build the ERP we wished existed — designed
                                around the real workflow of the tile trade.
                            </p>
                            <p className="mt-4 text-base leading-relaxed text-ink-600">
                                Today, {appName} helps businesses across
                                multiple countries manage everything from
                                multi-tenant workspaces to PDF quotations and
                                real-time inventory, all in one place.
                            </p>

                            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {STATS.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-xl border border-ink-100 bg-white p-4 shadow-card"
                                    >
                                        <p className="font-800 font-display text-2xl text-brand-600">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-xs text-ink-500">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-brand-200/40 via-brand-100/30 to-accent-100/30 blur-2xl" />
                            <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-card">
                                <div className="flex h-10 items-center gap-2 border-b border-ink-100 bg-ink-50/60 px-4">
                                    <div className="flex gap-1.5">
                                        <span className="h-3 w-3 rounded-full bg-red-400" />
                                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                                        <span className="h-3 w-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="font-500 ml-2 flex-1 text-center text-xs text-ink-400">
                                        app.tilecore.io / dashboard
                                    </div>
                                </div>
                                <div className="bg-gradient-to-b from-white to-ink-50/40 p-5">
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            {
                                                label: 'Active tenants',
                                                value: '850+',
                                            },
                                            {
                                                label: 'SKUs tracked',
                                                value: '120k+',
                                            },
                                            {
                                                label: 'Invoices sent',
                                                value: '340k+',
                                            },
                                            {
                                                label: 'Countries served',
                                                value: '12',
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className="rounded-xl border border-ink-100 bg-white p-3"
                                            >
                                                <p className="text-xs text-ink-500">
                                                    {item.label}
                                                </p>
                                                <p className="font-700 mt-1 font-display text-lg text-ink-900">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 rounded-xl border border-ink-100 bg-white p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                                                <Globe2 className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <p className="font-600 text-xs text-ink-900">
                                                    Global infrastructure
                                                </p>
                                                <p className="text-[10px] text-ink-500">
                                                    Secure, scalable, always on
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-ink-100 bg-white p-3">
                                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-green-50 text-green-600">
                                            <Zap className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="font-600 text-xs text-ink-900">
                                                Lightning-fast quotations
                                            </p>
                                            <p className="text-[10px] text-ink-500">
                                                Built for speed and accuracy
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="border-t border-ink-100 bg-gradient-to-b from-brand-50/40 to-white py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="reveal mx-auto max-w-2xl text-center">
                        <span className="font-600 text-sm text-brand-600">
                            Leadership
                        </span>
                        <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                            Meet the team
                        </h2>
                        <p className="mt-4 text-lg text-ink-600">
                            A small, focused team passionate about building
                            better tools for the tile industry.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {TEAM.map((member, i) => (
                            <div
                                key={member.name}
                                className="reveal overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-card"
                                style={{ transitionDelay: `${i * 80}ms` }}
                            >
                                <img
                                    src={avatarUrl(member.name)}
                                    alt={member.name}
                                    className="aspect-square w-full border-b border-ink-100 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="font-700 font-display text-lg text-ink-900">
                                        {member.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-ink-500">
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                        ))}
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
                                Join us on the journey
                            </h2>
                            <p className="mt-4 text-lg text-brand-50/90">
                                Start your free trial and see how {appName} can
                                transform your business.
                            </p>
                            <Link
                                href={tenantRegister.url()}
                                className="font-600 shadow-soft mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm text-brand-700 transition hover:bg-ink-50"
                            >
                                Get started free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
