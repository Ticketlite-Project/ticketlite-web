
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Clock3,
    Mail,
    Smartphone,
    X,
} from 'lucide-react'

type Network = 'MTN' | 'Telecel' | 'AT'

type PaymentStatus =
    | 'waiting'
    | 'approved'
    | 'declined'
    | 'expired'

interface PaymentDetails {
    phoneNumber: string
    network: Network
    amount: number
    eventName: string
    ticketType: string
    quantity: number
    eventDate: string
    eventTime: string
    venue: string
    secondsLeft: number
}

export default function MobileMoneyPaymentFlow() {
    const location = useLocation()
    const navigate = useNavigate()

    const payment = location.state as PaymentDetails | null

    const [status, setStatus] = useState<PaymentStatus>('waiting')

    const [secondsLeft, setSecondsLeft] = useState(
        payment?.secondsLeft ?? 600
    )

    // Countdown timer
    useEffect(() => {
        if (status !== 'waiting') return

        if (secondsLeft <= 0) {
            setSecondsLeft(0)
            setStatus('expired')
            return
        }

        const timer = window.setTimeout(() => {
            setSecondsLeft((previous) =>
                Math.max(previous - 1, 0)
            )
        }, 1000)

        return () => window.clearTimeout(timer)
    }, [secondsLeft, status])

    // Protect payment route from direct access without checkout data
    if (!payment) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-100 p-5">
                <div className="bg-white rounded-xl p-8 text-center shadow-lg max-w-sm w-full">
                    <h2 className="font-bold text-xl text-slate-900">
                        No payment information found
                    </h2>

                    <p className="text-sm text-slate-500 mt-3">
                        Please return to checkout and complete your
                        payment details.
                    </p>

                    <button
                        onClick={() => navigate('/checkout')}
                        className="mt-6 w-full rounded-lg bg-emerald-700 py-3 text-white font-bold"
                    >
                        RETURN TO CHECKOUT
                    </button>
                </div>
            </main>
        )
    }

    const minutes = Math.floor(secondsLeft / 60)
        .toString()
        .padStart(2, '0')

    const seconds = (secondsLeft % 60)
        .toString()
        .padStart(2, '0')

    const networkLabel: Record<Network, string> = {
        MTN: 'MTN Mobile Money',
        Telecel: 'Telecel Cash',
        AT: 'AT Money',
    }

    const formatAmount = (amount: number) =>
        `GHS ${amount.toFixed(2)}`

    const buttonClass =
        'w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-3 rounded-sm transition-colors'

    const secondaryClass =
        'w-full bg-gray-100 hover:bg-gray-200 text-emerald-700 font-bold text-xs py-3 rounded-sm transition-colors'

    const retryPayment = () => {
        if (secondsLeft <= 0) {
            setStatus('expired')
            return
        }

        setStatus('waiting')
    }

    const goToCheckout = () => {
        navigate('/checkout')
    }

    
const handleViewMyTickets = () => {
    if (!payment) return

    const paymentReference = `MOMO-${Date.now()}`

    const newTickets = Array.from(
        { length: payment.quantity },
        (_, index) => ({
            ticketId: `TL-${Date.now()}-${index + 1}`,
            paymentReference,
            eventName: payment.eventName,
            ticketType: payment.ticketType,
            eventDate: payment.eventDate,
            eventTime: payment.eventTime,
            venue: payment.venue,
            phoneNumber: payment.phoneNumber,
            network: payment.network,
            amount: payment.amount / payment.quantity,
            status: 'valid' as const,
            createdAt: new Date().toISOString(),
        })
    )

    try {
        const existingTickets = JSON.parse(
            localStorage.getItem('ticketlite_tickets') || '[]'
        )

        const updatedTickets = [
            ...existingTickets,
            ...newTickets,
        ]

        localStorage.setItem(
            'ticketlite_tickets',
            JSON.stringify(updatedTickets)
        )

        navigate('/my-tickets')
    } catch (error) {
        console.error('Unable to save tickets:', error)
    }
}


    return (
        <main className="min-h-screen bg-[#eeeeee] flex items-center justify-center p-4">

            <section className="w-full max-w-[390px] min-h-[844px] bg-white shadow-xl flex flex-col overflow-hidden sm:rounded-xl">

                {/* WAITING FOR APPROVAL */}
                {status === 'waiting' && (
                    <>
                        <header className="h-[52px] shrink-0 flex items-center justify-between px-5 border-b">
                            <h2 className="font-bold text-lg">
                                Payment
                            </h2>

                            <span className="text-xs text-gray-500">
                                Step 2 of 2
                            </span>
                        </header>

                        {/* Reservation timer */}
                        <div className="bg-lime-200 px-4 py-3 flex justify-between text-sm font-bold">
                            <span>Tickets held</span>
                            <span className="tabular-nums">
                                {minutes}:{seconds}
                            </span>
                        </div>

                        <div className="flex-1 p-6 flex flex-col items-center text-center">

                            <div className="w-20 h-20 rounded-full border-4 border-emerald-100 flex items-center justify-center mt-8 mb-5">
                                <Smartphone
                                    className="text-emerald-700"
                                    size={30}
                                />
                            </div>

                            <h1 className="text-2xl font-bold text-gray-950">
                                Approve on your phone
                            </h1>

                            <p className="text-gray-500 text-sm leading-6 mt-4">
                                We sent a {networkLabel[payment.network]}{' '}
                                prompt to{' '}
                                <strong className="text-gray-900">
                                    +233 {payment.phoneNumber}
                                </strong>
                                . Enter your mobile money PIN to approve{' '}
                                <strong className="text-gray-900">
                                    {formatAmount(payment.amount)}
                                </strong>.
                            </p>

                            {/* Payment progress */}
                            <div className="w-full border rounded-lg mt-7 text-left overflow-hidden">

                                <div className="p-3 flex items-center gap-3">
                                    <CheckCircle2
                                        className="text-emerald-600"
                                        size={20}
                                    />
                                    <span className="text-sm font-medium">
                                        Prompt sent to your phone
                                    </span>
                                </div>

                                <div className="p-3 flex items-center gap-3 bg-emerald-50 border-y">
                                    <Clock3
                                        className="text-emerald-700"
                                        size={20}
                                    />
                                    <span className="text-sm font-bold">
                                        Waiting for your approval
                                    </span>
                                </div>

                                <div className="p-3 flex items-center gap-3 text-gray-400">
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                        3
                                    </span>

                                    <span className="text-sm">
                                        Your QR tickets are issued
                                    </span>
                                </div>
                            </div>

                            {/* Ticket summary */}
                            <div className="w-full mt-5 rounded-lg border p-3 text-left">
                                <p className="text-sm font-bold text-gray-900">
                                    {payment.eventName}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                    {payment.quantity} × {payment.ticketType}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {payment.eventDate} · {payment.eventTime}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {payment.venue}
                                </p>
                            </div>

                            <p className="text-xs text-gray-500 mt-auto mb-4">
                                Keep this screen open. It updates on its own.
                            </p>

                            <button
                                type="button"
                                onClick={goToCheckout}
                                className={secondaryClass}
                            >
                                RETURN TO CHECKOUT
                            </button>

                            {/* Development-only simulation controls */}
                            {import.meta.env.DEV && (
                                <div className="w-full mt-5 border-t pt-4 space-y-2">
                                    <p className="text-xs text-gray-400">
                                        Development testing controls
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setStatus('approved')}
                                        className={buttonClass}
                                    >
                                        SIMULATE PAYMENT APPROVAL
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStatus('declined')}
                                        className={secondaryClass}
                                    >
                                        SIMULATE PAYMENT DECLINED
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* PAYMENT APPROVED */}
                {status === 'approved' && (
                    <>
                        <div className="bg-emerald-700 text-white text-center p-9">

                            <div className="w-16 h-16 rounded-full bg-lime-400 flex items-center justify-center mx-auto mb-4">
                                <Check
                                    size={35}
                                    className="text-emerald-900"
                                />
                            </div>

                            <h1 className="text-3xl font-bold">
                                You're in!
                            </h1>

                            <p className="mt-3 text-sm">
                                {payment.quantity} tickets for{' '}
                                <strong>{payment.eventName}</strong> are ready.
                            </p>

                            <p className="text-xs mt-4 text-lime-200 font-semibold">
                                {formatAmount(payment.amount)} PAID
                            </p>
                        </div>

                        <div className="p-5 space-y-4 flex-1">

                            <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
                                <div className="grid grid-cols-4 gap-1 bg-white p-1">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-3 w-3 ${
                                                [0, 1, 3, 4, 6, 8, 9, 11, 12, 14].includes(i)
                                                    ? 'bg-black'
                                                    : 'bg-white'
                                            }`}
                                        />
                                    ))}
                                </div>

                                <div>
                                    <p className="font-bold text-gray-900">
                                        {payment.quantity} × {payment.ticketType}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {payment.eventDate} · {payment.eventTime}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {payment.venue}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-emerald-50 rounded-lg p-4 flex gap-3">
                                <Mail
                                    size={18}
                                    className="text-emerald-700 shrink-0"
                                />

                                <p className="text-sm text-gray-700">
                                    Your payment was approved.
                                    Your ticket confirmation will be
                                    sent to your registered email.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 space-y-2">
                            <button
    type="button"
    onClick={handleViewMyTickets}
    className={buttonClass}
>
    VIEW MY TICKETS
</button>

                            <button
                                onClick={() => navigate('/events')}
                                className={secondaryClass}
                            >
                                BROWSE MORE EVENTS
                            </button>
                        </div>
                    </>
                )}

                {/* PAYMENT DECLINED */}
                {status === 'declined' && (
                    <>
                        <header className="p-5 border-b flex items-center gap-3">
                            <button
                                type="button"
                                onClick={goToCheckout}
                                aria-label="Back to checkout"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <h2 className="font-bold text-lg">
                                Payment
                            </h2>
                        </header>

                        <div className="bg-lime-200 px-4 py-3 flex justify-between text-sm font-bold">
                            <span>Tickets still held</span>
                            <span>{minutes}:{seconds}</span>
                        </div>

                        <div className="flex-1 p-6 flex flex-col items-center text-center">

                            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mt-8 mb-5">
                                <X size={36} className="text-red-600" />
                            </div>

                            <h1 className="text-2xl font-bold text-gray-950">
                                Payment didn't go through
                            </h1>

                            <p className="text-gray-500 text-sm leading-6 mt-4">
                                Your mobile money provider declined the
                                payment. Please check your balance, PIN
                                or payment prompt.
                            </p>

                            <div className="border rounded-lg p-4 mt-7 w-full text-left">
                                <p className="font-semibold text-sm">
                                    Common reasons
                                </p>

                                <p className="text-sm text-gray-500 mt-1">
                                    Not enough balance, an incorrect PIN,
                                    or a cancelled payment prompt.
                                </p>
                            </div>
                        </div>

                        <div className="p-5 space-y-2">
                            <button
                                onClick={retryPayment}
                                disabled={secondsLeft <= 0}
                                className={`${buttonClass} disabled:bg-gray-400`}
                            >
                                TRY AGAIN
                            </button>

                            <button
                                onClick={goToCheckout}
                                className={secondaryClass}
                            >
                                USE ANOTHER NUMBER
                            </button>
                        </div>
                    </>
                )}

                {/* HOLD EXPIRED */}
                {status === 'expired' && (
                    <>
                        <header className="p-5 border-b flex items-center gap-3">
                            <ArrowLeft size={20} />
                            <h2 className="font-bold text-lg">
                                Checkout
                            </h2>
                        </header>

                        <div className="bg-gray-700 text-white px-4 py-3 flex justify-between text-sm font-bold">
                            <span>Hold ended</span>
                            <span>0:00</span>
                        </div>

                        <div className="flex-1 p-6 flex flex-col items-center text-center">

                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mt-8 mb-5">
                                <Clock3
                                    size={35}
                                    className="text-gray-600"
                                />
                            </div>

                            <h1 className="text-2xl font-bold text-gray-950">
                                Your 10 minutes are up
                            </h1>

                            <p className="text-gray-500 text-sm leading-6 mt-4">
                                Your reservation hold has expired.
                                Please return to events and select tickets
                                again if they are still available.
                            </p>

                            <div className="bg-emerald-50 rounded-lg p-4 mt-7 w-full text-sm text-left">
                                <p className="font-semibold text-gray-900">
                                    {payment.eventName}
                                </p>
                                <p className="text-gray-600 mt-1">
                                    {payment.quantity} × {payment.ticketType}
                                </p>
                            </div>
                        </div>

                        <div className="p-5">
                            <button
                                onClick={() => navigate('/events')}
                                className={buttonClass}
                            >
                                BROWSE EVENTS
                            </button>
                        </div>
                    </>
                )}
            </section>
        </main>
    )
}
