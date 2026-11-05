import { CustomInput } from '@/src/components/forms'
import { useSignUp } from '@/src/hooks/useSignUp'
import { signUpSchema, type SignUpFormValues } from '@/src/lib/validation/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Ticket, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

export default function SignUp() {
    const signUpMutation = useSignUp()
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
        <div className="min-h-screen bg-white lg:flex lg:items-center lg:justify-center">
            <div className="min-h-screen w-full bg-white lg:fixed lg:inset-0 lg:z-50 lg:flex lg:items-center lg:justify-center lg:bg-black/90 lg:px-4 lg:py-6">
                <div className="relative min-h-screen w-full bg-white lg:min-h-0 lg:max-h-[95vh] lg:max-w-[420px] lg:overflow-y-auto lg:rounded-sm">
                    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                        <Link to="/" className="flex items-center gap-3">
                            <Ticket className="h-7 w-7 fill-[#83c52c] text-[#83c52c]" />
                            <span className="text-xl font-bold text-[#00865a]">TicketLite</span>
                        </Link>
                        <button type="button" onClick={() => window.history.back()} aria-label="Close sign-up" className="text-gray-500 hover:text-gray-900">
                            <X size={23} />
                        </button>
                    </div>

                    <div className="px-5 pb-8 pt-6">
                        <div className="mb-6 grid grid-cols-2 border-b border-gray-200">
                            <div className="border-b-[3px] border-[#00865a] py-3 text-center font-semibold">Sign up</div>
                            <Link to="/login" className="py-3 text-center font-semibold text-gray-500 hover:text-[#00865a]">Log in</Link>
                        </div>
                        <div className="mb-6">
                            <h1 className="mb-1 text-[28px] font-bold tracking-tight">Create your account</h1>
                            <p className="text-[15px] text-gray-500">Buy tickets and keep them all in one place.</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                            <div>
                                <p className="mb-3 text-sm font-medium text-gray-700">I want to:</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {([
                                        ['attendee', 'Buy tickets', 'Attendee account'],
                                        ['organizer', 'Sell tickets', 'Organizer account'],
                                    ] as const).map(([value, title, description]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setValue('accountType', value, { shouldValidate: true })}
                                            aria-pressed={accountType === value}
                                            className={`rounded-lg border-2 p-4 text-left transition-all ${accountType === value ? 'border-[#00865a] bg-[#effaf5]' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                                        >
                                            <span className="block font-semibold text-gray-900">{title}</span>
                                            <span className="mt-1 block text-xs text-gray-500">{description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <CustomInput label="Full name" placeholder="Enter your full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
                            <CustomInput label="Email" type="email" placeholder="Enter your email address" autoComplete="email" error={errors.email?.message} {...register('email')} />
                            <div>
                                <CustomInput label="Password" type="password" placeholder="Create a password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
                                {!errors.password && <p className="mt-2 text-sm text-gray-500">At least 8 characters</p>}
                            </div>

                            {accountType === 'organizer' && (
                                <div className="flex items-start gap-2 rounded-lg bg-lime-200 p-3 text-sm text-gray-900">
                                    <Info size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                                    <p className="text-xs leading-relaxed">Organizer accounts are reviewed by our team. You can create draft events right away and publish once approved.</p>
                                </div>
                            )}

                            <button type="submit" disabled={isLoading} className="w-full rounded-sm bg-[#00865a] px-4 py-4 font-bold text-white transition-colors hover:bg-[#006f49] disabled:cursor-not-allowed disabled:opacity-60">
                                {isLoading ? 'CREATING ACCOUNT...' : accountType === 'attendee' ? 'CREATE ATTENDEE ACCOUNT' : 'CREATE ORGANIZER ACCOUNT'}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm leading-6 text-gray-500">
                            By signing up you agree to the <Link to="/terms" className="text-blue-600 underline">Terms</Link> and{' '}
                            <Link to="/privacy" className="text-blue-600 underline">Privacy policy</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
