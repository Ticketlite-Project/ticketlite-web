
import type { TicketType } from '@/src/types/event-ticket.types'
import { useAuth } from '@/src/hooks/useAuth'
import { Lock } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CustomButton } from '../Button/custom-button'

type TicketSelectorProps = {
    event: {
        id: string
        title: string
        date: string
        time: string
        venue: string
    }
    ticketTypes: TicketType[]
    maxTicketsPerOrder: number
}

export default function TicketSelector({
    event,
    ticketTypes,
    maxTicketsPerOrder,
}: Readonly<TicketSelectorProps>) {
    const navigate = useNavigate()
    const location = useLocation()
    const { isAuthenticated, isInitializing } = useAuth()

    const [quantities, setQuantities] = useState<Record<string, number>>(
        () =>
            ticketTypes.reduce(
                (acc, ticket) => ({
                    ...acc,
                    [String(ticket.id)]: 0,
                }),
                {} as Record<string, number>
            )
    )

    const totalTickets = Object.values(quantities).reduce(
        (a, b) => a + b,
        0
    )

    const selectedTickets = ticketTypes
        .filter((ticket) => quantities[String(ticket.id)] > 0)
        .map((ticket) => ({
            id: ticket.id,
            name: ticket.name,
            price: ticket.price,
            currency: ticket.currency,
            quantity: quantities[String(ticket.id)],
            subtotal:
                ticket.price * quantities[String(ticket.id)],
        }))

    const totalPrice = selectedTickets.reduce(
        (total, ticket) => total + ticket.subtotal,
        0
    )

    const serviceFee = 0
    const total = totalPrice + serviceFee
    const currency = ticketTypes[0]?.currency ?? 'GHS'

    const handleCheckout = () => {
        if (isInitializing || totalTickets === 0) return

        if (!isAuthenticated) {
            navigate('/login', {
                state: { from: location },
            })
            return
        }

        navigate('/checkout', {
            state: {
                event,
                selectedTickets,
                quantity: totalTickets,
                subtotal: totalPrice,
                serviceFee,
                total,
                currency,
            },
        })
    }

    const handleIncrement = (id: string) => {
        const currentTotal = Object.values(quantities).reduce(
            (a, b) => a + b,
            0
        )

        const ticket = ticketTypes.find(
            (item) => String(item.id) === id
        )

        if (
            !ticket ||
            currentTotal >= maxTicketsPerOrder ||
            quantities[id] >= ticket.available
        ) {
            return
        }

        setQuantities((prev) => ({
            ...prev,
            [id]: (prev[id] ?? 0) + 1,
        }))
    }

    const handleDecrement = (id: string) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: Math.max(0, (prev[id] ?? 0) - 1),
        }))
    }

    return (
        <div className="sticky top-6 rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="mb-1 text-xl font-bold text-primary">
                Choose tickets
            </h2>

            <p className="mb-6 text-sm text-primary">
                Max {maxTicketsPerOrder} tickets per order
            </p>

            <div className="space-y-6">
                {ticketTypes.map((ticket) => {
                    const ticketId = String(ticket.id)
                    const selectedQuantity = quantities[ticketId] ?? 0

                    const isLowStock =
                        ticket.lowStockThreshold !== undefined &&
                        ticket.available <= ticket.lowStockThreshold

                    const canIncrement =
                        totalTickets < maxTicketsPerOrder &&
                        selectedQuantity < ticket.available

                    return (
                        <div
                            key={ticketId}
                            className="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                        >
                            <div className="flex-1 pr-4">
                                <h3 className="font-semibold text-primary">
                                    {ticket.name}
                                </h3>

                                <p className="text-lg font-bold text-[#1a6e44]">
                                    {ticket.currency}{' '}
                                    {ticket.price.toFixed(2)}
                                </p>

                                <p className="mt-1 text-xs text-primary">
                                    {isLowStock
                                        ? `Only ${ticket.available} left`
                                        : `${ticket.available} available`}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    aria-label="Remove a ticket"
                                    onClick={() =>
                                        handleDecrement(ticketId)
                                    }
                                    disabled={selectedQuantity === 0}
                                    className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 disabled:opacity-50"
                                >
                                    -
                                </button>

                                <span className="w-4 text-center font-medium">
                                    {selectedQuantity}
                                </span>

                                <button
                                    type="button"
                                    aria-label="Add one more ticket"
                                    onClick={() =>
                                        handleIncrement(ticketId)
                                    }
                                    disabled={!canIncrement}
                                    className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 disabled:opacity-50"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-8 border-t border-gray-200 pt-4">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-gray-600">
                        {totalTickets} ticket
                        {totalTickets !== 1 ? 's' : ''}
                    </span>

                    <span className="text-xl font-extrabold text-gray-900">
                        {currency} {total.toFixed(2)}
                    </span>
                </div>

                <CustomButton
                    variant="primary"
                    disabled={totalTickets === 0 || isInitializing}
                    onClick={handleCheckout}
                    className="w-full bg-[#1a6e44] py-3 font-bold text-white"
                >
                    CONTINUE TO CHECKOUT
                </CustomButton>

                <p className="flex items-center justify-center gap-1 pt-3 text-center text-xs text-gray-500">
                    <Lock className="h-3 w-3" />
                    Pay with mobile money. No card needed.
                </p>
            </div>
        </div>
    )
}
