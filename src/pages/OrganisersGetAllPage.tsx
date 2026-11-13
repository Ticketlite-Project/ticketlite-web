import {
    Ban,
    CalendarDays,
    Check,
    Copy,
    EllipsisVertical,
    Eye,
    Moon,
    Plus,
    Search,
    Sun,
    Ticket,
    Users,
    X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { CustomButton } from '../components/Button/custom-button'

type EventStatus = 'published' | 'draft' | 'ended' | 'cancelled'

interface OrganiserEvent {
    id: number
    title: string
    date: string
    time: string
    venue: string
    status: EventStatus
    sold: number
    capacity: number
    revenue: number
}

type FilterTab = 'All' | 'Published' | 'Drafts' | 'Past' | 'Cancelled'

const initialEvents: OrganiserEvent[] = [
    {
        id: 1,
        title: 'Campus Jazz Night',
        date: 'Nov 14',
        time: 'Sat 14 Nov · 7:00 PM',
        venue: 'Great Hall, KNUST',
        status: 'published',
        sold: 352,
        capacity: 500,
        revenue: 17200,
    },
    {
        id: 2,
        title: 'Lunchtime Acoustic Set',
        date: 'Dec 2',
        time: 'Wed 2 Dec · 12:30 PM',
        venue: 'Students Centre, KNUST',
        status: 'published',
        sold: 64,
        capacity: 150,
        revenue: 1280,
    },
    {
        id: 3,
        title: 'End-of-Semester Choir Concert',
        date: 'Dec 11',
        time: 'Fri 11 Dec · 6:00 PM',
        venue: 'Great Hall, KNUST',
        status: 'draft',
        sold: 0,
        capacity: 300,
        revenue: 0,
    },
    {
        id: 4,
        title: "Freshers' Welcome Jam",
        date: 'Sep 26',
        time: 'Sat 26 Sep · 8:00 PM',
        venue: 'Unity Hall, KNUST',
        status: 'ended',
        sold: 212,
        capacity: 250,
        revenue: 9760,
    },
    {
        id: 5,
        title: 'Open Mic Night',
        date: 'Oct 30',
        time: 'Fri 30 Oct · 7:00 PM',
        venue: 'Was at Great Hall, KNUST',
        status: 'cancelled',
        sold: 0,
        capacity: 120,
        revenue: 0,
    },
]

const filters: FilterTab[] = ['All', 'Published', 'Drafts', 'Past', 'Cancelled']

const formatMoney = (amount: number) => `GHS ${amount.toLocaleString('en-GH')}`

export default function OrganisersGetAllPage() {
    const navigate = useNavigate()

    const [events, setEvents] = useState(initialEvents)
    const [activeFilter, setActiveFilter] = useState<FilterTab>('All')
    const [openMenu, setOpenMenu] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem('ticketlite-organiser-dark') === 'true'
    )
    const [notice, setNotice] = useState('')

    const upcomingEvents = events.filter(
        (event) => event.status === 'published'
    ).length

    const totalSold = events.reduce((sum, event) => sum + event.sold, 0)

    const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0)

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

    const copyEventLink = async (eventId: number) => {
        const link = `${window.location.origin}/events/${eventId}`

        try {
            await navigator.clipboard.writeText(link)
            showNotice('Event link copied successfully.')
        } catch {
            showNotice('Unable to copy the link. Please copy it manually.')
        }

        setOpenMenu(null)
    }

    const duplicateEvent = (event: OrganiserEvent) => {
        const duplicate: OrganiserEvent = {
            ...event,
            id: Math.max(0, ...events.map((item) => item.id)) + 1,
            title: `${event.title} (Copy)`,
            status: 'draft',
            sold: 0,
            revenue: 0,
        }

        setEvents((current) => [...current, duplicate])
        setActiveFilter('All')
        setOpenMenu(null)
        showNotice('Event duplicated as a draft.')
    }

    const cancelEvent = (eventId: number) => {
        const confirmed = window.confirm(
            'Are you sure you want to cancel this event?'
        )

        if (!confirmed) return

        setEvents((current) =>
            current.map((event) =>
                event.id === eventId ? { ...event, status: 'cancelled' } : event
            )
        )

        setOpenMenu(null)
        showNotice('Event marked as cancelled.')
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
                    className={`flex w-full flex-col border-r md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 ${panelTheme}`}
                >
                    <div className="flex items-center gap-2 border-b border-border px-6 py-6">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-headerBackground text-white">
                            <Ticket size={18} />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight">
                            Ticket<span className="text-homeText">Lite</span>
                        </span>
                    </div>

                    <div className="px-5 pt-7">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Organiser
                        </p>

                        <nav className="flex gap-2 overflow-x-auto md:flex-col">
                            <CustomButton
                                variant="secondary"
                                onClick={() => navigate('/organisers')}
                                className="flex shrink-0 items-center gap-3 rounded-lg bg-accent px-3 py-3 text-left text-sm font-bold text-accent-foreground"
                            >
                                <CalendarDays size={17} />
                                My events
                            </CustomButton>

                            <button
                                onClick={() =>
                                    navigate('/organisers/create-event')
                                }
                                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Plus size={17} />
                                Create event
                            </button>

                            <button
                                onClick={() => navigate('/gate-check-in')}
                                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                            >
                                <Check size={17} />
                                Gate check-in
                            </button>

                            <button
                                onClick={() => navigate('/gate-staff')}
                                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                            >
                                <Users size={17} />
                                Gate staff
                            </button>
                        </nav>
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
                                onClick={() =>
                                    navigate('/organisers/create-event')
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
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
                                    {totalSold.toLocaleString()}
                                </p>
                            </div>

                            <div
                                className={`rounded-xl border p-5 ${panelTheme}`}
                            >
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Gross revenue, all events
                                </p>
                                <p className="mt-1 text-2xl font-extrabold">
                                    {formatMoney(totalRevenue)}
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
                                            <button
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
                                            </button>
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
                                        {visibleEvents.map((event) => {
                                            const percentage =
                                                event.capacity > 0
                                                    ? Math.min(
                                                          100,
                                                          (event.sold /
                                                              event.capacity) *
                                                              100
                                                      )
                                                    : 0

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
                                                                {event.sold} /{' '}
                                                                {event.capacity}
                                                            </p>
                                                            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className="h-full rounded-full bg-headerBackground"
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-4 text-xs font-medium">
                                                        {event.revenue > 0
                                                            ? formatMoney(
                                                                  event.revenue
                                                              )
                                                            : '—'}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {event.status ===
                                                                'published' && (
                                                                <>
                                                                    <button
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/organisers/events/${event.id}/edit`
                                                                            )
                                                                        }
                                                                        className="rounded-md border border-border px-3 py-2 text-[10px] font-bold text-homeText hover:bg-accent"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/organisers/events/${event.id}/dashboard`
                                                                            )
                                                                        }
                                                                        className="rounded-md bg-headerBackground px-3 py-2 text-[10px] font-bold text-white hover:opacity-90"
                                                                    >
                                                                        Dashboard
                                                                    </button>
                                                                </>
                                                            )}

                                                            {event.status ===
                                                                'draft' && (
                                                                <button
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/organisers/events/${event.id}/edit`
                                                                        )
                                                                    }
                                                                    className="rounded-md border border-border px-3 py-2 text-[10px] font-bold text-homeText hover:bg-accent"
                                                                >
                                                                    Edit draft
                                                                </button>
                                                            )}

                                                            {event.status ===
                                                                'ended' && (
                                                                <button
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/organisers/events/${event.id}/dashboard`
                                                                        )
                                                                    }
                                                                    className="rounded-md border border-border px-3 py-2 text-[10px] font-bold text-homeText hover:bg-accent"
                                                                >
                                                                    Dashboard
                                                                </button>
                                                            )}

                                                            {event.status ===
                                                                'cancelled' && (
                                                                <button
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/events/${event.id}`
                                                                        )
                                                                    }
                                                                    className="rounded-md border border-border px-3 py-2 text-[10px] font-bold text-homeText hover:bg-accent"
                                                                >
                                                                    View
                                                                </button>
                                                            )}

                                                            <div className="relative">
                                                                <button
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
                                                                </button>

                                                                {openMenu ===
                                                                    event.id && (
                                                                    <div
                                                                        className={`absolute right-0 top-10 z-30 w-48 rounded-lg border p-1 shadow-xl ${panelTheme}`}
                                                                    >
                                                                        <button
                                                                            onClick={() => {
                                                                                navigate(
                                                                                    `/events/${event.id}`
                                                                                )
                                                                                setOpenMenu(
                                                                                    null
                                                                                )
                                                                            }}
                                                                            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
                                                                        >
                                                                            <Eye
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                            View
                                                                            public
                                                                            page
                                                                        </button>

                                                                        <button
                                                                            onClick={() =>
                                                                                void copyEventLink(
                                                                                    event.id
                                                                                )
                                                                            }
                                                                            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
                                                                        >
                                                                            <Copy
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                            Copy
                                                                            event
                                                                            link
                                                                        </button>

                                                                        <button
                                                                            onClick={() =>
                                                                                duplicateEvent(
                                                                                    event
                                                                                )
                                                                            }
                                                                            className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
                                                                        >
                                                                            <Plus
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                            Duplicate
                                                                            event
                                                                        </button>

                                                                        {event.status !==
                                                                            'cancelled' && (
                                                                            <>
                                                                                <div className="my-1 border-t border-border" />
                                                                                <button
                                                                                    onClick={() =>
                                                                                        cancelEvent(
                                                                                            event.id
                                                                                        )
                                                                                    }
                                                                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-xs text-destructive hover:bg-destructive/10"
                                                                                >
                                                                                    <Ban
                                                                                        size={
                                                                                            14
                                                                                        }
                                                                                    />
                                                                                    Cancel
                                                                                    event
                                                                                </button>
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

                                        {visibleEvents.length === 0 && (
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
                        <button
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
                        </button>
                    </div>
                </main>
            </div>

            {/* FEEDBACK MESSAGE */}
            {notice && (
                <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background shadow-xl">
                    <Check size={16} className="text-homeText" />
                    {notice}
                    <button
                        onClick={() => setNotice('')}
                        className="hover:opacity-70"
                    >
                        <X size={15} />
                    </button>
                </div>
            )}
        </div>
    )
}
