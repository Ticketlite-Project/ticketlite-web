
import { apiClient } from '@/src/api/axios'
import type {
    EventData,
    TicketType,
} from '@/src/types/event-ticket.types'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES } from '../components/event-categories'
import EventCard from '../components/EventCard/event-card'
import {
    EventSearchBar,
    type EventSearchParams,
} from '../components/EventSearchBar/event-search-bar'
import { OrganiserCallout } from '../components/OrganiserCallout/organiser-callout'
import {
    SortDropdown,
    type SortOption,
} from '../components/Sorting/sort-dropdown'
import { parseSearchParams, toSearchParams } from '../lib/search-param'

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
    organizer_name?: string
}

interface PublishedEventsResponse {
    results?: ApiEvent[]
    data?: ApiEvent[]
    events?: ApiEvent[]
    count?: number
}

function extractEvents(response: unknown): ApiEvent[] {
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

function formatCategory(category: string) {
    const labels: Record<string, string> = {
        MUSIC: 'Music',
        CHURCH: 'Church',
        CAMPUS: 'Campus',
        TECH_MEETUPS: 'Tech & Meetups',
        SPORTS: 'Sports',
        ARTS_CULTURE: 'Arts & Culture',
    }

    return labels[category] ?? category
}

function getCategoryId(category: string) {
    const normalize = (value: string) =>
        value.toLowerCase().replace(/[^a-z0-9]/g, '')

    const normalizedCategory = normalize(category)

    const matchedCategory = CATEGORIES.find(
        (item) =>
            normalize(item.id) === normalizedCategory ||
            normalize(item.label) === normalizedCategory
    )

    return matchedCategory?.id ?? normalizedCategory
}

function formatDate(dateString: string) {
    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) return ''

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

function mapApiEvent(event: ApiEvent): EventData {
    const ticketTypes: TicketType[] = (event.ticket_types ?? []).map(
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

    const prices = ticketTypes
        .map((ticket) => ticket.price)
        .filter((price) => Number.isFinite(price))

    const organizer =
        event.organizer_name ||
        (typeof event.organizer === 'object'
            ? event.organizer?.name
            : event.organizer) ||
        'Event organiser'

    const startDate = new Date(event.start_date)

    return {
        id: String(event.id),
        title: event.title,
        category: formatCategory(event.category),
        type: getCategoryId(event.category),
        date: formatDate(event.start_date),
        startDate,
        time: formatTime(event.start_date),
        location: event.city,
        venueName: event.venue,
        address: [event.venue, event.city].filter(Boolean),
        organizer,
        bannerUrl: event.banner_image || undefined,
        description: event.description,
        doorsOpen: formatTime(event.start_date),
        entryType: 'Mobile ticket',
        priceFrom: prices.length > 0 ? Math.min(...prices) : 0,
        maxTicketsPerOrder: 10,
        ticketTypes,
        isSoldOut:
            ticketTypes.length > 0 &&
            ticketTypes.every((ticket) => ticket.available <= 0),
    }
}


async function fetchPublishedEvents(): Promise<EventData[]> {
    const response = await apiClient.get('/events/published/')
    const apiEvents = extractEvents(response.data)

    return apiEvents
        .filter(
            (event) =>
                event.status?.toUpperCase() === 'PUBLISHED'
        )
        .map(mapApiEvent)
}


export default function Home() {
    const [activeCategory, setActiveCategory] = useState('all')
    const [sortBy, setSortBy] = useState<SortOption>('soonest')
    const [searchParams, setSearchParams] = useSearchParams()

    const query = useMemo(
        () => parseSearchParams(searchParams),
        [searchParams]
    )

    const handleSearch = (params: EventSearchParams) => {
        setSearchParams(toSearchParams(params))
    }

    // Fetch published events from the backend
    const {
        data: events = [],
        isLoading,
        isError,
        isFetching,
        error,
    } = useQuery({
        queryKey: ['published-events'],
        queryFn: fetchPublishedEvents,
        staleTime: 60 * 1000,
        retry: 1,
    })

    // Only show events that have not started yet
    const upcomingEvents = useMemo(() => {
        const now = new Date()

        return events.filter(
            (event) => event.startDate.getTime() >= now.getTime()
        )
    }, [events])

    const totalCount = upcomingEvents.length

    const sortedEvents = useMemo(() => {
        const searchTerm = query.search.trim().toLowerCase()

        const filtered = upcomingEvents.filter((event) => {
            const matchesCategory =
                activeCategory === 'all' ||
                event.type === activeCategory

            const searchableText = [
                event.title,
                event.category,
                event.organizer,
                event.location,
                event.venueName,
                event.description,
                ...event.address,
            ]
                .join(' ')
                .toLowerCase()

            const matchesSearch =
                !searchTerm || searchableText.includes(searchTerm)

            const matchesCity =
                !query.city ||
                [event.location, event.venueName, ...event.address]
                    .join(' ')
                    .toLowerCase()
                    .includes(query.city.toLowerCase())

            const matchesDate =
                !query.date ||
                event.startDate.toDateString() ===
                    query.date.toDateString()

            return (
                matchesCategory &&
                matchesSearch &&
                matchesCity &&
                matchesDate
            )
        })

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'soonest':
                    return (
                        a.startDate.getTime() - b.startDate.getTime()
                    )

                case 'latest':
                    return (
                        b.startDate.getTime() - a.startDate.getTime()
                    )

                case 'price-low':
                    return a.priceFrom - b.priceFrom

                case 'price-high':
                    return b.priceFrom - a.priceFrom

                default:
                    return 0
            }
        })
    }, [upcomingEvents, activeCategory, sortBy, query])

    return (
        <section className="min-h-screen bg-background">
            {/* HERO */}
            <div className="bg-headerBackground text-white px-2 pt-6 pb-3 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xs font-bold tracking-widest text-[#D3EFA3] mb-6 uppercase">
                        Concerts · Church Programmes · Campus Nights · Meetups
                    </p>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-3xl">
                        Find your next event. Pay with mobile money.{' '}
                        <span className="text-[#9BE700]">
                            Walk in with one scan.
                        </span>
                    </h1>

                    <p className="text-green-50 text-base sm:text-lg max-w-2xl mb-10">
                        Every ticket gets its own QR code, so there are no paper
                        tickets to lose and no duplicates at the gate.
                    </p>

                    <EventSearchBar
                        key={`${query.search}-${query.city ?? ''}-${query.date?.toISOString() ?? ''}`}
                        onSearch={handleSearch}
                        initialValues={query}
                    />

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-[#D3EFA3] pt-4">
                        <span>✓ MOBILE MONEY CHECKOUT</span>
                        <span>✓ QR TICKET BY EMAIL</span>
                        <span>✓ ONE SCAN PER TICKET AT THE GATE</span>
                    </div>
                </div>
            </div>

            {/* CATEGORY FILTERS */}
            <div className="border-b border-gray-200 bg-categround sticky top-5 z-10">
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <div className="flex overflow-x-auto hide-scrollbar gap-8 py-4">
                        {CATEGORIES.map((cat) => {
                            const isActive = activeCategory === cat.id

                            return (
                                <button
                                    type="button"
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`cursor-pointer flex flex-col items-center gap-2 min-w-20 transition-colors ${
                                        isActive
                                            ? 'text-green-900'
                                            : 'text-gray-500 hover:text-green-800'
                                    }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                                            isActive
                                                ? 'bg-green-700 text-white'
                                                : 'bg-green-100 text-green-800'
                                        }`}
                                    >
                                        {cat.icon}
                                    </div>

                                    <span
                                        className={`text-xs font-bold ${
                                            isActive
                                                ? 'border-b-2 border-green-700 pb-1'
                                                : ''
                                        }`}
                                    >
                                        {cat.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* EVENT LISTING */}
            <section className="max-w-6xl mx-auto px-4 md:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 p-5">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Upcoming Events
                        </p>

                        <h2 className="text-3xl font-extrabold text-foreground">
                            Happening soon near you
                        </h2>
                    </div>

                    <SortDropdown
                        totalCount={totalCount}
                        visibleCount={sortedEvents.length}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                    />
                </div>

                {/* LOADING / ERROR / EMPTY / GRID */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mt-8">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse rounded-lg bg-gray-100 h-64"
                            />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-20 text-red-600">
                        {error instanceof Error
                            ? error.message
                            : 'Failed to load events.'}
                    </div>
                ) : sortedEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mt-5">
                        {sortedEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        No events match your search.{' '}
                        <button
                            type="button"
                            className="ml-2 underline text-green-700"
                            onClick={() => {
                                setSearchParams(new URLSearchParams())
                                setActiveCategory('all')
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* REFRESH INDICATOR */}
                {isFetching && !isLoading && (
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Refreshing…
                    </p>
                )}
            </section>

            <div className="mb-7">
                <OrganiserCallout />
            </div>
        </section>
    )
}
