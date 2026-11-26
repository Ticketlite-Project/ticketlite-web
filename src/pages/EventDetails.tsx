
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import TicketSelector from '@/src/components/TicketSelector/ticket-selector'
import { apiClient } from '@/src/api/axios'
import type { TicketType } from '@/src/types/event-ticket.types'
import { motion } from 'framer-motion'
import {
    ArrowRight,
    Calendar,
    Image as ImageIcon,
    MapPin,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'

interface ApiTicketType {
    id: number
    name: string
    description?: string
    price: string | number
    quantity: number
}

interface ApiEvent {
    id: number
    title: string
    category: string
    city: string
    description: string
    venue: string
    start_date: string
    end_date: string
    banner_image: string | null
    status: string
    ticket_types: ApiTicketType[]
    organizer?: string | { name?: string }
    doors_open?: string
    address?: string
}

interface PublishedEventsResponse {
    results?: ApiEvent[]
    data?: ApiEvent[]
    events?: ApiEvent[]
}

function getEvents(response: unknown): ApiEvent[] {
    if (Array.isArray(response)) {
        return response as ApiEvent[]
    }

    if (response && typeof response === 'object') {
        const payload = response as PublishedEventsResponse

        if (Array.isArray(payload.results)) return payload.results
        if (Array.isArray(payload.data)) return payload.data
        if (Array.isArray(payload.events)) return payload.events
    }

    return []
}

function formatDate(dateString: string) {
    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) return dateString

    return date.toLocaleDateString('en-GH', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

function formatTime(dateString: string) {
    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleTimeString('en-GH', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

function formatCategory(category: string) {
    const categories: Record<string, string> = {
        MUSIC: 'Music',
        CHURCH: 'Church',
        CAMPUS: 'Campus',
        TECH_MEETUPS: 'Tech & Meetups',
        SPORTS: 'Sports',
        ARTS_CULTURE: 'Arts & Culture',
    }

    return categories[category] ?? category
}

export default function EventDetails() {
    const { id } = useParams<{ id: string }>()

    const [event, setEvent] = useState<ApiEvent | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isMounted = true

        async function fetchEvent() {
            if (!id) {
                setError('Event ID is missing.')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError('')

                const response = await apiClient.get('/events/published/')
                const events = getEvents(response.data)

                const foundEvent = events.find(
                    (item) => String(item.id) === String(id)
                )

                if (!isMounted) return

                if (!foundEvent) {
                    setError('This event could not be found.')
                    setEvent(null)
                    return
                }

                setEvent(foundEvent)
            } catch (err: unknown) {
                if (!isMounted) return

                if (isAxiosError(err)) {
                    const data = err.response?.data as
                        | { message?: string; detail?: string }
                        | undefined

                    setError(
                        data?.message ||
                            data?.detail ||
                            'Unable to load event details. Please try again.'
                    )
                } else {
                    setError('Something went wrong while loading this event.')
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        void fetchEvent()

        return () => {
            isMounted = false
        }
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Loading event details...</p>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
                <h2 className="text-xl font-bold text-primary">
                    Unable to load event
                </h2>
                <p className="text-gray-500 text-center">
                    {error || 'The requested event was not found.'}
                </p>
                <Link
                    to="/events"
                    className="text-green-700 font-semibold hover:underline"
                >
                    Back to events
                </Link>
            </div>
        )
    }

    const date = formatDate(event.start_date)
    const time = formatTime(event.start_date)
    const category = formatCategory(event.category)

    const organizer =
        typeof event.organizer === 'object'
            ? event.organizer?.name || 'Event organiser'
            : event.organizer || 'Event organiser'

    const ticketTypes: TicketType[] = (event.ticket_types || []).map(
        (ticket) => ({
            id: ticket.id,
            name: ticket.name,
            description: ticket.description || '',
            price: Number(ticket.price),
            currency: 'GHS',
            available: ticket.quantity,
            maxPerOrder: ticket.quantity,
        })
    )

    return (
        <div className="min-h-screen bg-background pb-20">
            <motion.header className="bg-headerBackground text-white pt-8 pb-12 px-4 md:px-8">
                <motion.div className="max-w-6xl mx-auto">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    className="text-green-200 underline"
                                    render={<Link to="/events" />}
                                >
                                    Events
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbSeparator className="text-foreground" />

                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    render={<Link to="/events" />}
                                    className="text-green-200 underline"
                                >
                                    {category}
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbSeparator className="text-foreground" />

                            <BreadcrumbItem>
                                <BreadcrumbPage
                                    className="max-w-[16rem] truncate text-lime-200"
                                    title={event.title}
                                >
                                    {event.title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                        {event.title}
                    </h1>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm md:text-base">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 text-green-50">
                            <p className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-lime-300" />
                                {date} {time && `· ${time}`}
                            </p>

                            <p className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-lime-300" />
                                {event.venue}, {event.city}
                            </p>
                        </div>

                        <p className="text-green-100">
                            Organised by{' '}
                            <span className="font-bold text-white">
                                {organizer}
                            </span>
                        </p>
                    </div>
                </motion.div>
            </motion.header>

            <section className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 p-8">
                <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event banner */}
                        <div className="w-full aspect-video bg-image-placeholder rounded-2xl overflow-hidden flex items-center justify-center">
                            {event.banner_image ? (
                                <img
                                    src={event.banner_image}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-[#2b7a56]">
                                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                    <span className="text-sm font-medium">
                                        No event banner available
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-background p-8">
                            <h2 className="text-2xl font-bold text-primary mb-4">
                                About this event
                            </h2>

                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {event.description}
                            </p>
                        </div>

                        {/* Event details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1 border rounded-lg mb-5">
                            <div className="p-3">
                                <p className="text-xs text-gray-500 font-medium mb-1">
                                    Start time
                                </p>
                                <p className="font-bold">{time || 'Not specified'}</p>
                            </div>

                            <div className="p-3 border-r border-l">
                                <p className="text-xs text-gray-500 font-medium mb-1">
                                    Category
                                </p>
                                <p className="font-bold">{category}</p>
                            </div>

                            <div className="p-3">
                                <p className="text-xs text-gray-500 font-medium mb-1">
                                    Entry
                                </p>
                                <p className="font-bold">Mobile ticket</p>
                            </div>
                        </div>

                        {/* How entry works */}
                        <section className="bg-ticket-warning-bg p-6 rounded-2xl">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1">
                                    <h3 className="font-bold mb-2 flex items-center gap-2">
                                        <ArrowRight className="w-5 h-5 text-green-700" />
                                        How entry works
                                    </h3>

                                    <p className="text-sm text-primary leading-relaxed">
                                        When you continue, we hold your tickets
                                        while you pay with mobile money. Once
                                        payment is approved, each ticket gets
                                        its own QR code in My tickets and by
                                        email. Show it at the gate; each code
                                        can only be scanned once.
                                    </p>
                                </div>

                                <div className="flex gap-3 shrink-0">
                                    <div className="bg-[#1a6e44] text-white p-3 rounded-lg w-20 h-24 flex flex-col items-center justify-center text-center shadow-sm">
                                        <span className="text-2xl font-bold leading-none">
                                            10
                                        </span>
                                        <span className="text-xs font-bold mb-1">
                                            min
                                        </span>
                                        <span className="text-[10px] leading-tight opacity-90">
                                            Ticket hold while you pay
                                        </span>
                                    </div>

                                    <div className="bg-background text-primary p-3 rounded-lg w-20 h-24 flex flex-col items-center justify-center text-center border border-gray-200 shadow-sm">
                                        <span className="text-2xl font-bold leading-none">
                                            1
                                        </span>
                                        <span className="text-xs font-bold mb-1">
                                            scan
                                        </span>
                                        <span className="text-[10px] leading-tight text-gray-500">
                                            Per ticket at the door
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Venue */}
                        <section className="pt-4">
                            <h2 className="text-2xl font-bold text-primary mb-4">
                                Venue
                            </h2>

                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full h-50 md:w-2/3 aspect-video md:aspect-square bg-image-placeholder/80 rounded-xl flex items-center justify-center text-[#2b7a56]">
                                    <span className="text-xs font-medium">
                                        {event.venue}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-primary mb-1">
                                        {event.venue}
                                    </h3>

                                    <p className="text-gray-600 text-sm">
                                        {event.address || event.city}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Ticket selection */}
                    <div className="lg:col-span-1 mt-6">
                        <TicketSelector
                            event={{
                                id: String(event.id),
                                title: event.title,
                                date,
                                time,
                                venue: event.venue,
                            }}
                            ticketTypes={ticketTypes}
                            maxTicketsPerOrder={10}
                        />
                    </div>
                </motion.div>
            </section>
        </div>
    )
}
