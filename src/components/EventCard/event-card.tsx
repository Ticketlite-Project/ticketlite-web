import type { EventData } from '@/src/types/event-ticket.types'
import { Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import TicketCard from '../TicketCard/ticket-card'

type EventCardProps = {
    event: EventData
}

export default function EventCard({ event }: Readonly<EventCardProps>) {
    // Format date for the little calendar box (e.g., NOV 14)
    const dateObj = new Date(event.startDate)
    // const month = dateObj
    //     .toLocaleString('en-US', { month: 'short' })
    //     .toUpperCase()
    // const day = dateObj.getDate().toString().padStart(2, '0')

    return (
        <div className="flex flex-col group shadow border bg-card rounded">
            {/* Image / Banner Area */}
            <TicketCard event={event} className="mb-4" />

            {/* Details Area */}
            <div className="flex flex-col flex-1 gap-2 p-3">
                <h3 className="text-lg font-bold text-primary leading-tight mb-2 group-hover:text-[#1a6e44] transition-colors">
                    <Link to={`/events/${event.id}`}>{event.title}</Link>
                </h3>

                <div className="space-y-1.5 mb-6 flex-1 gap-3">
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
                            <p className="text-lg font-bold text-primary ">
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
