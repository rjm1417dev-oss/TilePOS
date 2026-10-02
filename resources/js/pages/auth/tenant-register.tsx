import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import OnboardingLayout from '@/layouts/auth/onboarding-layout';
import { login } from '@/routes';
import { submit } from '@/routes/tenant/register';

const STEPS = [
    {
        id: 1,
        title: 'Tell us about your business',
        description: "We'll use this to set up your workspace.",
    },
    {
        id: 2,
        title: 'Create your account',
        description: 'Choose a secure password to protect your data.',
    },
];

export default function TenantRegister() {
    const { appName = 'TilePOS' } =
        (usePage().props as { appName?: string }) ?? {};
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data, setData, processing, errors } = useForm({
        business_name: '',
        business_email: '',
        business_phone: '',
        business_address: '',
        password: '',
        password_confirmation: '',
    });

    const currentStepConfig = STEPS[step - 1];
    const isLastStep = step === STEPS.length;

    const handleNext = () => {
        if (isLastStep) {
            submitNativeForm();
        } else {
            setStep((s) => s + 1);
        }
    };

    const submitNativeForm = () => {
        setIsSubmitting(true);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = submit.url();
        form.style.display = 'none';

        const csrfToken =
            document
                .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
                ?.getAttribute('content') ?? '';
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = csrfToken;
        form.appendChild(tokenInput);

        const fields: Record<string, string> = {
            business_name: data.business_name,
            business_email: data.business_email,
            business_phone: data.business_phone,
            business_address: data.business_address,
            password: data.password,
            password_confirmation: data.password_confirmation,
        };
        for (const [name, value] of Object.entries(fields)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
    };

    const handleBack = () => {
        setStep((s) => Math.max(1, s - 1));
    };

    const canProceedStep1 =
        data.business_name.trim() && data.business_email.trim();
    const canProceedStep2 =
        data.password.length >= 8 &&
        data.password === data.password_confirmation;

    const canProceed = step === 1 ? canProceedStep1 : canProceedStep2;

    return (
        <>
            <Head title="Register Business">
                <link
                    href="https://fonts.bunny.net/css?family=syne:400,500,600,700,800"
                    rel="stylesheet"
                />
            </Head>
            <OnboardingLayout
                title={currentStepConfig.title}
                description={currentStepConfig.description}
                currentStep={step}
                appName={appName}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleNext();
                    }}
                    className="flex flex-col gap-6"
                >
                    {/* Step 1: Company info */}
                    {step === 1 && (
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="business_name">
                                    Business name
                                </Label>
                                <Input
                                    id="business_name"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="organization"
                                    value={data.business_name}
                                    onChange={(e) =>
                                        setData('business_name', e.target.value)
                                    }
                                    placeholder="Your company name"
                                    className="h-11"
                                />
                                <InputError message={errors.business_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="business_email">
                                    Business email
                                </Label>
                                <Input
                                    id="business_email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={data.business_email}
                                    onChange={(e) =>
                                        setData(
                                            'business_email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="contact@company.com"
                                    className="h-11"
                                />
                                <InputError message={errors.business_email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="business_phone">
                                    Business phone{' '}
                                    <span className="text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    id="business_phone"
                                    type="tel"
                                    autoComplete="tel"
                                    value={data.business_phone}
                                    onChange={(e) =>
                                        setData(
                                            'business_phone',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="+1 234 567 8900"
                                    className="h-11"
                                />
                                <InputError message={errors.business_phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="business_address">
                                    Business address{' '}
                                    <span className="text-muted-foreground">
                                        (optional)
                                    </span>
                                </Label>
                                <Input
                                    id="business_address"
                                    type="text"
                                    autoComplete="street-address"
                                    value={data.business_address}
                                    onChange={(e) =>
                                        setData(
                                            'business_address',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="123 Main St, City, Country"
                                    className="h-11"
                                />
                                <InputError message={errors.business_address} />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Password */}
                    {step === 2 && (
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoFocus
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="At least 8 characters"
                                    className="h-11"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Confirm your password"
                                    className="h-11"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="order-2 sm:order-1">
                            {step > 1 ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleBack}
                                    disabled={processing || isSubmitting}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="size-4" />
                                    Back
                                </Button>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Already have an account?{' '}
                                    <TextLink href={login()}>Log in</TextLink>
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={!canProceed || processing || isSubmitting}
                            className="order-1 gap-2 sm:order-2"
                            data-test="tenant-register-button"
                        >
                            {processing || isSubmitting ? (
                                <Spinner />
                            ) : isLastStep ? (
                                <>
                                    Create account
                                    <ArrowRight className="size-4" />
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </OnboardingLayout>
        </>
    );
}
