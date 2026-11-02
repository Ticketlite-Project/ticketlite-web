import type { TicketType } from '@/lib/mock-data'
import { Lock } from 'lucide-react'
import { useState } from 'react'
import { CustomButton } from '../Button/custom-button'

type TicketSelectorProps = {
    ticketTypes: TicketType[]
    maxTicketsPerOrder: number
}

export default function TicketSelector({
    ticketTypes,
    maxTicketsPerOrder,
}: Readonly<TicketSelectorProps>) {
    const [quantities, setQuantities] = useState<Record<string, number>>(
        ticketTypes.reduce((acc, ticket) => ({ ...acc, [ticket.id]: 0 }), {})
    )

    const handleIncrement = (id: string) => {
        const currentTotal = Object.values(quantities).reduce(
            (a, b) => a + b,
            0
        )
        if (currentTotal >= maxTicketsPerOrder) return
        setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }))
    }

    const handleDecrement = (id: string) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: Math.max(0, prev[id] - 1),
        }))
    }

    const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0)

    const totalPrice = ticketTypes.reduce(
        (total, ticket) => total + quantities[ticket.id] * ticket.price,
        0
    )

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
                Choose tickets
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Max {maxTicketsPerOrder} tickets per order
            </p>

            <div className="space-y-6">
                {ticketTypes.map((ticket) => {
                    const isLowStock =
                        ticket.lowStockThreshold &&
                        ticket.available <= ticket.lowStockThreshold
                    const canIncrement = totalTickets < maxTicketsPerOrder

                    return (
                        <div
                            key={ticket.id}
                            className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                        >
                            <div className="flex-1 pr-4">
                                <h3 className="font-semibold text-gray-900">
                                    {ticket.name}
                                </h3>
                                <p className="text-lg font-bold text-[#1a6e44]">
                                    {ticket.currency} {ticket.price.toFixed(2)}
                                </p>
                                {isLowStock ? (
                                    <p className="text-xs text-red-500 font-medium mt-1">
                                        Only {ticket.available} left
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {ticket.available} available
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDecrement(ticket.id)}
                                    disabled={quantities[ticket.id] === 0}
                                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    -
                                </button>
                                <span className="w-4 text-center font-medium">
                                    {quantities[ticket.id]}
                                </span>
                                <button
                                    onClick={() => handleIncrement(ticket.id)}
                                    disabled={!canIncrement}
                                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">
                        {totalTickets} ticket{totalTickets !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xl font-extrabold text-gray-900">
                        GHS {totalPrice.toFixed(2)}
                    </span>
                </div>
                <CustomButton
                    variant="primary"
                    disabled={totalTickets === 0}
                    className="w-full bg-[#1a6e44] hover:bg-[#145c38] text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    CONTINUE TO CHECKOUT
                </CustomButton>
                <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    Pay with mobile money. No card needed.
                </p>
            </div>
        </div>
    )
}
