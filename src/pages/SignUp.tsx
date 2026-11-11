import { CustomInput } from '@/src/components/forms'
import { useSignUp } from '@/src/hooks/useSignUp'
import { signUpSchema, type SignUpFormValues } from '@/src/lib/validation/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { CustomAlert } from '../components/Alert/custom-alert'
import { CustomButton } from '../components/Button/custom-button'

export default function SignUp() {
    const signUpMutation = useSignUp()
    const location = useLocation()

    const onboardingState = location.state as
        | { from?: { pathname?: string; search?: string; hash?: string } }
        | null
        | undefined

    const from = onboardingState?.from
    const returnState = from ? { from } : undefined

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            accountType: 'attendee',
        },
        mode: 'onBlur',
    })

    const accountType = useWatch({
        control,
        name: 'accountType',
    })

    const onSubmit = (values: SignUpFormValues) => {
        const nameParts = values.fullName.trim().split(/\s+/)

        signUpMutation.mutate({
            first_name: nameParts[0],
            last_name: nameParts.slice(1).join(' '),
            username: values.email.trim().split('@')[0].toLowerCase(),
            email: values.email.trim().toLowerCase(),
            password: values.password,
        })
    }

    const isLoading = isSubmitting || signUpMutation.isPending

    return (
        <main className="min-h-screen w-full bg-background px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto w-full max-w-md">
                {/* Sign-up card */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-background shadow-sm">
                    {/* Page tabs */}
                    <div className="grid grid-cols-2 border-b border-gray-200">
                        <div className="border-b-[3px] border-[#00865a] py-4 text-center font-semibold text-[#00865a]">
                            Sign up
                        </div>

                        <Link
                            to="/login"
                            state={returnState}
                            className="py-4 text-center font-semibold text-gray-500 transition-colors hover:text-[#00865a]"
                        >
                            Log in
                        </Link>
                    </div>

                    <div className="p-5 sm:p-8">
                        <div className="mb-7">
                            <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
                                Create your account
                            </h1>

                            <p className="text-sm leading-6 text-gray-500 sm:text-base">
                                Buy tickets and keep them all in one place.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-6"
                            noValidate
                        >
                            {/* Account type */}
                            <div>
                                <p className="mb-3 text-sm font-medium text-foreground">
                                    I want to:
                                </p>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {(
                                        [
                                            [
                                                'attendee',
                                                'Buy tickets',
                                                'Attendee account',
                                            ],
                                            [
                                                'organizer',
                                                'Sell tickets',
                                                'Organizer account',
                                            ],
                                        ] as const
                                    ).map(([value, title, description]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                setValue('accountType', value, {
                                                    shouldValidate: true,
                                                })
                                            }
                                            aria-pressed={accountType === value}
                                            className={`rounded-lg border-2 p-4 text-left transition-all ${
                                                accountType === value
                                                    ? 'border-[#00865a] bg-ticket-card'
                                                    : 'border-gray-200 bg-background hover:border-gray-400'
                                            }`}
                                        >
                                            <span className="block font-semibold text-foreground">
                                                {title}
                                            </span>

                                            <span className="mt-1 block text-xs text-foreground">
                                                {description}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <CustomInput
                                label="Full name"
                                placeholder="Enter your full name"
                                autoComplete="name"
                                error={errors.fullName?.message}
                                {...register('fullName')}
                            />

                            <CustomInput
                                label="Email"
                                type="email"
                                placeholder="Enter your email address"
                                autoComplete="email"
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            <div>
                                <CustomInput
                                    label="Password"
                                    type="password"
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    error={errors.password?.message}
                                    {...register('password')}
                                />

                                {!errors.password && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        At least 8 characters
                                    </p>
                                )}
                            </div>

                            {accountType === 'organizer' && (
                                <CustomAlert
                                    icon={<Info />}
                                    largeIcon
                                    description=" Organizer accounts are reviewed by our
                                        team. You can create draft events right
                                        away and publish once approved."
                                    className="flex items-start gap-2 "
                                />
                            )}

                            <CustomButton
                                variant="primary"
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-4 py-7 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoading
                                    ? 'CREATING ACCOUNT...'
                                    : accountType === 'attendee'
                                      ? 'CREATE ATTENDEE ACCOUNT'
                                      : 'CREATE ORGANIZER ACCOUNT'}
                            </CustomButton>
                        </form>

                        <p className="mt-6 text-center text-xs leading-6 text-gray-500 sm:text-sm">
                            By signing up you agree to the{' '}
                            <Link
                                to="/terms"
                                className="text-blue-600 underline"
                            >
                                Terms
                            </Link>{' '}
                            and{' '}
                            <Link
                                to="/privacy"
                                className="text-blue-600 underline"
                            >
                                Privacy policy
                            </Link>
                            .
                        </p>

                        <p className="mt-5 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                state={returnState}
                                className="font-semibold text-green-600 underline underline-offset-4"
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
