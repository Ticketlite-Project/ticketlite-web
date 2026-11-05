import { CustomInput } from '@/src/components/forms'
import { useSignUp } from '@/src/hooks/useSignUp'
import { signUpSchema, type SignUpFormValues } from '@/src/lib/validation/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Ticket, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CustomButton } from '../components/Button/custom-button'
import { getOnboardingCloseDestination } from '../lib/onboarding-return'

export default function SignUp() {
    const signUpMutation = useSignUp()
    const navigate = useNavigate()
    const location = useLocation()
    const onboardingState = location.state as
        | { from?: { pathname?: string; search?: string; hash?: string } }
        | null
        | undefined
    const from = onboardingState?.from
    const closeModal = () => {
        navigate(getOnboardingCloseDestination(from), { replace: true })
    }
    const returnState = from ? { from } : undefined
    const {
        register,
        handleSubmit,
        setValue,
        watch,
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

    const accountType = watch('accountType')

    const onSubmit = (values: SignUpFormValues) => {
        const nameParts = values.fullName.trim().split(/\s+/)
        signUpMutation.mutate({
            first_name: nameParts[0],
            last_name: nameParts.slice(1).join(' ') || nameParts[0],
            username: values.email.trim().split('@')[0].toLowerCase(),
            email: values.email.trim().toLowerCase(),
            password: values.password,
        })
    }

    const isLoading = isSubmitting || signUpMutation.isPending

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeModal()
            }}
        >
            <div className="relative flex h-[720px] max-h-[calc(100vh-48px)] w-[420px] flex-col overflow-hidden rounded-sm bg-background">
                <div className="relative flex shrink-0 items-center justify-center border-b border-gray-200 px-6 py-5">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="flex items-center gap-3"
                    >
                        <Ticket className="h-7 w-7 fill-[#83c52c] text-[#83c52c]" />
                        <span className="text-xl font-bold text-[#00865a]">
                            TicketLite
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={closeModal}
                        aria-label="Close sign-up"
                        className="absolute right-6 text-gray-500 hover:text-gray-900"
                    >
                        <X size={23} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-6">
                    <div className="mb-6 grid grid-cols-2 border-b border-gray-200">
                        <div className="border-b-[3px] border-[#00865a] py-3 text-center font-semibold">
                            Sign up
                        </div>
                        <Link
                            to="/login"
                            state={returnState}
                            className="py-3 text-center font-semibold text-gray-500 hover:text-[#00865a]"
                        >
                            Log in
                        </Link>
                    </div>
                    <div className="mb-6">
                        <h1 className="mb-1 text-[28px] font-bold tracking-tight">
                            Create your account
                        </h1>
                        <p className="text-[15px] text-gray-500">
                            Buy tickets and keep them all in one place.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                        noValidate
                    >
                        <div>
                            <p className="mb-3 text-sm font-medium text-foreground">
                                I want to:
                            </p>
                            <div className="grid grid-cols-2 gap-3">
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
                                        className={`rounded-lg border-2 p-4 text-left transition-all ${accountType === value ? 'border-[#00865a] bg-ticket-card' : 'border-gray-200 bg-background hover:border-gray-400'}`}
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
                            <div className="flex items-start gap-2 rounded-lg bg-lime-200 p-3 text-sm text-gray-900">
                                <Info
                                    size={16}
                                    className="mt-0.5 shrink-0 text-emerald-700"
                                />
                                <p className="text-xs leading-relaxed">
                                    Organizer accounts are reviewed by our team.
                                    You can create draft events right away and
                                    publish once approved.
                                </p>
                            </div>
                        )}

                        <CustomButton
                            variant="primary"
                            type="submit"
                            disabled={isLoading}
                            className="w-full  px-4 py-4 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading
                                ? 'CREATING ACCOUNT...'
                                : accountType === 'attendee'
                                  ? 'CREATE ATTENDEE ACCOUNT'
                                  : 'CREATE ORGANIZER ACCOUNT'}
                        </CustomButton>
                    </form>

                    <p className="mt-5 text-center text-sm leading-6 text-gray-500">
                        By signing up you agree to the{' '}
                        <Link to="/terms" className="text-blue-600 underline">
                            Terms
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-blue-600 underline">
                            Privacy policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    )
}
