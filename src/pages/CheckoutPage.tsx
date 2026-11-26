
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowLeft, Timer } from 'lucide-react'
import { CustomInput } from '../components/forms'
import { apiClient } from '@/src/api/axios'

type Network = 'MTN' | 'Telecel' | 'AT'

type SelectedTicket = {
    id: string | number
    name: string
    price: number
    currency: string
    quantity: number
    subtotal: number
}

type CheckoutState = {
    event: {
        id: string
        title: string
        date: string
        time: string
        venue: string
    }
    selectedTickets: SelectedTicket[]
    quantity: number
    subtotal: number
    serviceFee: number
    total: number
    currency: string

    // Created by /bookings/create/ in TicketSelector
    reservationId: number
    bookingReference: string
    bookingExpiry: string
}

type InitiatePaymentResponse = {
    message: string
    payment: {
        id: number
        reservation: number
        provider: string
        phone_number: string
        amount: string
        reference: string
        status: string
        created_at: string
        updated_at: string
    }
}

const NETWORK_LABELS: Record<Network, string> = {
    MTN: 'MTN Mobile Money',
    Telecel: 'Telecel Cash',
    AT: 'AT Money',
}

const PROVIDER_VALUES: Record<Network, string> = {
    MTN: 'MTN',
    Telecel: 'TELECEL',
    AT: 'AT',
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

const formatCurrency = (amount: number, currency: string) =>
    `${currency} ${amount.toFixed(2)}`

const getRemainingSeconds = (expiry?: string) => {
    if (!expiry) return 0

    const expiryTime = new Date(expiry).getTime()

    if (Number.isNaN(expiryTime)) return 0

    return Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000))
}

export default function CheckoutPage() {
    const navigate = useNavigate()
    const location = useLocation()

    const checkout = location.state as CheckoutState | null

    const [secondsLeft, setSecondsLeft] = useState(() =>
        getRemainingSeconds(checkout?.bookingExpiry)
    )
    const [paymentError, setPaymentError] = useState('')

    const expiryRequestSent = useRef(false)

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

    // Keep the countdown synchronized with the backend reservation expiry.
    useEffect(() => {
        if (!checkout?.bookingExpiry) return

        const updateCountdown = () => {
            setSecondsLeft(getRemainingSeconds(checkout.bookingExpiry))
        }

        updateCountdown()

        const interval = window.setInterval(updateCountdown, 1000)

        return () => window.clearInterval(interval)
    }, [checkout?.bookingExpiry])

    const minutes = Math.floor(secondsLeft / 60)
        .toString()
        .padStart(2, '0')

    const seconds = (secondsLeft % 60)
        .toString()
        .padStart(2, '0')

    const isExpired = secondsLeft <= 0

    const hasValidCheckout =
        !!checkout?.event &&
        Array.isArray(checkout.selectedTickets) &&
        checkout.selectedTickets.length > 0 &&
        checkout.selectedTickets.some((ticket) => ticket.quantity > 0) &&
        Number.isInteger(checkout.reservationId) &&
        checkout.reservationId > 0 &&
        !!checkout.bookingExpiry

    const selectedTickets =
        checkout?.selectedTickets?.filter(
            (ticket) => ticket.quantity > 0
        ) ?? []

    const quantity = selectedTickets.reduce(
        (sum, ticket) => sum + ticket.quantity,
        0
    )

    const currency =
        checkout?.currency ||
        selectedTickets[0]?.currency ||
        'GHS'

    // The backend endpoint expires pending reservations whose expiry
    // time has passed. Do not call it before the reservation expires.
    useEffect(() => {
        if (
            !isExpired ||
            !checkout?.reservationId ||
            expiryRequestSent.current
        ) {
            return
        }

        expiryRequestSent.current = true

        apiClient
            .post('/bookings/expire/')
            .catch((error) => {
                console.error('Reservation expiry request failed:', error)
            })
    }, [isExpired, checkout?.reservationId])

    const handlePayment = handleSubmit(async (values) => {
        setPaymentError('')

        if (isExpired || !checkout || !hasValidCheckout) {
            setPaymentError(
                'Your reservation is missing or has expired. Please select your tickets again.'
            )
            return
        }

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

        try {
            // The reservation was already created in TicketSelector.
            // Do not create another reservation here.
            const response =
                await apiClient.post<InitiatePaymentResponse>(
                    '/payments/initiate/',
                    {
                        reservation: checkout.reservationId,
                        provider: PROVIDER_VALUES[result.data.network],
                        phone_number: `0${result.data.phoneNumber}`,
                    }
                )

            const paymentData = response.data?.payment

            if (!paymentData?.id) {
                throw new Error(
                    'The payment response did not contain a payment ID.'
                )
            }

            navigate('/payment/mobile-money', {
                state: {
                    phoneNumber: `0${result.data.phoneNumber}`,
                    network: result.data.network,
                    amount: checkout.total,
                    currency,
                    eventName: checkout.event.title,
                    eventId: checkout.event.id,
                    eventDate: checkout.event.date,
                    eventTime: checkout.event.time,
                    venue: checkout.event.venue,
                    selectedTickets,
                    quantity,
                    secondsLeft,
                    bookingReference: checkout.bookingReference,
                    bookingExpiry: checkout.bookingExpiry,
                    paymentId: paymentData.id,
                    reservationId: checkout.reservationId,
                    paymentReference: paymentData.reference,
                    initialPaymentStatus: paymentData.status,
                },
            })
        } catch (error) {
            console.error('Payment initiation failed:', error)

            setPaymentError(
                'Unable to initiate your payment. Please check your details and try again.'
            )
        }
    })

    const handleCancel = () => {
        const confirmed = window.confirm(
            'Are you sure you want to leave checkout? Your reservation will remain pending until it expires.'
        )

        if (!confirmed) return

        // No reservation cancellation endpoint has been provided.
        // The reservation will expire according to its backend expiry time.
        navigate('/events', { replace: true })
    }

    if (!hasValidCheckout || !checkout) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
                <section className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-sm">
                    <h1 className="text-xl font-bold text-slate-900">
                        Reservation unavailable
                    </h1>

                    <p className="mt-3 text-sm text-slate-600">
                        Your reservation details are missing or invalid.
                        Please select your tickets again.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate('/events')}
                        className="mt-6 rounded-lg bg-emerald-700 px-6 py-3 font-bold text-white hover:bg-emerald-800"
                    >
                        BROWSE EVENTS
                    </button>
                </section>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-sm">
                <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-8">
                    <button
                        type="button"
                        className="flex items-center gap-3 font-bold text-slate-900"
                        aria-label="Go back"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} />
                        <span>Checkout</span>
                    </button>

                    <span className="text-xs text-slate-500">
                        Step 1 of 2
                    </span>
                </header>

                <div className="flex flex-col gap-8 p-5 sm:p-8 lg:flex-row">
                    <div className="min-w-0 flex-1 space-y-6">
                        <div className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-lime-100 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <Timer
                                    size={22}
                                    className="shrink-0 text-slate-900"
                                />

                                <div>
                                    <p className="text-sm font-bold text-slate-950">
                                        Tickets held for you
                                    </p>

                                    <p className="text-xs text-slate-700">
                                        Complete payment before the timer ends
                                    </p>
                                </div>
                            </div>

                            <span className="text-xl font-extrabold tabular-nums text-slate-950">
                                {minutes}:{seconds}
                            </span>
                        </div>

                        {isExpired && (
                            <div
                                role="alert"
                                className="rounded-lg border border-red-200 bg-red-50 p-4"
                            >
                                <p className="font-bold text-red-800">
                                    Reservation expired
                                </p>

                                <p className="mt-1 text-sm text-red-700">
                                    Your ticket reservation has expired.
                                    Please select your tickets again.
                                </p>
                            </div>
                        )}

                        <section className="rounded-lg border border-slate-200 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                Event
                            </p>

                            <h1 className="mt-2 text-xl font-bold text-slate-950">
                                {checkout.event.title}
                            </h1>

                            <p className="mt-1 text-sm text-slate-600">
                                {checkout.event.date} · {checkout.event.time}
                            </p>

                            <p className="text-sm text-slate-600">
                                {checkout.event.venue}
                            </p>

                            {checkout.bookingReference && (
                                <p className="mt-3 text-xs text-slate-500">
                                    Reservation reference:{' '}
                                    <span className="font-semibold text-slate-700">
                                        {checkout.bookingReference}
                                    </span>
                                </p>
                            )}
                        </section>

                        <form
                            id="checkout-form"
                            onSubmit={handlePayment}
                            noValidate
                            className="space-y-5 rounded-lg border border-slate-200 p-5"
                        >
                            <h2 className="text-lg font-bold text-slate-950">
                                Pay with mobile money
                            </h2>

                            <fieldset>
                                <legend className="mb-3 text-sm font-medium text-slate-700">
                                    Select your network
                                </legend>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    {Object.entries(NETWORK_LABELS).map(
                                        ([item, label]) => (
                                            <label
                                                key={item}
                                                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition ${
                                                    selectedNetwork === item
                                                        ? 'border-emerald-600 bg-emerald-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    value={item}
                                                    {...register('network')}
                                                    className="h-4 w-4 accent-emerald-600"
                                                />

                                                <span className="text-sm font-medium text-slate-900">
                                                    {label}
                                                </span>
                                            </label>
                                        )
                                    )}
                                </div>
                            </fieldset>

                            <div>
                                <CustomInput
                                    label="Mobile money number"
                                    type="tel"
                                    inputMode="numeric"
                                    prefix="+233"
                                    placeholder="24 412 3456"
                                    autoComplete="tel-national"
                                    error={errors.phoneNumber?.message}
                                    className="h-11"
                                    {...register('phoneNumber')}
                                />

                                <p className="mt-2 text-xs text-slate-500">
                                    You'll receive a prompt to approve{' '}
                                    {formatCurrency(checkout.total, currency)}.
                                </p>
                            </div>

                            {paymentError && (
                                <div
                                    role="alert"
                                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                                >
                                    {paymentError}
                                </div>
                            )}
                        </form>
                    </div>

                    <aside className="h-fit w-full rounded-lg border border-slate-200 p-5 lg:max-w-sm">
                        <h2 className="text-lg font-bold text-slate-950">
                            Order summary
                        </h2>

                        <div className="mt-4 space-y-4">
                            {selectedTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="flex justify-between gap-4 text-sm"
                                >
                                    <span className="text-slate-600">
                                        {ticket.name} × {ticket.quantity}
                                    </span>

                                    <span className="shrink-0 font-medium text-slate-900">
                                        {formatCurrency(
                                            ticket.subtotal,
                                            currency
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">
                                    Subtotal
                                </span>

                                <span className="font-medium">
                                    {formatCurrency(
                                        checkout.subtotal,
                                        currency
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-600">
                                    Service fee
                                </span>

                                <span className="font-medium">
                                    {formatCurrency(
                                        checkout.serviceFee,
                                        currency
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                            <span className="font-bold text-slate-900">
                                Total
                            </span>

                            <span className="text-xl font-extrabold text-slate-950">
                                {formatCurrency(checkout.total, currency)}
                            </span>
                        </div>
                    </aside>
                </div>

                <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-5 sm:flex-row sm:justify-end sm:px-8">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-lg px-5 py-3 text-sm font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                    >
                        Leave checkout
                    </button>

                    <button
                        type="submit"
                        form="checkout-form"
                        disabled={isExpired || isSubmitting}
                        className="rounded-lg bg-emerald-700 px-7 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                        {isExpired
                            ? 'RESERVATION EXPIRED'
                            : isSubmitting
                              ? 'PLEASE WAIT...'
                              : `PAY ${formatCurrency(checkout.total, currency)}`}
                    </button>
                </footer>
            </section>
        </main>
    )
}
