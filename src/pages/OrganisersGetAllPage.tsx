import {
    Ban,
    CalendarDays,
    Check,
    Copy,
    EllipsisVertical,
    Eye,
    Link2,
    Moon,
    Plus,
    Search,
    Sun,
    Ticket,
    Users,
    X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '../api/axios'
import { useNavigate } from 'react-router'
import { CustomButton } from '../components/Button/custom-button'

type EventStatus = 'published' | 'draft' | 'ended' | 'cancelled'

interface OrganiserEvent {
    id: number | string
    title: string
    date: string
    time: string
    venue: string
    status: EventStatus
    sold: number | null
    capacity: number
    revenue: number | null
    apiEvent: ApiEvent
}

interface ApiTicketType {
    id?: number | string
    name?: string
    price?: number | string
    quantity?: number | string
}


interface ApiEvent {
    id: number | string
    title?: string
    category?: string
    description?: string
    banner_image?: string | null
    venue?: string
    city?: string
    start_date?: string
    end_date?: string
    status?: string
    ticket_types?: ApiTicketType[]
}

type FilterTab = 'All' | 'Published' | 'Drafts' | 'Past' | 'Cancelled'

const getApiEvents = (payload: unknown): ApiEvent[] => {
    if (Array.isArray(payload)) return payload as ApiEvent[]

    if (payload && typeof payload === 'object') {
        const data = payload as Record<string, unknown>

        if (Array.isArray(data.results)) return data.results as ApiEvent[]
        if (Array.isArray(data.events)) return data.events as ApiEvent[]
        if (Array.isArray(data.data)) return data.data as ApiEvent[]
    }

    return []
}

const formatEventDate = (value?: string) => {
    if (!value) return { date: '—', time: 'Date not set', timestamp: null as number | null }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return { date: '—', time: value, timestamp: null as number | null }
    }

    return {
        date: parsed.toLocaleDateString('en-GH', {
            month: 'short',
            day: 'numeric',
            timeZone: 'Africa/Accra',
        }),
        time: parsed.toLocaleString('en-GH', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Africa/Accra',
        }),
        timestamp: parsed.getTime(),
    }
}

const mapApiEvent = (event: ApiEvent, source: 'published' | 'draft'): OrganiserEvent => {
    const start = formatEventDate(event.start_date)
    const end = event.end_date ? new Date(event.end_date).getTime() : null
    const rawStatus = (event.status ?? '').toLowerCase()

    let status: EventStatus
    if (rawStatus.includes('cancel')) {
        status = 'cancelled'
    } else if (source === 'draft' || rawStatus.includes('draft')) {
        status = 'draft'
    } else if (
        (end !== null && !Number.isNaN(end) && end < Date.now()) ||
        (start.timestamp !== null && start.timestamp < Date.now() && !event.end_date)
    ) {
        status = 'ended'
    } else {
        // The published endpoint is authoritative for published status.
        status = 'published'
    }

    const capacity = (event.ticket_types ?? []).reduce(
        (total, ticketType) => total + (Number(ticketType.quantity) || 0),
        0
    )

    return {
        id: event.id,
        title: event.title || 'Untitled event',
        date: start.date,
        time: start.time,
        venue: [event.venue, event.city].filter(Boolean).join(', ') || 'Venue not provided',
        status,
        // The current events API does not return ticket sales or revenue.
        sold: null,
        capacity,
        revenue: null,
        apiEvent: event,
    }
}

const filters: FilterTab[] = ['All', 'Published', 'Drafts', 'Past', 'Cancelled']

const formatMoney = (amount: number) => `GHS ${amount.toLocaleString('en-GH')}`

export default function OrganisersGetAllPage() {
    const navigate = useNavigate()

    const [events, setEvents] = useState<OrganiserEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState('')
    const [activeFilter, setActiveFilter] = useState<FilterTab>('All')
    const [openMenu, setOpenMenu] = useState<number | string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem('ticketlite-organiser-dark') === 'true'
    )
    const [notice, setNotice] = useState('')

    useEffect(() => {
        let isActive = true

        const loadEvents = async () => {
            setLoading(true)
            setLoadError('')

            try {
                // These endpoints serve different event groups:
                // /published/ returns published events, /my-events/ returns drafts.
                const [publishedResponse, draftsResponse] = await Promise.all([
                    apiClient.get('/events/published/'),
                    apiClient.get('/events/my-events/'),
                ])

                const publishedEvents = getApiEvents(publishedResponse.data).map(
                    (event) => mapApiEvent(event, 'published')
                )
                const draftEvents = getApiEvents(draftsResponse.data).map(
                    (event) => mapApiEvent(event, 'draft')
                )

                // Keep one row per event ID; published results take precedence.
                const combinedEvents = new Map<string, OrganiserEvent>()
                draftEvents.forEach((event) => {
                    combinedEvents.set(String(event.id), event)
                })
                publishedEvents.forEach((event) => {
                    combinedEvents.set(String(event.id), event)
                })

                if (isActive) {
                    setEvents(Array.from(combinedEvents.values()))
                }
            } catch (error) {
                if (isActive) {
                    const message =
                        error instanceof Error
                            ? error.message
                            : 'Unable to load your events. Please try again.'
                    setLoadError(message)
                }
            } finally {
                if (isActive) setLoading(false)
            }
        }

        void loadEvents()

        return () => {
            isActive = false
        }
    }, [])

    const upcomingEvents = events.filter(
        (event) => event.status === 'published'
    ).length

    // Sales and revenue are not included in the current events API response.

    const counts: Record<FilterTab, number> = {
        All: events.length,
        Published: events.filter((event) => event.status === 'published')
            .length,
        Drafts: events.filter((event) => event.status === 'draft').length,
        Past: events.filter((event) => event.status === 'ended').length,
        Cancelled: events.filter((event) => event.status === 'cancelled')
            .length,
    }

    const visibleEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesFilter =
                activeFilter === 'All' ||
                (activeFilter === 'Published' &&
                    event.status === 'published') ||
                (activeFilter === 'Drafts' && event.status === 'draft') ||
                (activeFilter === 'Past' && event.status === 'ended') ||
                (activeFilter === 'Cancelled' && event.status === 'cancelled')

            const matchesSearch = event.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase())

            return matchesFilter && matchesSearch
        })
    }, [events, activeFilter, searchTerm])

    const toggleDarkMode = () => {
        const nextValue = !darkMode
        setDarkMode(nextValue)
        localStorage.setItem('ticketlite-organiser-dark', String(nextValue))
    }

    const showNotice = (message: string) => {
        setNotice(message)
        window.setTimeout(() => setNotice(''), 3000)
    }

    const copyEventLink = async (eventId: number | string) => {
        const link = `${window.location.origin}/events/${eventId}`

        try {
            await navigator.clipboard.writeText(link)
            showNotice('Event link copied successfully.')
        } catch {
            showNotice('Unable to copy the link. Please copy it manually.')
        }

        setOpenMenu(null)
    }

    const publishDraft = async (eventId: number | string) => {
        const confirmed = window.confirm('Publish this draft event now?')
        if (!confirmed) return

        try {
            await apiClient.post(`/events/${eventId}/publish/`)
            setEvents((current) => current.map((event) =>
                event.id === eventId ? { ...event, status: 'published' } : event
            ))
            setOpenMenu(null)
            showNotice('Event published successfully.')
        } catch (error) {
            console.error('Draft publishing failed:', error)
            const responseMessage = (error as { response?: { data?: { detail?: string; message?: string } } })
                ?.response?.data?.detail
                || (error as { response?: { data?: { message?: string } } })?.response?.data?.message
                || 'Unable to publish this event. Please try again.'
            showNotice(responseMessage)
        }
    }

    const duplicateEvent = (event: OrganiserEvent) => {
        const duplicate: OrganiserEvent = {
            ...event,
            id: `local-copy-${Date.now()}`,
            title: `${event.title} (Copy)`,
            status: 'draft',
            sold: null,
            revenue: null,
        }

        setEvents((current) => [...current, duplicate])
        setActiveFilter('All')
        setOpenMenu(null)
        showNotice('A local draft copy was added. It has not been saved to the server.')
    }

    const cancelEvent = async (eventId: number | string) => {
    const confirmed = window.confirm(
        'Are you sure you want to cancel this event?'
    )

    if (!confirmed) return

    try {
        await apiClient.post(`/events/${eventId}/cancel/`)

        setEvents((current) =>
            current.map((event) =>
                event.id === eventId
                    ? { ...event, status: 'cancelled' }
                    : event
            )
        )

        setOpenMenu(null)
        showNotice('Event cancelled successfully.')
    } catch (error) {
        console.error('Failed to cancel event:', error)
        showNotice('Failed to cancel event. Please try again.')
    }
}

    const statusStyle = (status: EventStatus) => {
        switch (status) {
            case 'published':
                return 'bg-accent text-homeText'
            case 'draft':
                return 'bg-muted text-muted-foreground'
            case 'ended':
                return 'bg-muted text-muted-foreground'
            case 'cancelled':
                return 'bg-destructive/10 text-destructive'
        }
    }

    const statusLabel = (status: EventStatus) => {
        switch (status) {
            case 'published':
                return 'PUBLISHED'
            case 'draft':
                return 'DRAFT'
            case 'ended':
                return 'ENDED'
            case 'cancelled':
                return 'CANCELLED'
        }
    }

    const panelTheme = 'border-border bg-card text-card-foreground'

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex min-h-screen flex-col md:flex-row">
                {/* SIDEBAR */}
                <aside
                    className={`flex w-full flex-col border-r md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 ${panelTheme}`}
                >
                    <div className="flex items-center gap-2 border-b border-inherit px-4 py-4">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime-500 text-white">
                            <Ticket size={16} />
                        </div>
                        <span className="text-lg font-extrabold tracking-tight">
                            Ticket<span className="text-green-600">Lite</span>
                        </span>
                    </div>

                    <div className="px-6 pt-8">
                        <p className="mb-4 px-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                            Organizer
                        </p>

                        <nav className="flex flex-col gap-1">
                            <CustomButton
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate('/organisers')}
                                icon={<CalendarDays size={17} />}
                                className="!flex !min-h-[62px] !w-full !flex-row !items-center !justify-start !gap-4 !rounded-lg !border-l-4 !border-emerald-700 !bg-emerald-50 !px-4 !py-4 text-left !text-base !font-bold !text-slate-950 shadow-none dark:!border-emerald-500 dark:!bg-emerald-950 dark:!text-emerald-200"
                            >
                                My events
                            </CustomButton>
                            <CustomButton
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate('/organisers/create-event')}
                                icon={<Plus size={17} />}
                                className="!flex !min-h-[62px] !w-full !flex-row !items-center !justify-start !gap-4 !rounded-lg !border-l-4 !border-transparent !bg-transparent !px-4 !py-4 text-left !text-base !font-medium !text-slate-700 shadow-none transition hover:!bg-slate-100 dark:!text-slate-300 dark:hover:!bg-slate-800"
                            >
                                Create event
                            </CustomButton>

                            <CustomButton
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate(`/gate-check-in`)}
                                icon={<Check size={17} />}
                                className="!flex !min-h-[62px] !w-full !flex-row !items-center !justify-start !gap-4 !rounded-lg !border-l-4 !border-transparent !bg-transparent !px-4 !py-4 text-left !text-base !font-medium !text-slate-700 shadow-none transition hover:!bg-slate-100 dark:!text-slate-300 dark:hover:!bg-slate-800"
                            >
                                Gate check-in
                            </CustomButton>

                            <CustomButton
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate('/gate-staff')}
                                icon={<Users size={17} />}
                                className="!flex !min-h-[62px] !w-full !flex-row !items-center !justify-start !gap-4 !rounded-lg !border-l-4 !border-transparent !bg-transparent !px-4 !py-4 text-left !text-base !font-medium !text-slate-700 shadow-none transition hover:!bg-slate-100 dark:!text-slate-300 dark:hover:!bg-slate-800"
                            >
                                Gate staff
                            </CustomButton>
                        </nav>
                    </div>

                    <div className="mt-auto hidden p-5 md:block">
                        <CustomButton variant="secondary"
                            onClick={toggleDarkMode}
                            className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-xs font-semibold ${panelTheme}`}
                        >
                            <span className="flex items-center gap-2">
                                {darkMode ? (
                                    <Sun size={15} />
                                ) : (
                                    <Moon size={15} />
                                )}
                                {darkMode ? 'Light mode' : 'Dark mode'}
                            </span>
                            <span className="text-green-600">
                                {darkMode ? 'ON' : 'OFF'}
                            </span>
                        </CustomButton>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="min-w-0 flex-1">
                    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
                        {/* HEADER */}
                        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    KNUST MUSIC SOCIETY
                                </p>
                                <h1 className="text-3xl font-extrabold tracking-tight">
                                    My events
                                </h1>
                            </div>

                          <CustomButton
    variant="primary"
    onClick={() => navigate('/organisers/create-event')}
    icon={<Plus size={14} />}
    className="inline-flex items-center justify-center gap-1.5 rounded-none bg-[#00865A] px-3 py-1.5 text-xs font-bold text-white shadow-none transition-colors hover:bg-[#006F4A]"
>
    CREATE EVENT
</CustomButton>
                        </header>

                        {/* SUMMARY CARDS */}
                        <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div
                                className={`rounded-xl border p-5 ${panelTheme}`}
                            >
                                <p className="text-xs font-medium text-muted-foreground">
                                    Upcoming events
                                </p>
                                <p className="mt-1 text-2xl font-extrabold">
                                    {upcomingEvents}
                                </p>
                            </div>

                            <div
                                className={`rounded-xl border p-5 ${panelTheme}`}
                            >
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Tickets sold, all events
                                </p>
                                <p className="mt-1 text-2xl font-extrabold">
                                    —
                                </p>
                            </div>

                            <div
                                className={`rounded-xl border p-5 ${panelTheme}`}
                            >
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Gross revenue, all events
                                </p>
                                <p className="mt-1 text-2xl font-extrabold">
                                    —
                                </p>
                            </div>
                        </section>

                        {/* EVENTS PANEL */}
                        <section
                            className={`overflow-visible rounded-xl border ${panelTheme}`}
                        >
                            {/* FILTERS AND SEARCH */}
                            <div className="flex flex-col gap-4 border-b border-border px-4 pt-4 sm:px-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex gap-5 overflow-x-auto">
                                        {filters.map((filter) => (
                                            <CustomButton variant="secondary"
                                                key={filter}
                                                onClick={() =>
                                                    setActiveFilter(filter)
                                                }
                                                className={`shrink-0 border-b-2 pb-3 text-xs transition ${
                                                    activeFilter === filter
                                                        ? 'border-headerBackground font-extrabold text-homeText'
                                                        : 'border-transparent font-medium text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                {filter} ({counts[filter]})
                                            </CustomButton>
                                        ))}
                                    </div>

                                    <div className="relative mb-3">
                                        <Search
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        />
                                        <input
                                            value={searchTerm}
                                            onChange={(event) =>
                                                setSearchTerm(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Search events"
                                            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-ring sm:w-44"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* TABLE */}
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-190 text-left">
                                    <thead>
                                        <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                            <th className="px-5 py-4">Event</th>
                                            <th className="px-4 py-4">
                                                Status
                                            </th>
                                            <th className="px-4 py-4">Sold</th>
                                            <th className="px-4 py-4">
                                                Revenue
                                            </th>
                                            <th className="px-4 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {!loading && !loadError && visibleEvents.map((event) => {
                                            return (
                                                <tr
                                                    key={event.id}
                                                    className="border-b border-border last:border-0 transition hover:bg-muted/50"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md bg-accent text-accent-foreground">
                                                                <span className="text-[8px] font-bold uppercase">
                                                                    {
                                                                        event.date.split(
                                                                            ' '
                                                                        )[0]
                                                                    }
                                                                </span>
                                                                <span className="text-sm font-extrabold">
                                                                    {
                                                                        event.date.split(
                                                                            ' '
                                                                        )[1]
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="max-w-52 text-xs font-extrabold">
                                                                    {
                                                                        event.title
                                                                    }
                                                                </p>
                                                                <p className="mt-1 text-[10px] text-muted-foreground">
                                                                    {event.time}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400">
                                                                    {
                                                                        event.venue
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`inline-flex rounded px-2 py-1 text-[9px] font-extrabold ${statusStyle(event.status)}`}
                                                        >
                                                            {statusLabel(
                                                                event.status
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="w-28">
                                                            <p className="mb-2 text-[10px] font-medium">
                                                                {event.sold === null ? '—' : event.sold} /{' '}
                                                                {event.capacity || '—'}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 text-xs font-medium">
                                                        {event.revenue === null
                                                            ? '—'
                                                            : formatMoney(event.revenue)}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {event.status === 'published' && (
                                                                <>
                                                                    <CustomButton variant="secondary"
                                                                        onClick={() => navigate('/organisers/create-event', { state: { event: event.apiEvent } })}
                                                                        className="rounded-md border border-border px-3 py-2 text-[10px] font-bold text-homeText hover:bg-accent"
                                                                    >
                                                                        EDIT
                                                                    </CustomButton>
                                                                    <CustomButton variant="secondary"
                                                                        onClick={() => navigate(`/organisers/events/${event.id}/dashboard`)}
                                                                        className="rounded-md bg-headerBackground px-3 py-2 text-[10px] font-bold text-white hover:opacity-90"
                                                                    >
                                                                        DASHBOARD
                                                                    </CustomButton>
                                                                </>
                                                            )}

                                                            {event.status === 'draft' && (
                                                                <>
                                                                    <CustomButton variant="secondary"
                                                                        onClick={() => navigate('/organisers/create-event', { state: { event: event.apiEvent } })}
                                                                        className="rounded-md border border-border px-3 py-2 text-[10px] font-bold text-homeText hover:bg-accent"
                                                                    >
                                                                        EDIT
                                                                    </CustomButton>
                                                                    <CustomButton variant="secondary"
                                                                        onClick={() => void publishDraft(event.id)}
                                                                        className="rounded-md bg-headerBackground px-3 py-2 text-[10px] font-bold text-white hover:opacity-90"
                                                                    >
                                                                        PUBLISH
                                                                    </CustomButton>
                                                                </>
                                                            )}

                                                            {event.status ===
                                                                'ended' && (
                                                                <CustomButton variant="secondary"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/organisers/events/${event.id}/dashboard`
                                                                        )
                                                                    }
                                                                    className="rounded-md border border-border px-3 py-2 text-[10px] font-bold text-homeText hover:bg-accent"
                                                                >
                                                                    Dashboard
                                                                </CustomButton>
                                                            )}

                                                            {event.status ===
                                                                'cancelled' && (
                                                                <CustomButton variant="secondary"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/events/${event.id}`
                                                                        )
                                                                    }
                                                                    className="rounded-md border border-border px-3 py-2 text-[10px] font-bold text-homeText hover:bg-accent"
                                                                >
                                                                    View
                                                                </CustomButton>
                                                            )}

                                                            <div className="relative">
                                                                <CustomButton variant="secondary"
                                                                    aria-label={`More actions for ${event.title}`}
                                                                    onClick={() =>
                                                                        setOpenMenu(
                                                                            openMenu ===
                                                                                event.id
                                                                                ? null
                                                                                : event.id
                                                                        )
                                                                    }
                                                                    className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                                >
                                                                    <EllipsisVertical
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </CustomButton>

                                                                {openMenu === event.id && (
<div className="absolute right-0 top-11 z-50 w-max max-w-[calc(100vw-2rem)] rounded-xl border-2 border-[#dedede] bg-white py-2 pl-2 pr-9 text-black shadow-xl">                                                                        <CustomButton
                                                                            variant="secondary"
                                                                            icon={<Eye size={18} strokeWidth={2} />}
                                                                            onClick={() => {
                                                                                navigate(`/events/${event.id}`)
                                                                                setOpenMenu(null)
                                                                            }}
                                                                            className="!flex !min-h-[48px] !w-full !items-center !justify-start !gap-3 !rounded-lg !bg-white !pl-4 !pr-2 !py-2.5 !text-left !text-xs !font-normal !text-black shadow-none hover:!bg-gray-100"
                                                                        >
                                                                            View public page
                                                                        </CustomButton>

                                                                        <CustomButton
                                                                            variant="secondary"
                                                                            icon={<Link2 size={18} strokeWidth={2} />}
                                                                            onClick={() => void copyEventLink(event.id)}
                                                                            className="!flex !min-h-[48px] !w-full !items-center !justify-start !gap-3 !rounded-lg !bg-white !pl-4 !pr-2 !py-2.5 !text-left !text-xs !font-normal !text-black shadow-none hover:!bg-gray-100"
                                                                        >
                                                                            Copy event link
                                                                        </CustomButton>

                                                                        <CustomButton
                                                                            variant="secondary"
                                                                            icon={<Copy size={18} strokeWidth={2} />}
                                                                            onClick={() => duplicateEvent(event)}
                                                                            className="!flex !min-h-[48px] !w-full !items-center !justify-start !gap-3 !rounded-lg !bg-white !pl-4 !pr-2 !py-2.5 !text-left !text-xs !font-normal !text-black shadow-none hover:!bg-gray-100"
                                                                        >
                                                                            Duplicate event
                                                                        </CustomButton>

                                                                        {event.status !== 'cancelled' && (
                                                                            <>
                                                                                <div className="my-2 border-t-2 border-[#e5e5e5]" />
                                                                                <CustomButton
                                                                                    variant="secondary"
                                                                                    icon={<Ban size={18} strokeWidth={2} />}
                                                                                    onClick={() => cancelEvent(event.id)}
                                                                                    className="!flex !min-h-[48px] !w-full !items-center !justify-start !gap-3 !rounded-lg !bg-white !pl-4 !pr-2 !py-2.5 !text-left !text-xs !font-semibold !text-[#c41414] shadow-none hover:!bg-red-50"
                                                                                >
                                                                                    Cancel event
                                                                                </CustomButton>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}

                                        {!loading && !loadError && visibleEvents.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-5 py-16 text-center text-sm text-muted-foreground"
                                                >
                                                    No events found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* MOBILE DARK MODE */}
                        <CustomButton variant="secondary"
                            onClick={toggleDarkMode}
                            className={`mt-5 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-xs font-semibold md:hidden ${panelTheme}`}
                        >
                            <span className="flex items-center gap-2">
                                {darkMode ? (
                                    <Sun size={15} />
                                ) : (
                                    <Moon size={15} />
                                )}
                                {darkMode ? 'Light mode' : 'Dark mode'}
                            </span>
                            <span className="text-green-600">
                                {darkMode ? 'ON' : 'OFF'}
                            </span>
                        </CustomButton>
                    </div>
                </main>
            </div>

            {/* FEEDBACK MESSAGE */}
            {notice && (
                <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background shadow-xl">
                    <Check size={16} className="text-homeText" />
                    {notice}
                    <CustomButton variant="secondary" onClick={() => setNotice('')}>
                        <X size={15} />
                    </CustomButton>
                </div>
            )}
        </div>
    )
}
