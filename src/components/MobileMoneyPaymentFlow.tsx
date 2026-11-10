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
type PaymentStatus = 'waiting' | 'approved' | 'declined' | 'expired'

type SelectedTicket = {
    id: string
    name: string
    price: number
    currency: string
    quantity: number
    subtotal: number
}

interface PaymentDetails {
    phoneNumber: string
    network: Network
    amount: number
    currency: string
    eventId: string
    eventName: string
    selectedTickets: SelectedTicket[]
    quantity: number
    eventDate: string
    eventTime: string
    venue: string
    secondsLeft: number
}

type SavedTicket = {
    ticketId: string
    paymentReference: string
    eventName: string
    ticketType: string
    eventDate: string
    eventTime: string
    venue: string
    phoneNumber: string
    network: Network
    amount: number
    status: 'valid'
    createdAt: string
}

export default function MobileMoneyPaymentFlow() {
    const location = useLocation()
    const navigate = useNavigate()
    const payment = location.state as PaymentDetails | null

    const [status, setStatus] = useState<PaymentStatus>('waiting')
    const [secondsLeft, setSecondsLeft] = useState(payment?.secondsLeft ?? 600)

    useEffect(() => {
        if (status !== 'waiting') return

        if (secondsLeft <= 0) {
            const timer = window.setTimeout(() => setStatus('expired'), 0)
            return () => window.clearTimeout(timer)
        }

        const timer = window.setTimeout(() => {
            setSecondsLeft((previous) => Math.max(previous - 1, 0))
        }, 1000)

        return () => window.clearTimeout(timer)
    }, [secondsLeft, status])

    if (!payment || !Array.isArray(payment.selectedTickets) || payment.selectedTickets.length === 0) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
                <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">
                        No payment information found
                    </h2>
                    <p className="mt-3 text-sm text-slate-500">
                        Please return to checkout and select your tickets again.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="mt-6 w-full rounded-lg bg-emerald-700 py-3 font-bold text-white"
                    >
                        BROWSE EVENTS
                    </button>
                </div>
            </main>
        )
    }

    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
    const seconds = (secondsLeft % 60).toString().padStart(2, '0')

    const networkLabel: Record<Network, string> = {
        MTN: 'MTN Mobile Money',
        Telecel: 'Telecel Cash',
        AT: 'AT Money',
    }

    const formatAmount = (amount: number) =>
        `${payment.currency || 'GHS'} ${amount.toFixed(2)}`

    const buttonClass =
        'w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800'
    const secondaryClass =
        'w-full rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-slate-200'

    const retryPayment = () => {
        if (secondsLeft <= 0) {
            setStatus('expired')
            return
        }
        setStatus('waiting')
    }

    const goToCheckout = () => navigate('/checkout')

    const handleViewMyTickets = () => {
        const paymentReference = `MOMO-${Date.now()}`
        let ticketNumber = 0

        const newTickets: SavedTicket[] = payment.selectedTickets.flatMap((selected) =>
            Array.from({ length: selected.quantity }, () => {
                ticketNumber += 1
                return {
                    ticketId: `TL-${Date.now()}-${ticketNumber}`,
                    paymentReference,
                    eventName: payment.eventName,
                    ticketType: selected.name,
                    eventDate: payment.eventDate,
                    eventTime: payment.eventTime,
                    venue: payment.venue,
                    phoneNumber: payment.phoneNumber,
                    network: payment.network,
                    amount: selected.price,
                    status: 'valid' as const,
                    createdAt: new Date().toISOString(),
                }
            })
        )

        try {
            const existingTickets = JSON.parse(
                localStorage.getItem('ticketlite_tickets') || '[]'
            ) as SavedTicket[]

            localStorage.setItem(
                'ticketlite_tickets',
                JSON.stringify([...existingTickets, ...newTickets])
            )
            navigate('/my-tickets')
        } catch (error) {
            console.error('Unable to save tickets:', error)
        }
    }

    const ticketLines = payment.selectedTickets.filter((ticket) => ticket.quantity > 0)

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-sm">
                {status === 'waiting' && (
                    <>
                        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-8">
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={goToCheckout} aria-label="Back to checkout">
                                    <ArrowLeft size={20} />
                                </button>
                                <h2 className="text-lg font-bold">Payment</h2>
                            </div>
                            <span className="text-xs text-slate-500">Step 2 of 2</span>
                        </header>

                        <div className="flex items-center justify-between bg-lime-100 px-5 py-3 text-sm font-bold sm:px-8">
                            <span>Tickets held</span>
                            <span className="tabular-nums">{minutes}:{seconds}</span>
                        </div>

                        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-5 py-8 text-center sm:px-8">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-100">
                                <Smartphone className="text-emerald-700" size={30} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-950">
                                Approve on your phone
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
                                We sent a {networkLabel[payment.network]} prompt to{' '}
                                <strong className="text-slate-900">+233 {payment.phoneNumber}</strong>.
                                {' '}Enter your mobile money PIN to approve{' '}
                                <strong className="text-slate-900">{formatAmount(payment.amount)}</strong>.
                            </p>

                            <div className="mt-7 w-full overflow-hidden rounded-lg border text-left">
                                <div className="flex items-center gap-3 p-4">
                                    <CheckCircle2 className="text-emerald-600" size={20} />
                                    <span className="text-sm font-medium">Prompt sent to your phone</span>
                                </div>
                                <div className="flex items-center gap-3 border-y bg-emerald-50 p-4">
                                    <Clock3 className="text-emerald-700" size={20} />
                                    <span className="text-sm font-bold">Waiting for your approval</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 text-slate-400">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs">3</span>
                                    <span className="text-sm">Your QR tickets are issued</span>
                                </div>
                            </div>

                            <div className="mt-5 w-full rounded-lg border p-4 text-left">
                                <p className="font-bold text-slate-900">{payment.eventName}</p>
                                <div className="mt-3 space-y-2">
                                    {ticketLines.map((ticket) => (
                                        <div key={ticket.id} className="flex justify-between gap-4 text-sm">
                                            <span className="text-slate-600">
                                                {ticket.quantity} × {ticket.name}
                                            </span>
                                            <span className="font-medium text-slate-900">
                                                {formatAmount(ticket.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-3 text-xs text-slate-500">
                                    {payment.eventDate} · {payment.eventTime}
                                </p>
                                <p className="text-xs text-slate-500">{payment.venue}</p>
                            </div>

                            <p className="mt-6 text-xs text-slate-500">
                                Keep this screen open. It updates on its own.
                            </p>
                            <button type="button" onClick={goToCheckout} className={`${secondaryClass} mt-4 max-w-sm`}>
                                RETURN TO CHECKOUT
                            </button>

                            {import.meta.env.DEV && (
                                <div className="mt-6 w-full max-w-sm space-y-2 border-t pt-4">
                                    <p className="text-xs text-slate-400">Development testing controls</p>
                                    <button type="button" onClick={() => setStatus('approved')} className={buttonClass}>
                                        SIMULATE PAYMENT APPROVAL
                                    </button>
                                    <button type="button" onClick={() => setStatus('declined')} className={secondaryClass}>
                                        SIMULATE PAYMENT DECLINED
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {status === 'approved' && (
                    <>
                        <div className="bg-emerald-700 p-9 text-center text-white">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lime-400">
                                <Check size={35} className="text-emerald-900" />
                            </div>
                            <h1 className="text-3xl font-bold">You're in!</h1>
                            <p className="mt-3 text-sm">
                                {payment.quantity} tickets for <strong>{payment.eventName}</strong> are ready.
                            </p>
                            <p className="mt-4 text-xs font-semibold text-lime-200">
                                {formatAmount(payment.amount)} PAID
                            </p>
                        </div>

                        <div className="mx-auto w-full max-w-2xl flex-1 space-y-4 p-5 sm:p-8">
                            <div className="rounded-lg border border-slate-200 p-4">
                                <h2 className="font-bold text-slate-900">{payment.eventName}</h2>
                                <div className="mt-3 space-y-2">
                                    {ticketLines.map((ticket) => (
                                        <p key={ticket.id} className="text-sm text-slate-700">
                                            {ticket.quantity} × {ticket.name}
                                        </p>
                                    ))}
                                </div>
                                <p className="mt-3 text-sm text-slate-500">
                                    {payment.eventDate} · {payment.eventTime}
                                </p>
                                <p className="text-sm text-slate-500">{payment.venue}</p>
                            </div>

                            <div className="flex gap-3 rounded-lg bg-emerald-50 p-4">
                                <Mail size={18} className="shrink-0 text-emerald-700" />
                                <p className="text-sm text-slate-700">
                                    Your payment was approved. Your ticket confirmation will be sent to your registered email.
                                </p>
                            </div>
                        </div>

                        <div className="mx-auto w-full max-w-2xl space-y-2 p-5 sm:px-8">
                            <button type="button" onClick={handleViewMyTickets} className={buttonClass}>
                                VIEW MY TICKETS
                            </button>
                            <button type="button" onClick={() => navigate('/')} className={secondaryClass}>
                                BROWSE MORE EVENTS
                            </button>
                        </div>
                    </>
                )}

                {status === 'declined' && (
                    <>
                        <header className="flex items-center gap-3 border-b p-5">
                            <button type="button" onClick={goToCheckout} aria-label="Back to checkout">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-lg font-bold">Payment</h2>
                        </header>
                        <div className="flex justify-between bg-lime-100 px-5 py-3 text-sm font-bold">
                            <span>Tickets still held</span>
                            <span>{minutes}:{seconds}</span>
                        </div>
                        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center p-6 text-center">
                            <div className="mt-8 mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                                <X size={36} className="text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-950">Payment didn't go through</h1>
                            <p className="mt-4 text-sm leading-6 text-slate-600">
                                Your mobile money provider declined the payment. Please check your balance, PIN or payment prompt.
                            </p>
                            <div className="mt-7 w-full rounded-lg border p-4 text-left">
                                <p className="text-sm font-semibold">Common reasons</p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Not enough balance, an incorrect PIN, or a cancelled payment prompt.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto w-full max-w-xl space-y-2 p-5">
                            <button type="button" onClick={retryPayment} disabled={secondsLeft <= 0} className={`${buttonClass} disabled:bg-slate-400`}>
                                TRY AGAIN
                            </button>
                            <button type="button" onClick={goToCheckout} className={secondaryClass}>
                                USE ANOTHER NUMBER
                            </button>
                        </div>
                    </>
                )}

                {status === 'expired' && (
                    <>
                        <header className="flex items-center gap-3 border-b p-5">
                            <Clock3 size={20} />
                            <h2 className="text-lg font-bold">Checkout</h2>
                        </header>
                        <div className="flex justify-between bg-slate-700 px-5 py-3 text-sm font-bold text-white">
                            <span>Hold ended</span>
                            <span>00:00</span>
                        </div>
                        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center p-6 text-center">
                            <div className="mt-8 mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                <Clock3 size={35} className="text-slate-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-950">Your 10 minutes are up</h1>
                            <p className="mt-4 text-sm leading-6 text-slate-600">
                                Your reservation hold has expired. Please return to events and select tickets again if they are still available.
                            </p>
                            <div className="mt-7 w-full rounded-lg bg-emerald-50 p-4 text-left text-sm">
                                <p className="font-semibold text-slate-900">{payment.eventName}</p>
                                <div className="mt-2 space-y-1 text-slate-600">
                                    {ticketLines.map((ticket) => (
                                        <p key={ticket.id}>{ticket.quantity} × {ticket.name}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mx-auto w-full max-w-xl p-5">
                            <button type="button" onClick={() => navigate('/')} className={buttonClass}>
                                BROWSE EVENTS
                            </button>
                        </div>
                    </>
                )}
            </section>
        </main>
    )
}
