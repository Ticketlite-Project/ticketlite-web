import {
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    Download,
    Plus,
    RefreshCw,
    ScanLine,
    Ticket,
    Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { apiClient } from '../api/axios'
import { CustomButton } from '../components/Button/custom-button'

type TicketType = {
    id?: number | string
    name: string
    price: string | number
    quantity: number
}

type OrganizerEvent = {
    id: number | string
    title: string
    category: string
    city: string
    description: string
    venue: string
    start_date: string
    end_date: string
    banner_image?: string | null
    status?: string
    ticket_types: TicketType[]
    created_at?: string
    updated_at?: string
}

type Order = {
    id: string
    buyer: string
    tickets: string
    total: number
    status: string
}

const money = (amount: number) =>
    `GHS ${amount.toLocaleString('en-GH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

const getEventsFromResponse = (data: unknown): OrganizerEvent[] => {
    if (Array.isArray(data)) return data as OrganizerEvent[]

    if (!data || typeof data !== 'object') return []

    const response = data as Record<string, unknown>

    if (Array.isArray(response.results)) {
        return response.results as OrganizerEvent[]
    }

    if (Array.isArray(response.events)) {
        return response.events as OrganizerEvent[]
    }

    if (Array.isArray(response.data)) {
        return response.data as OrganizerEvent[]
    }

    return []
}

const formatDate = (value: string) => {
    if (!value) return 'Date unavailable'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return 'Date unavailable'

    return date.toLocaleDateString('en-GH', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

const formatTime = (value: string) => {
    if (!value) return ''

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleTimeString('en-GH', {
        hour: 'numeric',
        minute: '2-digit',
    })
}

const formatCategory = (category: string) => {
    const categories: Record<string, string> = {
        MUSIC: 'Music',
        CHURCH: 'Church',
        CAMPUS: 'Campus',
        TECH_MEETUPS: 'Tech & Meetups',
        ARTS_CULTURE: 'Arts & Culture',
        SPORTS: 'Sports',
    }

    return categories[category] ?? category
}

const getErrorMessage = (error: unknown) => {
    const apiError = error as {
        response?: {
            data?: {
                detail?: string
                message?: string
            }
        }
        message?: string
    }

    return (
        apiError.response?.data?.detail ||
        apiError.response?.data?.message ||
        apiError.message ||
        'Unable to load your events. Please try again.'
    )
}

export default function OrganizerEventsDashboard() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [events, setEvents] = useState<OrganizerEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')

    const fetchEvents = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)

        try {
            // Fetch published events and drafts separately.
            const [publishedResult, draftsResult] = await Promise.allSettled([
                apiClient.get('/events/published/'),
                apiClient.get('/events/my-events/'),
            ])

            const published =
                publishedResult.status === 'fulfilled'
                    ? getEventsFromResponse(publishedResult.value.data)
                    : []

            const drafts =
                draftsResult.status === 'fulfilled'
                    ? getEventsFromResponse(draftsResult.value.data)
                    : []

            if (
                publishedResult.status === 'rejected' &&
                draftsResult.status === 'rejected'
            ) {
                throw publishedResult.reason
            }

            // Published records take precedence when IDs overlap.
            const eventMap = new Map<string, OrganizerEvent>()

            drafts.forEach((event) => {
                eventMap.set(String(event.id), event)
            })

            published.forEach((event) => {
                eventMap.set(String(event.id), event)
            })

            setEvents(Array.from(eventMap.values()))
            setError('')
        } catch (err) {
            setError(getErrorMessage(err))
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const loadEvents = async () => {
            try {
                const [publishedResult, draftsResult] =
                    await Promise.allSettled([
                        apiClient.get('/events/published/'),
                        apiClient.get('/events/my-events/'),
                    ])

                if (cancelled) return

                const published =
                    publishedResult.status === 'fulfilled'
                        ? getEventsFromResponse(publishedResult.value.data)
                        : []

                const drafts =
                    draftsResult.status === 'fulfilled'
                        ? getEventsFromResponse(draftsResult.value.data)
                        : []

                if (
                    publishedResult.status === 'rejected' &&
                    draftsResult.status === 'rejected'
                ) {
                    throw publishedResult.reason
                }

                const eventMap = new Map<string, OrganizerEvent>()

                drafts.forEach((item) => {
                    eventMap.set(String(item.id), item)
                })

                published.forEach((item) => {
                    eventMap.set(String(item.id), item)
                })

                setEvents(Array.from(eventMap.values()))
                setError('')
            } catch (err) {
                if (!cancelled) {
                    setError(getErrorMessage(err))
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void loadEvents()

        return () => {
            cancelled = true
        }
    }, [])

    const event = useMemo(() => {
        if (id) {
            return events.find((item) => String(item.id) === String(id))
        }

        return events[0]
    }, [events, id])

    const ticketTypes = event?.ticket_types ?? []

    const totalCapacity = ticketTypes.reduce(
        (total, ticket) => total + Number(ticket.quantity || 0),
        0
    )

    const orders: Order[] = []

    const panelClass = 'border-border bg-card text-card-foreground'

    const exportOrders = () => {
        const header = ['Order', 'Buyer', 'Tickets', 'Total', 'Status']

        const csv = [
            header,
            ...orders.map((order) => [
                order.id,
                order.buyer,
                order.tickets,
                order.total,
                order.status,
            ]),
        ]
            .map((row) =>
                row
                    .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                    .join(',')
            )
            .join('\n')

        const blob = new Blob([csv], {
            type: 'text/csv;charset=utf-8;',
        })

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = `${event?.title.replace(/\s+/g, '-').toLowerCase() || 'event'}-orders.csv`
        link.click()

        URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw
                        className="animate-spin text-homeText"
                        size={28}
                    />
                    <p className="text-sm text-muted-foreground">
                        Loading your event dashboard...
                    </p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
                <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center">
                    <h2 className="text-lg font-extrabold">
                        Unable to load dashboard
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {error}
                    </p>

                    <button
                        onClick={() => void fetchEvents(true)}
                        disabled={refreshing}
                        className="mt-5 inline-flex items-center gap-2 rounded-md bg-headerBackground px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? 'animate-spin' : ''}
                        />
                        Try again
                    </button>
                </div>
            </div>
        )
    }

    if (!events.length) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Ticket size={30} className="text-muted-foreground" />
                </div>

                <h2 className="mt-5 text-xl font-extrabold">No events yet</h2>

                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Events you create will appear here.
                </p>

                <button
                    onClick={() => navigate('/organisers/create-event')}
                    className="mt-5 inline-flex items-center gap-2 rounded-md bg-headerBackground px-4 py-3 text-xs font-bold text-white"
                >
                    <Plus size={15} />
                    CREATE EVENT
                </button>

                <button
                    onClick={() => void fetchEvents(true)}
                    disabled={refreshing}
                    className="mt-4 text-xs font-semibold text-homeText disabled:opacity-50"
                >
                    Refresh events
                </button>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
                <h2 className="text-xl font-extrabold">Event not found</h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    This event could not be found in your organizer account.
                </p>

                <button
                    onClick={() => navigate('/organisers')}
                    className="mt-5 rounded-md bg-headerBackground px-4 py-2 text-xs font-bold text-white"
                >
                    BACK TO MY EVENTS
                </button>
            </div>
        )
    }

    const eventStatus = event.status?.toUpperCase() || 'PUBLISHED'
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
                                onClick={() =>
                                    navigate('/organisers/create-event')
                                }
                                icon={<Plus size={17} />}
                                className="!flex !min-h-[62px] !w-full !flex-row !items-center !justify-start !gap-4 !rounded-lg !border-l-4 !border-transparent !bg-transparent !px-4 !py-4 text-left !text-base !font-medium !text-slate-700 shadow-none transition hover:!bg-slate-100 dark:!text-slate-300 dark:hover:!bg-slate-800"
                            >
                                Create event
                            </CustomButton>

                            <CustomButton
                                variant="secondary"
                                fullWidth
                                onClick={() => navigate('/gate-check-in')}
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
                </aside>

                {/* DASHBOARD CONTENT */}
                <main className="min-w-0 flex-1">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {/* EVENT HEADER */}
                        <div className="mb-5">
                            <div className="mb-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                                <button
                                    onClick={() => navigate('/organisers')}
                                    className="hover:text-foreground"
                                >
                                    My events
                                </button>

                                <ChevronRight size={12} />
                                <span>{event.title}</span>
                            </div>

                            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                            {event.title}
                                        </h1>

                                        <span className="rounded bg-emerald-100 px-2 py-1 text-[9px] font-extrabold text-emerald-700">
                                            {eventStatus}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {formatDate(event.start_date)}
                                        {formatTime(event.start_date) &&
                                            ` · ${formatTime(event.start_date)}`}
                                        {' · '}
                                        {event.venue}, {event.city}
                                    </p>
                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        {formatCategory(event.category)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="mr-2 text-[10px] text-muted-foreground">
                                        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                                        Event details loaded
                                    </span>

                                    <button
                                        onClick={() =>
                                            navigate(
                                                '/organisers/create-event',
                                                {
                                                    state: { event },
                                                }
                                            )
                                        }
                                        className={`rounded-md border px-3 py-2 text-xs font-bold hover:bg-accent ${panelClass}`}
                                    >
                                        Edit event
                                    </button>

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/organisers/events/${event.id}/scanner`
                                            )
                                        }
                                        className="inline-flex items-center gap-2 rounded-md bg-headerBackground px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                                    >
                                        <ScanLine size={14} />
                                        OPEN SCANNER
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* EVENT BANNER */}
                        {event.banner_image && (
                            <div className="mb-5 overflow-hidden rounded-lg border border-border">
                                <img
                                    src={event.banner_image}
                                    alt={event.title}
                                    className="h-48 w-full object-cover sm:h-64"
                                />
                            </div>
                        )}

                        {/* STATISTICS */}
                        <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                            <div className="rounded-lg border border-headerBackground bg-headerBackground p-4 text-white">
                                <p className="text-[10px] font-semibold text-white/80">
                                    Tickets sold
                                </p>

                                <p className="mt-1 text-2xl font-extrabold">
                                    —
                                    <span className="ml-1 text-sm font-semibold text-white/80">
                                        /{' '}
                                        {totalCapacity.toLocaleString('en-GH')}
                                    </span>
                                </p>

                                <p className="mt-1 text-[9px] font-bold text-white/80">
                                    Sales data unavailable
                                </p>
                            </div>

                            <div
                                className={`rounded-lg border p-4 ${panelClass}`}
                            >
                                <p className="text-[10px] font-medium text-muted-foreground">
                                    Gross revenue
                                </p>

                                <p className="mt-1 text-xl font-extrabold sm:text-2xl">
                                    —
                                </p>

                                <p className="mt-1 text-[9px] text-muted-foreground">
                                    Awaiting sales data
                                </p>
                            </div>

                            <div
                                className={`rounded-lg border p-4 ${panelClass}`}
                            >
                                <p className="text-[10px] font-medium text-muted-foreground">
                                    Checked in
                                </p>

                                <p className="mt-1 text-xl font-extrabold sm:text-2xl">
                                    —
                                </p>

                                <p className="mt-1 text-[9px] text-muted-foreground">
                                    Check-in data unavailable
                                </p>
                            </div>

                            <div
                                className={`rounded-lg border p-4 ${panelClass}`}
                            >
                                <p className="text-[10px] font-medium text-muted-foreground">
                                    Tickets left
                                </p>

                                <p className="mt-1 text-xl font-extrabold sm:text-2xl">
                                    —
                                </p>

                                <p className="mt-1 text-[9px] text-muted-foreground">
                                    Capacity:{' '}
                                    {totalCapacity.toLocaleString('en-GH')}
                                </p>
                            </div>
                        </section>

                        {/* SALES CHART AND TICKET TYPES */}
                        <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-5">
                            {/* SALES CHART */}
                            <div
                                className={`rounded-lg border p-4 xl:col-span-3 ${panelClass}`}
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div>
                                        <h2 className="text-sm font-extrabold">
                                            Tickets sold per day
                                        </h2>

                                        <p className="mt-1 text-[10px] text-muted-foreground">
                                            Daily ticket sales
                                        </p>
                                    </div>
                                </div>

                                <div className="flex min-h-48 flex-col items-center justify-center rounded-md bg-muted/30 px-4 text-center">
                                    <CalendarDays
                                        size={28}
                                        className="text-muted-foreground"
                                    />

                                    <p className="mt-3 text-xs font-bold">
                                        No sales analytics available
                                    </p>

                                    <p className="mt-1 max-w-xs text-[10px] text-muted-foreground">
                                        The daily sales chart will appear here
                                        once the backend provides ticket sales
                                        statistics.
                                    </p>
                                </div>
                            </div>

                            {/* TICKET TYPE BREAKDOWN */}
                            <div
                                className={`rounded-lg border p-4 xl:col-span-2 ${panelClass}`}
                            >
                                <h2 className="mb-1 text-sm font-extrabold">
                                    Sales by ticket type
                                </h2>

                                <p className="mb-5 text-[10px] text-muted-foreground">
                                    Ticket types and available capacity
                                </p>

                                {ticketTypes.length > 0 ? (
                                    ticketTypes.map((ticket) => (
                                        <div
                                            key={ticket.id ?? ticket.name}
                                            className="mb-5 last:mb-0"
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <p className="text-xs font-extrabold">
                                                    {ticket.name.replace(
                                                        /_/g,
                                                        ' '
                                                    )}
                                                    {' · '}
                                                    {money(
                                                        Number(ticket.price)
                                                    )}
                                                </p>

                                                <p className="text-[10px] font-semibold">
                                                    {Number(
                                                        ticket.quantity
                                                    ).toLocaleString('en-GH')}
                                                </p>
                                            </div>

                                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full w-full rounded-full bg-emerald-600/30" />
                                            </div>

                                            <p className="mt-2 text-[9px] text-muted-foreground">
                                                {Number(
                                                    ticket.quantity
                                                ).toLocaleString('en-GH')}{' '}
                                                total capacity · Sales data
                                                unavailable
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-8 text-center text-xs text-muted-foreground">
                                        No ticket types have been added.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* RECENT ORDERS */}
                        <section
                            className={`overflow-hidden rounded-lg border ${panelClass}`}
                        >
                            <div className="flex items-center justify-between border-b border-inherit px-4 py-4">
                                <div>
                                    <h2 className="text-sm font-extrabold">
                                        Recent orders
                                    </h2>

                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        Orders for this event
                                    </p>
                                </div>

                                <button
                                    onClick={exportOrders}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-homeText underline underline-offset-2"
                                >
                                    <Download size={12} />
                                    Export CSV
                                </button>
                            </div>

                            {orders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[650px] text-left">
                                        <thead>
                                            <tr className="bg-muted text-[9px] font-bold uppercase text-muted-foreground">
                                                <th className="px-4 py-3">
                                                    Order
                                                </th>
                                                <th className="px-4 py-3">
                                                    Buyer
                                                </th>
                                                <th className="px-4 py-3">
                                                    Tickets
                                                </th>
                                                <th className="px-4 py-3">
                                                    Total
                                                </th>
                                                <th className="px-4 py-3">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {orders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="border-t border-inherit text-[10px]"
                                                >
                                                    <td className="px-4 py-3 font-semibold">
                                                        {order.id}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {order.buyer}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {order.tickets}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {money(order.total)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {order.status}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                                    <CheckCircle2
                                        size={28}
                                        className="text-muted-foreground"
                                    />

                                    <p className="mt-3 text-xs font-bold">
                                        No orders available
                                    </p>

                                    <p className="mt-1 text-[10px] text-muted-foreground">
                                        Customer orders will appear here when
                                        the orders API is connected.
                                    </p>
                                </div>
                            )}

                            <div className="border-t border-border px-4 py-3 text-[10px] text-muted-foreground">
                                Showing {orders.length} recent orders
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    )
}
