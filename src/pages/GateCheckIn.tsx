
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
    CalendarDays,
    MapPin,
    Search,
    ScanLine,
    RefreshCw,
    Ticket,
    AlertCircle,
    ArrowRight,
} from 'lucide-react'
import { apiClient } from '@/src/api/axios'

interface ApiEvent {
    id: number
    title: string
    category?: string
    city?: string
    venue?: string
    start_date?: string
    end_date?: string
    banner_image?: string | null
    status?: string
    organizer?: string | { name?: string }
    organizer_name?: string
}

interface PublishedEventsResponse {
    results?: ApiEvent[]
    data?: ApiEvent[]
    events?: ApiEvent[]
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

function formatEventDate(dateString?: string) {
    if (!dateString) return 'Date not set'

    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) return 'Date not available'

    return date.toLocaleDateString('en-GH', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Africa/Accra',
    })
}

function formatEventTime(dateString?: string) {
    if (!dateString) return ''

    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleTimeString('en-GH', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Africa/Accra',
    })
}

function getOrganizerName(event: ApiEvent) {
    return (
        event.organizer_name ||
        (typeof event.organizer === 'object'
            ? event.organizer?.name
            : event.organizer) ||
        'Event organiser'
    )
}

async function fetchPublishedEvents(): Promise<ApiEvent[]> {
    const response = await apiClient.get('/events/published/')
    const events = extractEvents(response.data)

    return events.filter(
        (event) => event.status?.toUpperCase() === 'PUBLISHED'
    )
}

export default function GateCheckIn() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')

    const {
        data: events = [],
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ['gate-check-in-events'],
        queryFn: fetchPublishedEvents,
        staleTime: 60 * 1000,
        retry: 1,
    })

    const filteredEvents = useMemo(() => {
        const search = searchTerm.trim().toLowerCase()

        if (!search) return events

        return events.filter((event) => {
            const searchableText = [
                event.title,
                event.category,
                event.venue,
                event.city,
                getOrganizerName(event),
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()

            return searchableText.includes(search)
        })
    }, [events, searchTerm])

  

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {/* HEADER */}
                <header className="mb-8">
                    <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        <ScanLine size={18} />
                        GATE MANAGEMENT
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                                Gate check-in
                            </h1>

                            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                                Select an event to open its ticket scanner
                                and verify attendee QR codes at the gate.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
                            <Ticket
                                size={18}
                                className="text-emerald-600"
                            />
                            <div>
                                <p className="text-xl font-extrabold">
                                    {events.length}
                                </p>
                                <p className="text-[10px] font-medium text-muted-foreground">
                                    Published events
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* SEARCH */}
                <div className="mb-7">
                    <div className="relative max-w-xl">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search events by name, venue or city..."
                            className="w-full rounded-xl border border-input bg-card py-3.5 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                        />
                    </div>
                </div>

                {/* EVENT LIST */}
                <section>
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold">
                                Select an event
                            </h2>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Choose the event you are checking tickets for.
                            </p>
                        </div>

                        {!isLoading && !isError && (
                            <span className="text-xs font-semibold text-muted-foreground">
                                {filteredEvents.length} found
                            </span>
                        )}
                    </div>

                    {/* LOADING */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="animate-pulse overflow-hidden rounded-xl border border-border bg-card"
                                >
                                    <div className="h-40 bg-muted" />
                                    <div className="space-y-3 p-5">
                                        <div className="h-4 w-3/4 rounded bg-muted" />
                                        <div className="h-3 w-1/2 rounded bg-muted" />
                                        <div className="h-10 rounded bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        /* ERROR */
                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-12 text-center">
                            <AlertCircle
                                size={36}
                                className="mx-auto mb-4 text-red-500"
                            />

                            <h3 className="font-bold">
                                Unable to load events
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                                {error instanceof Error
                                    ? error.message
                                    : 'Something went wrong while loading published events.'}
                            </p>

                            <button
                                type="button"
                                onClick={() => void refetch()}
                                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                            >
                                <RefreshCw size={16} />
                                Try again
                            </button>
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        /* EVENTS GRID */
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredEvents.map((event) => (
                                <article
                                    key={event.id}
                                    className="group overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-1 hover:border-emerald-600/40 hover:shadow-lg"
                                >
                                    {/* EVENT IMAGE */}
                                    <div className="relative h-40 overflow-hidden bg-muted">
                                        {event.banner_image ? (
                                            <img
                                                src={event.banner_image}
                                                alt={event.title}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-900 to-slate-950">
                                                <Ticket
                                                    size={45}
                                                    className="text-white/50"
                                                />
                                            </div>
                                        )}

                                        <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white">
                                            PUBLISHED
                                        </span>
                                    </div>

                                    {/* EVENT DETAILS */}
                                    <div className="p-5">
                                        <h3 className="line-clamp-2 min-h-12 text-base font-extrabold">
                                            {event.title}
                                        </h3>

                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {getOrganizerName(event)}
                                        </p>

                                        <div className="mt-5 space-y-3">
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <CalendarDays
                                                    size={16}
                                                    className="shrink-0 text-emerald-600"
                                                />
                                                <span>
                                                    {formatEventDate(
                                                        event.start_date
                                                    )}
                                                    {event.start_date &&
                                                        ` · ${formatEventTime(event.start_date)}`}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <MapPin
                                                    size={16}
                                                    className="shrink-0 text-emerald-600"
                                                />
                                                <span className="line-clamp-1">
                                                    {[event.venue, event.city]
                                                        .filter(Boolean)
                                                        .join(', ') ||
                                                        'Venue not provided'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* OPEN SCANNER */}
                                        <button
                                            type="button"
                                           onClick={() =>
                                            navigate(
                                                `/organisers/events/${event.id}/scanner`
                                            )
                                        }
                                            className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00865A] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#006F4A]"
                                        >
                                            <ScanLine size={17} />
                                            Open scanner
                                            <ArrowRight
                                                size={16}
                                                className="ml-auto"
                                            />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        /* EMPTY STATE */
                        <div className="rounded-xl border border-border bg-card px-5 py-16 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Ticket
                                    size={30}
                                    className="text-muted-foreground"
                                />
                            </div>

                            <h3 className="text-lg font-bold">
                                {searchTerm
                                    ? 'No matching events'
                                    : 'No published events'}
                            </h3>

                            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                                {searchTerm
                                    ? 'Try searching with a different event name, venue or city.'
                                    : 'There are currently no published events available for gate check-in.'}
                            </p>

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="mt-5 cursor-pointer text-sm font-semibold text-emerald-700 underline dark:text-emerald-400"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* REFRESH INDICATOR */}
                {isFetching && !isLoading && (
                    <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <RefreshCw
                            size={13}
                            className="animate-spin"
                        />
                        Refreshing events...
                    </p>
                )}
            </div>
        </main>
    )
}
