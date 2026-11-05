import { CustomInput } from '@/src/components/forms'
import { useLogin } from '@/src/hooks/useLogin'
import { loginSchema, type LoginFormValues } from '@/src/lib/validation/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Ticket, Users, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CustomButton } from '../components/Button/custom-button'
import { getOnboardingCloseDestination } from '../lib/onboarding-return'

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const onboardingState = location.state as
        | { from?: { pathname?: string; search?: string; hash?: string } }
        | null
        | undefined
    const from = onboardingState?.from
    const returnTo = from?.pathname
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
        : '/'
    const loginMutation = useLogin(returnTo)
    const closeModal = () => {
        navigate(getOnboardingCloseDestination(from), { replace: true })
    }
    const returnState = from ? { from } : undefined
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: '', password: '' },
        mode: 'onBlur',
    })

    const onSubmit = (values: LoginFormValues) => loginMutation.mutate(values)
    const isLoading = isSubmitting || loginMutation.isPending

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeModal()
            }}
        >
            <div className="flex h-[720px] max-h-[calc(100vh-48px)] w-[420px] flex-col overflow-hidden rounded-sm bg-background">
                <div className="relative flex shrink-0 items-center justify-center border-b px-6 py-5">
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
                        aria-label="Close login"
                        className="absolute right-6"
                    >
                        <X size={23} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-6">
                    <div className="mb-6 grid grid-cols-2 border-b">
                        <Link
                            to="/signup"
                            state={returnState}
                            className="py-3 text-center font-semibold text-gray-500"
                        >
                            Sign up
                        </Link>
                        <div className="border-b-[3px] border-[#00865a] py-3 text-center font-semibold">
                            Log in
                        </div>
                    </div>
                    <h1 className="mb-2 text-[28px] font-bold">Welcome back</h1>
                    <p className="mb-6 text-gray-500">
                        Log in to access your tickets.
                    </p>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                        noValidate
                    >
                        <CustomInput
                            label="Username"
                            placeholder="Enter your username"
                            autoComplete="username"
                            error={errors.username?.message}
                            {...register('username')}
                        />
                        <CustomInput
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            error={errors.password?.message}
                            {...register('password')}
                        />
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-green-600 underline underline-offset-4"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <CustomButton
                            variant="primary"
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-4  disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? 'LOGGING IN...' : 'LOG IN'}
                        </CustomButton>
                    </form>

                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-gray-900">
                        <Users
                            size={16}
                            className="mt-0.5 shrink-0 text-green-700"
                        />
                        <p className="text-xs leading-relaxed">
                            Organisers, gate staff and admins use this same
                            login. We’ll take you to the right place.
                        </p>
                    </div>
                    <p className="mt-5 text-center text-sm text-gray-600">
                        New to TicketLite?{' '}
                        <Link
                            to="/signup"
                            state={returnState}
                            className="font-semibold text-green-600 underline underline-offset-4"
                        >
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
