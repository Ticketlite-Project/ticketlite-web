import { type EventData } from '@/lib/mock-data'
import { Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

type EventCardProps = {
    event: EventData
}

export default function EventCard({ event }: Readonly<EventCardProps>) {
    // Format date for the little calendar box (e.g., NOV 14)
    const dateObj = new Date(event.startDate)
    const month = dateObj
        .toLocaleString('en-US', { month: 'short' })
        .toUpperCase()
    const day = dateObj.getDate().toString().padStart(2, '0')

    return (
        <div className="flex flex-col group">
            {/* Image / Banner Area */}
            <div className="relative w-full aspect-4/3 bg-[#d1f4e0] rounded-2xl flex flex-col items-center justify-center text-[#2b7a56] mb-4">
                {/* Placeholder Icon (Ticket shape) */}
                <svg
                    aria-hidden="true"
                    className="w-16 h-16 opacity-30"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-4.42 4.8L12 14.5l-3.58 2.3 1.08-4.12-3.29-2.69 4.24-.25L12 5.8l1.54 3.95 4.24.25-3.29 2.69 1.09 4.11z" />
                </svg>

                {/* Date Box */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-1.5 flex flex-col items-center shadow-sm">
                    <span className="text-[10px] font-bold text-gray-500">
                        {month}
                    </span>
                    <span className="text-xl font-extrabold text-gray-900 leading-none">
                        {day}
                    </span>
                </div>

                {/* Tags */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <span className="bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-700 px-3 py-1 rounded-full uppercase">
                        {event.category}
                    </span>
                    {event.isSellingFast && (
                        <span className="bg-[#b3e6a1] text-[#1a5c38] text-xs font-bold px-3 py-1 rounded-full">
                            SELLING FAST
                        </span>
                    )}
                    {event.isFewLeft && (
                        <span className="bg-[#b3e6a1] text-[#1a5c38] text-xs font-bold px-3 py-1 rounded-full">
                            FEW LEFT
                        </span>
                    )}
                </div>
            </div>

            {/* Details Area */}
            <div className="flex flex-col flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-[#1a6e44] transition-colors">
                    <Link to={`/events/${event.id}`}>{event.title}</Link>
                </h3>

                <div className="space-y-1.5 mb-6 flex-1">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{event.location}</span>
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>
                            {dateObj.toLocaleString('en-US', {
                                weekday: 'short',
                            })}{' '}
                            · {event.time}
                        </span>
                    </p>
                </div>

                {/* Footer (Price & CTA) */}
                <div className="flex items-end justify-between border-t border-gray-100 pt-3">
                    <div>
                        <p className="text-xs text-gray-500">From</p>
                        {event.isSoldOut ? (
                            <p className="text-lg font-bold text-gray-400">
                                CHS {event.priceFrom.toFixed(2)}
                            </p>
                        ) : (
                            <p className="text-lg font-bold text-gray-900">
                                CHS {event.priceFrom.toFixed(2)}
                            </p>
                        )}
                    </div>

                    {event.isSoldOut ? (
                        <span className="text-sm font-bold text-gray-400 pb-1">
                            SOLD OUT
                        </span>
                    ) : (
                        <Link
                            to={`/events/${event.id}`}
                            className="text-sm font-bold text-[#1a6e44] hover:underline pb-1"
                        >
                            GET TICKETS
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
