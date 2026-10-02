import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Boxes,
    Check,
    ChevronRight,
    Shield,
    Zap,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { home } from '@/routes';

const STEPS = [
    { id: 1, label: 'Company info' },
    { id: 2, label: 'Create account' },
];

const BENEFITS = [
    {
        icon: Zap,
        text: 'Generate quotations in seconds',
    },
    {
        icon: BarChart3,
        text: 'Real-time dashboards & analytics',
    },
    {
        icon: Shield,
        text: 'Enterprise-grade security',
    },
];

export default function OnboardingLayout({
    children,
    title,
    description,
    currentStep = 1,
    appName = 'TilePOS',
}: PropsWithChildren<{
    title: string;
    description: string;
    currentStep?: number;
    appName?: string;
}>) {
    return (
        <div className="flex min-h-dvh flex-col lg:flex-row">
            {/* Left panel - branding & progress */}
            <div className="relative flex flex-col justify-between bg-ink-950 p-8 lg:min-h-dvh lg:w-[44%]">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -left-1/2 h-[120%] w-[120%] rounded-full bg-gradient-to-br from-brand-600/10 via-transparent to-transparent blur-3xl" />
                </div>

                <div className="relative z-10">
                    <Link
                        href={home()}
                        className="group inline-flex items-center gap-2 font-semibold text-white"
                    >
                        <span className="shadow-glow grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white transition-transform group-hover:scale-105">
                            <Boxes className="h-5 w-5" strokeWidth={2.2} />
                        </span>
                        <span className="font-700 font-display tracking-tight">
                            {appName}
                        </span>
                    </Link>

                    <div className="mt-16 hidden lg:block">
                        <p className="mb-6 text-sm font-medium tracking-[0.2em] text-brand-400/90 uppercase">
                            Step {currentStep} of {STEPS.length}
                        </p>
                        <div className="flex flex-col gap-4">
                            {STEPS.map((step) => (
                                <div
                                    key={step.id}
                                    className={`flex items-center gap-3 transition-opacity ${
                                        step.id < currentStep
                                            ? 'opacity-60'
                                            : step.id === currentStep
                                              ? 'opacity-100'
                                              : 'opacity-40'
                                    }`}
                                >
                                    <div
                                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                                            step.id < currentStep
                                                ? 'bg-brand-500 text-white'
                                                : step.id === currentStep
                                                  ? 'border-2 border-brand-500 bg-brand-500/20 text-brand-400'
                                                  : 'border border-ink-200 text-ink-400'
                                        }`}
                                    >
                                        {step.id < currentStep ? (
                                            <Check className="size-4" />
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                    <span
                                        className={
                                            step.id === currentStep
                                                ? 'font-medium text-white'
                                                : 'text-ink-400'
                                        }
                                    >
                                        {step.label}
                                    </span>
                                    {step.id === currentStep && (
                                        <ChevronRight className="ml-auto size-5 text-brand-400/70" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-12 hidden lg:block">
                    <p className="mb-6 text-sm font-medium tracking-[0.2em] text-ink-400 uppercase">
                        Why businesses choose us
                    </p>
                    <ul className="space-y-4">
                        {BENEFITS.map(({ icon: Icon, text }) => (
                            <li
                                key={text}
                                className="flex items-center gap-3 text-ink-100"
                            >
                                <Icon className="size-5 shrink-0 text-brand-400" />
                                <span>{text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right panel - form */}
            <div className="flex flex-1 flex-col justify-center bg-background px-6 py-12 lg:px-16 lg:py-16">
                <div className="mx-auto w-full max-w-md">
                    <div className="group mb-2 flex items-center gap-2 lg:hidden">
                        <span className="shadow-glow grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white transition-transform group-hover:scale-105">
                            <Boxes className="h-5 w-5" strokeWidth={2.2} />
                        </span>
                        <span className="font-700 font-display text-sm">
                            {appName}
                        </span>
                    </div>
                    <div className="mb-8 lg:hidden">
                        <p className="text-xs font-medium text-muted-foreground">
                            Step {currentStep} of {STEPS.length}
                        </p>
                        <div className="mt-1 flex gap-2">
                            {STEPS.map((step) => (
                                <div
                                    key={step.id}
                                    className={`h-1 flex-1 rounded-full transition-colors ${
                                        step.id <= currentStep
                                            ? 'bg-brand-500'
                                            : 'bg-muted'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <h1 className="font-700 font-display text-2xl tracking-tight">
                        {title}
                    </h1>
                    <p className="mt-2 text-muted-foreground">{description}</p>

                    <div className="mt-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
