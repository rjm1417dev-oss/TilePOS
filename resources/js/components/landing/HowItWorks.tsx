import { LayoutGrid, Rocket, UserPlus } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        step: '01',
        title: 'Create your workspace',
        desc: 'Sign up and get an isolated, multi-tenant workspace for your tile business in seconds. No installation, no setup fees.',
    },
    {
        icon: LayoutGrid,
        step: '02',
        title: 'Import your data',
        desc: 'Bring in customers, suppliers, and products via CSV templates. Configure tax, branding, and roles to match your workflow.',
    },
    {
        icon: Rocket,
        step: '03',
        title: 'Start selling',
        desc: 'Create quotations, convert to invoices, track stock, and watch your dashboard update in real time.',
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="reveal max-w-2xl">
                    <span className="font-600 text-sm text-brand-600">
                        How it works
                    </span>
                    <h2 className="font-700 mt-2 font-display text-3xl tracking-tight text-ink-950 sm:text-4xl">
                        Up and running in three steps
                    </h2>
                    <p className="mt-4 text-lg text-ink-600">
                        No lengthy onboarding. No consultants. Just sign up and
                        go.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {steps.map((s, i) => (
                        <div
                            key={s.step}
                            className="reveal card-lift relative rounded-2xl border border-ink-100 bg-white p-7 hover:border-brand-200 hover:shadow-card"
                            style={{ transitionDelay: `${i * 80}ms` }}
                        >
                            <span className="font-800 absolute top-6 right-6 font-display text-4xl text-ink-100">
                                {s.step}
                            </span>
                            <span className="shadow-glow grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white">
                                <s.icon className="h-6 w-6" strokeWidth={2} />
                            </span>
                            <h3 className="font-700 mt-5 font-display text-xl text-ink-900">
                                {s.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-ink-600">
                                {s.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
