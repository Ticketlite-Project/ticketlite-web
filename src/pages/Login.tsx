import { CustomInput } from '@/src/components/forms'
import { useLogin } from '@/src/hooks/useLogin'
import { loginSchema, type LoginFormValues } from '@/src/lib/validation/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { CustomAlert } from '../components/Alert/custom-alert'
import { CustomButton } from '../components/Button/custom-button'

export default function Login() {
    const location = useLocation()
    const [showForgotPassword, setShowForgotPassword] = useState(false)

    const onboardingState = location.state as
        | { from?: { pathname?: string; search?: string; hash?: string } }
        | null
        | undefined

    const from = onboardingState?.from

    const returnTo = from?.pathname
        ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
        : '/'

    const loginMutation = useLogin(returnTo)
    const returnState = from ? { from } : undefined

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
        mode: 'onBlur',
    })

    const onSubmit = (values: LoginFormValues) => {
        loginMutation.mutate(values)
    }

    const isLoading = isSubmitting || loginMutation.isPending

    return (
        <main className="min-h-screen w-full bg-background px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto w-full max-w-md">
                {/* Login card */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-background shadow-sm">
                    {/* Page tabs */}
                    <div className="grid grid-cols-2 border-b border-gray-200">
                        <Link
                            to="/signup"
                            state={returnState}
                            className="py-4 text-center font-semibold text-gray-500 transition-colors hover:text-[#00865a]"
                        >
                            Sign up
                        </Link>

                        <div className="border-b-[3px] border-[#00865a] py-4 text-center font-semibold text-[#00865a]">
                            Log in
                        </div>
                    </div>

                    <div className="p-5 sm:p-8">
                        <div className="mb-7">
                            <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
                                Welcome back
                            </h1>

                            <p className="text-sm leading-6 text-gray-500 sm:text-base">
                                Log in to access your tickets.
                            </p>

                            {(errors.username || errors.password) && (
                                <CustomAlert
                                    type="danger"
                                    title={
                                        showForgotPassword
                                            ? 'Password mismatch'
                                            : 'Email or Password is incorrect'
                                    }
                                    description={
                                        showForgotPassword
                                            ? 'Confirm both passwords match.'
                                            : 'Check both and try again. After 5 tries, logging in pauses for 10 minutes.'
                                    }
                                    boldTitle={true}
                                    icon={<AlertCircle size={7} />}
                                    bordered
                                    largeIcon
                                    className="mt-5"
                                />
                            )}
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-5"
                            noValidate
                        >
                            {!showForgotPassword ? (
                                <>
                                    <CustomInput
                                        label="Username"
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                        // error={errors.username?.message}
                                        {...register('username')}
                                    />
                                    <CustomInput
                                        label="Password"
                                        type="password"
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        // error={errors.password?.message}
                                        {...register('password')}
                                    />{' '}
                                </>
                            ) : (
                                <>
                                    <CustomInput
                                        label="Password"
                                        type="password"
                                        placeholder="Enter new password"
                                        autoComplete="password"
                                        // error={errors.username?.message}
                                        {...register('password')}
                                    />
                                    <CustomInput
                                        label="Confirm Password"
                                        type="password"
                                        placeholder="Confirm your password"
                                        autoComplete="password"
                                        // error={errors.password?.message}
                                        {...register('password')}
                                    />{' '}
                                </>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-sm font-medium text-green-600 underline underline-offset-4 cursor-pointer"
                                    onClick={() =>
                                        setShowForgotPassword(
                                            !showForgotPassword
                                        )
                                    }
                                >
                                    {!showForgotPassword
                                        ? 'Forgot password?'
                                        : 'Back to Login'}
                                </button>
                            </div>

                            <CustomButton
                                variant="primary"
                                type="submit"
                                disabled={isLoading || showForgotPassword}
                                className="w-full px-4 py-7 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {showForgotPassword
                                    ? 'Send Reset Link'
                                    : isLoading
                                      ? 'Logging in...'
                                      : 'Log in'}
                            </CustomButton>
                        </form>

                        <CustomAlert
                            type="primary"
                            icon={<Users />}
                            largeIcon
                            description="Organisers, gate staff and admins use this same login. We’ll take you to the right place."
                            className="mt-5"
                        />

                        <p className="mt-6 text-center text-sm text-gray-600">
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
        </main>
    )
}
