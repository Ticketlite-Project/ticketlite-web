import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowLeft, Timer } from 'lucide-react'
import {CustomInput} from '../components/forms'
import {
    checkoutMock,
    checkoutSubtotal,
    checkoutTotal,
    formatCurrency,
} from '../features/checkout/checkoutMock'

type Network = 'MTN' | 'Telecel' | 'AT'

const NETWORK_LABELS: Record<Network, string> = {
    MTN: 'MTN Mobile Money',
    Telecel: 'Telecel Cash',
    AT: 'AT Money',
}

const checkoutSchema = z.object({
    phoneNumber: z
        .string()
        .transform((value) => value.replace(/\s/g, ''))
        .transform((value) =>
            value.startsWith('0') ? value.slice(1) : value
        )
        .refine((value) => /^[0-9]{9}$/.test(value), {
            message: 'Enter a valid 9-digit Ghanaian phone number',
        }),
    network: z.enum(['MTN', 'Telecel', 'AT']),
})

type CheckoutFormValues = z.input<typeof checkoutSchema>

export default function CheckoutPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const loginState = { from: location }

    const [secondsLeft, setSecondsLeft] = useState(10 * 60)

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<CheckoutFormValues>({
        defaultValues: {
            network: 'MTN',
            phoneNumber: '',
        },
    })

    const selectedNetwork = watch('network')

    // TODO: Replace this client-side countdown with the reservation's
    // expiresAt timestamp returned by the server.
    useEffect(() => {
        if (secondsLeft === 0) return

        const interval = window.setInterval(() => {
            setSecondsLeft((previous) => Math.max(previous - 1, 0))
        }, 1000)

        return () => window.clearInterval(interval)
    }, [secondsLeft])

    const minutes = Math.floor(secondsLeft / 60)
        .toString()
        .padStart(2, '0')

    const seconds = (secondsLeft % 60).toString().padStart(2, '0')

    const isExpired = secondsLeft === 0

    const handlePayment = handleSubmit(async (values) => {
        if (isExpired) return

        const result = checkoutSchema.safeParse(values)

        if (!result.success) {
            const phoneIssue = result.error.issues.find(
                (issue) => issue.path[0] === 'phoneNumber'
            )

            if (phoneIssue) {
                setError('phoneNumber', {
                    type: 'manual',
                    message: phoneIssue.message,
                })
            }

            return
        }

        // TODO: Submit result.data to the payment API.
        // The phone number is normalized to nine digits without a leading zero.
    })

    const handleCancel = () => {
        const confirmed = window.confirm(
            'Are you sure you want to cancel this reservation and release your tickets? This action cannot be undone.'
        )

        if (!confirmed) return

        // TODO: Connect reservation cancellation to the reservation API.
        navigate('/login', { replace: true, state: loginState })
    }

    return (
        <main className='min-h-screen bg-slate-100 sm:flex sm:items-center sm:justify-center sm:p-6'>
            <section className='mx-auto flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-white shadow-xl sm:h-[844px] sm:rounded-xl'>
                {/* Header */}
                <header className='flex h-[52px] shrink-0 items-center justify-between border-b border-slate-100 px-5'>
                    <button
                        type='button'
                        className='flex items-center gap-3 text-slate-900'
                        aria-label='Go back'
                        onClick={() =>
                            navigate('/login', { replace: true, state: loginState })
                        }
                    >
                        <ArrowLeft size={20} />
                        <span className='text-base font-bold'>Checkout</span>
                    </button>

                    <span className='text-xs text-slate-500'>
                        Step {checkoutMock.currentStep} of{' '}
                        {checkoutMock.totalSteps}
                    </span>
                </header>

                {/* Reservation countdown */}
                <div className='flex shrink-0 items-center justify-between border-b-4 border-emerald-300 bg-lime-200 px-4 py-3'>
                    <div className='flex items-center gap-3'>
                        <Timer
                            size={22}
                            className='shrink-0 text-slate-900'
                        />

                        <div>
                            <p className='text-xs font-bold text-slate-950'>
                                Tickets held for you
                            </p>
                            <p className='text-[11px] leading-tight text-slate-800'>
                                Complete payment before the timer ends
                            </p>
                        </div>
                    </div>

                    <span className='text-xl font-extrabold tabular-nums text-slate-950'>
                        {minutes}:{seconds}
                    </span>
                </div>

                {/* Scrollable checkout content */}
                <div className='min-h-0 flex-1 space-y-2 overflow-y-auto bg-slate-50 px-3 py-3'>
                    {isExpired && (
                        <div
                            role='alert'
                            className='rounded-lg border border-red-200 bg-red-50 p-3'
                        >
                            <p className='text-sm font-bold text-red-800'>
                                Reservation expired
                            </p>
                            <p className='mt-1 text-xs text-red-700'>
                                Your ticket reservation has expired. Please
                                select your tickets again to continue.
                            </p>
                        </div>
                    )}

                    {/* Ticket summary */}
                    <div className='rounded-lg border border-slate-200 bg-white p-3'>
                        <div className='flex items-center gap-3 border-b border-slate-100 pb-3'>
                            <div className='flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded bg-emerald-50 text-emerald-700'>
                                <span className='text-[9px] font-bold uppercase'>
                                    {checkoutMock.eventMonth}
                                </span>
                                <span className='text-base font-extrabold leading-none'>
                                    {checkoutMock.eventDay}
                                </span>
                            </div>

                            <div className='min-w-0 flex-1'>
                                <h2 className='truncate text-sm font-bold text-slate-950'>
                                    {checkoutMock.eventName}
                                </h2>
                                <p className='text-[11px] text-slate-500'>
                                    {checkoutMock.eventDayLabel}{' '}
                                    {checkoutMock.eventTime} ·{' '}
                                    {checkoutMock.venue}
                                </p>
                            </div>
                        </div>

                        <div className='space-y-3 py-3 text-xs'>
                            <div className='flex justify-between'>
                                <span className='text-slate-500'>
                                    {checkoutMock.ticketType} ×{' '}
                                    {checkoutMock.quantity}
                                </span>
                                <span className='font-medium text-slate-900'>
                                    {formatCurrency(checkoutSubtotal)}
                                </span>
                            </div>

                            <div className='flex justify-between'>
                                <span className='text-slate-500'>
                                    Service fee
                                </span>
                                <span className='font-medium text-slate-900'>
                                    {formatCurrency(checkoutMock.serviceFee)}
                                </span>
                            </div>
                        </div>

                        <div className='flex items-center justify-between border-t border-slate-100 pt-3'>
                            <span className='text-xs font-bold text-slate-900'>
                                Total
                            </span>
                            <span className='text-xl font-extrabold text-slate-950'>
                                {formatCurrency(checkoutTotal)}
                            </span>
                        </div>
                    </div>

                    {/* Payment form */}
                    <form
                        id='checkout-form'
                        onSubmit={handlePayment}
                        noValidate
                        className='space-y-3 rounded-lg border border-slate-200 bg-white p-3'
                    >
                        <h2 className='text-sm font-bold text-slate-950'>
                            Pay with mobile money
                        </h2>

                        {/* Network selection */}
                        <fieldset>
                            <legend className='mb-2 text-[11px] font-medium text-slate-700'>
                                Network
                            </legend>

                            <div className='space-y-1.5'>
                                {Object.entries(NETWORK_LABELS).map(([item, label])  => (
                                    <label
                                        key={item}
                                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 transition ${
                                            selectedNetwork === item
                                                ? 'border-emerald-600 bg-emerald-50'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <input
                                            type='radio'
                                            value={item}
                                            {...register('network')}
                                            className='h-[18px] w-[18px] accent-emerald-600'
                                        />

                                        <span className='text-xs font-medium text-slate-900'>
                                            {label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {/* Phone number */}
                        <div>
                            <CustomInput
                                label='Mobile money number'
                                type='tel'
                                inputMode='numeric'
                                prefix='+233'
                                placeholder='24 412 3456'
                                autoComplete='tel-national'
                                error={errors.phoneNumber?.message}
                                className='h-10 rounded-md py-0 text-xs'
                                {...register('phoneNumber')}
                            />

                            <p className='mt-1.5 text-[10px] text-slate-500'>
                                You'll get a prompt on this phone to approve{' '}
                                {formatCurrency(checkoutTotal)}.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Fixed bottom actions */}
                <footer className='shrink-0 border-t border-slate-200 bg-white px-3 pb-4 pt-2'>
                    <button
                        type='submit'
                        form='checkout-form'
                        disabled={isExpired || isSubmitting}
                        className='flex h-10 w-full items-center justify-center rounded-sm bg-emerald-700 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400'
                    >
                        {isExpired
                            ? 'RESERVATION EXPIRED'
                            : `PAY ${formatCurrency(checkoutTotal)}`}
                    </button>

                    <button
                        type='button'
                        onClick={handleCancel}
                        className='mt-3 w-full text-center text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800'
                    >
                        Cancel and release tickets
                    </button>
                </footer>
            </section>
        </main>
    )
}