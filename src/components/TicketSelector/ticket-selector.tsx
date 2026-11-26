
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Lock, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'

import { CustomButton } from '../Button/custom-button'
import { useAuth } from '@/src/context/AuthContext'
import { apiClient } from '@/src/api/axios'
import type { TicketType } from '@/src/types/event-ticket.types'

type EventInfo = {
    id: string
    title: string
    date: string
    time: string
    venue: string
}

type TicketSelectorProps = {
    event: EventInfo
    ticketTypes: TicketType[]
    maxTicketsPerOrder: number
}

type SelectedTicket = {
    id: string | number
    name: string
    price: number
    currency: string
    quantity: number
    subtotal: number
}

type BookingItem = {
    ticket_type: number
    quantity: number
}

type BookingResponse = {
    id: number
    reference: string
    status: string
    total_amount: string | number
    expires_at: string
}

const SERVICE_FEE = 0

const formatCurrency = (amount: number, currency: string) =>
    `${currency} ${amount.toFixed(2)}`

export default function TicketSelector({
    event,
    ticketTypes,
    maxTicketsPerOrder,
}: TicketSelectorProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAuth()

    const [quantities, setQuantities] = useState<Record<string, number>>({})
    const [isCreatingReservation, setIsCreatingReservation] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const selectedTickets: SelectedTicket[] = ticketTypes
        .filter((ticket) => (quantities[String(ticket.id)] ?? 0) > 0)
        .map((ticket) => {
            const quantity = quantities[String(ticket.id)]

            return {
                id: ticket.id,
                name: ticket.name,
                price: Number(ticket.price),
                currency: ticket.currency || 'GHS',
                quantity,
                subtotal: Number(ticket.price) * quantity,
            }
        })

    const totalQuantity = selectedTickets.reduce(
        (sum, ticket) => sum + ticket.quantity,
        0
    )

    const subtotal = selectedTickets.reduce(
        (sum, ticket) => sum + ticket.subtotal,
        0
    )

    const currency = selectedTickets[0]?.currency || 'GHS'
    const total = subtotal + SERVICE_FEE

    const handleIncrement = (ticketId: string) => {
        setErrorMessage('')

        const ticket = ticketTypes.find(
            (item) => String(item.id) === ticketId
        )

        if (!ticket) return

        const currentQuantity = quantities[ticketId] ?? 0

        const ticketLimit = Math.min(
            ticket.available,
            ticket.maxPerOrder ?? maxTicketsPerOrder
        )

        if (currentQuantity >= ticketLimit) {
            setErrorMessage(
                `Only ${ticket.available} ${ticket.name} ticket(s) are available.`
            )
            return
        }

        if (totalQuantity >= maxTicketsPerOrder) {
            setErrorMessage(
                `You can only purchase ${maxTicketsPerOrder} ticket(s) per order.`
            )
            return
        }

        setQuantities((previous) => ({
            ...previous,
            [ticketId]: currentQuantity + 1,
        }))
    }

    const handleDecrement = (ticketId: string) => {
        setErrorMessage('')

        setQuantities((previous) => {
            const currentQuantity = previous[ticketId] ?? 0

            if (currentQuantity <= 1) {
                const updated = { ...previous }
                delete updated[ticketId]
                return updated
            }

            return {
                ...previous,
                [ticketId]: currentQuantity - 1,
            }
        })
    }

    const handleContinue = async () => {
        if (isCreatingReservation) return

        setErrorMessage('')

        if (!user) {
            navigate('/login', {
                state: {
                    from: location,
                },
            })
            return
        }

        if (selectedTickets.length === 0 || totalQuantity === 0) {
            setErrorMessage('Please select at least one ticket.')
            return
        }

        if (totalQuantity > maxTicketsPerOrder) {
            setErrorMessage(
                `You can only purchase ${maxTicketsPerOrder} ticket(s) per order.`
            )
            return
        }

        // The backend requires actual numeric ticket type IDs.
        // Mock IDs such as "tkt_live_vip" cannot be used.
        const bookingItems: BookingItem[] = []

        for (const ticket of selectedTickets) {
            const ticketTypeId = Number(ticket.id)

            if (
                !Number.isSafeInteger(ticketTypeId) ||
                ticketTypeId <= 0
            ) {
                setErrorMessage(
                    `Invalid ticket type ID for ${ticket.name}. Please load this event from the backend before making a reservation.`
                )
                return
            }

            bookingItems.push({
                ticket_type: ticketTypeId,
                quantity: ticket.quantity,
            })
        }

        setIsCreatingReservation(true)

        try {
            const response = await apiClient.post<BookingResponse>(
                '/bookings/create/',
                {
                    items: bookingItems,
                }
            )

            const booking = response.data

            if (
                !booking?.id ||
                !booking.reference ||
                !booking.expires_at
            ) {
                throw new Error(
                    'The booking response is missing its reservation ID, reference or expiry time.'
                )
            }

            navigate('/checkout', {
                state: {
                    event,
                    selectedTickets,
                    quantity: totalQuantity,
                    subtotal,
                    serviceFee: SERVICE_FEE,
                    total,
                    currency,

                    reservationId: booking.id,
                    bookingReference: booking.reference,
                    bookingExpiry: booking.expires_at,
                },
            })
        } catch (error: unknown) {
            console.error('Ticket reservation failed:', error)

            let message =
                'Unable to reserve your tickets. Please try again.'

            if (isAxiosError(error)) {
                const responseData = error.response?.data as
                    | {
                          message?: string
                          detail?: string
                      }
                    | undefined

                message =
                    responseData?.message ||
                    responseData?.detail ||
                    error.message ||
                    message
            } else if (error instanceof Error) {
                message = error.message
            }

            setErrorMessage(message)

            toast.error('Reservation failed', {
                description: message,
            })
        } finally {
            setIsCreatingReservation(false)
        }
    }

    return (
        <section className="space-y-5">
            <div className="space-y-4">
                {ticketTypes.map((ticket) => {
                    const ticketId = String(ticket.id)
                    const quantity = quantities[ticketId] ?? 0
                    const isSoldOut = ticket.available <= 0

                    return (
                        <div
                            key={ticketId}
                            className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-slate-900">
                                    {ticket.name}
                                </h3>

                                {ticket.description && (
                                    <p className="mt-1 text-sm text-slate-500">
                                        {ticket.description}
                                    </p>
                                )}

                                <p className="mt-2 font-semibold text-slate-900">
                                    {formatCurrency(
                                        Number(ticket.price),
                                        ticket.currency || 'GHS'
                                    )}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {isSoldOut
                                        ? 'Sold out'
                                        : `${ticket.available} available`}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleDecrement(ticketId)}
                                    disabled={
                                        quantity === 0 ||
                                        isCreatingReservation
                                    }
                                    aria-label={`Remove one ${ticket.name} ticket`}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Minus size={16} />
                                </button>

                                <span className="w-6 text-center font-bold tabular-nums text-slate-900">
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() => handleIncrement(ticketId)}
                                    disabled={
                                        isSoldOut ||
                                        isCreatingReservation
                                    }
                                    aria-label={`Add one ${ticket.name} ticket`}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {errorMessage && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                    {errorMessage}
                </div>
            )}

            <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex justify-between text-sm text-slate-600">
                    <span>Tickets selected</span>
                    <span className="font-semibold text-slate-900">
                        {totalQuantity}
                    </span>
                </div>

                <div className="mt-3 flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                        {formatCurrency(subtotal, currency)}
                    </span>
                </div>

                <div className="mt-3 flex justify-between text-sm text-slate-600">
                    <span>Service fee</span>
                    <span className="font-semibold text-slate-900">
                        {formatCurrency(SERVICE_FEE, currency)}
                    </span>
                </div>

                <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
                    <span className="font-bold text-slate-900">
                        Total
                    </span>

                    <span className="text-lg font-extrabold text-slate-900">
                        {formatCurrency(total, currency)}
                    </span>
                </div>
            </div>

            <CustomButton
                type="button"
                onClick={handleContinue}
                disabled={
                    totalQuantity === 0 ||
                    isCreatingReservation
                }
                className="w-full"
            >
                {isCreatingReservation
                    ? 'CREATING RESERVATION...'
                    : 'CONTINUE TO CHECKOUT'}
            </CustomButton>

            <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Lock size={13} />
                Your tickets will be reserved before payment.
            </p>
        </section>
    )
}
