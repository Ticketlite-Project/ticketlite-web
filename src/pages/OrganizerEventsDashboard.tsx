import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Download,
    Plus,
    ScanLine,
    Ticket,
    Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type OrderStatus = 'Paid' | 'Held' | 'Payment failed'

interface Order {
    id: string
    buyer: string
    tickets: string
    total: number
    status: OrderStatus
}

const salesData = [12, 8, 15, 22, 18, 9, 30, 42, 26, 19, 35, 49, 53, 17]

const initialOrders: Order[] = [
    {
        id: 'TL-48291',
        buyer: 'Kwame A.',
        tickets: '2 × Regular',
        total: 80,
        status: 'Paid',
    },
    {
        id: 'TL-48290',
        buyer: 'Esi B.',
        tickets: '1 × VIP',
        total: 100,
        status: 'Paid',
    },
    {
        id: 'TL-48288',
        buyer: 'Yaw O.',
        tickets: '3 × Regular',
        total: 120,
        status: 'Held',
    },
    {
        id: 'TL-48285',
        buyer: 'Abena K.',
        tickets: '1 × Regular',
        total: 40,
        status: 'Payment failed',
    },
    {
        id: 'TL-48281',
        buyer: 'Kojo D.',
        tickets: '2 × VIP',
        total: 200,
        status: 'Paid',
    },
]

const money = (amount: number) =>
    `GHS ${amount.toLocaleString('en-GH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

const formatMoney = money

export default function OrganiserEventsDashboard() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [orders] = useState<Order[]>(initialOrders)
    const [notice, setNotice] = useState('')

    // Sample dashboard values. Replace with API data when connected.
    const event = {
        id: id ?? '1',
        name: 'Campus Jazz Night',
        status: 'PUBLISHED',
        date: 'Sat 14 Nov 2026',
        time: '7:00 PM',
        venue: 'Great Hall, KNUST, Kumasi',
        ticketsSold: 352,
        capacity: 500,
        revenue: 17200,
        checkedIn: 313,
        regularSold: 300,
        regularCapacity: 440,
        regularRevenue: 12000,
        vipSold: 52,
        vipCapacity: 60,
        vipRevenue: 5200,
    }

    const soldPercentage = Math.round(
        (event.ticketsSold / event.capacity) * 100
    )

    const checkedPercentage = Math.round(
        (event.checkedIn / event.ticketsSold) * 100
    )

    const averageOrder =
        event.ticketsSold > 0 ? event.revenue / event.ticketsSold : 0

    const totalOrders = useMemo(() => orders.length, [orders])

    const showNotice = (message: string) => {
        setNotice(message)
        window.setTimeout(() => setNotice(''), 3000)
    }

    const exportOrders = () => {
        const header = ['Order', 'Buyer', 'Tickets', 'Total', 'Status']

        const rows = orders.map((order) => [
            order.id,
            order.buyer,
            order.tickets,
            order.total,
            order.status,
        ])

        const csv = [header, ...rows]
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
        link.download = `${event.name.replace(/\s+/g, '-').toLowerCase()}-orders.csv`
        link.click()

        URL.revokeObjectURL(url)
        showNotice('Orders exported successfully.')
    }

    // const copyEventLink = async () => {
    //     try {
    //         await navigator.clipboard.writeText(
    //             `${window.location.origin}/events/${event.id}`
    //         )
    //         showNotice('Event link copied.')
    //     } catch {
    //         showNotice('Unable to copy event link.')
    //     }
    // }

    const panelClass = 'border-border bg-card text-card-foreground'

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex min-h-screen flex-col md:flex-row">
                {/* ORGANISER SIDEBAR */}
                <aside
                    className={`flex w-full shrink-0 flex-col border-r md:sticky md:top-0 md:h-screen md:w-56 ${panelClass}`}
                >
                    <div className="flex items-center gap-2 border-b border-border px-5 py-6">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-headerBackground text-white">
                            <Ticket size={17} />
                        </span>
                        <span className="text-lg font-extrabold">
                            Ticket<span className="text-homeText">Lite</span>
                        </span>
                    </div>

                    <div className="px-4 pt-7">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Organiser
                        </p>

                        <nav className="flex gap-2 overflow-x-auto md:flex-col">
                            <button
                                onClick={() => navigate('/organisers')}
                                className="flex shrink-0 items-center gap-3 rounded-lg bg-accent px-3 py-3 text-left text-xs font-bold text-accent-foreground"
                            >
                                <CalendarDays size={16} />
                                My events
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate('/organisers/create-event')
                                }
                                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                            >
                                <Plus size={16} />
                                Create event
                            </button>

                            <button
                                onClick={() => navigate('/gate-check-in')}
                                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                                <ScanLine size={16} />
                                Gate check-in
                            </button>

                            <button
                                onClick={() => navigate('/gate-staff')}
                                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                                <Users size={16} />
                                Gate staff
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* DASHBOARD CONTENT */}
                <main className="min-w-0 flex-1">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {/* BREADCRUMB AND EVENT HEADER */}
                        <div className="mb-5">
                            <div className="mb-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                                <button
                                    onClick={() => navigate('/organisers')}
                                    className="hover:text-foreground"
                                >
                                    My events
                                </button>
                                <ChevronRight size={12} />
                                <span>{event.name}</span>
                            </div>

                            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                            {event.name}
                                        </h1>
                                        <span className="rounded bg-ticket-warning-bg px-2 py-1 text-[9px] font-extrabold text-ticket-warning-fg">
                                            {event.status}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {event.date} · {event.time} ·{' '}
                                        {event.venue}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="mr-1 text-[10px] text-muted-foreground">
                                        <span className="mr-1 text-homeText">
                                            ●
                                        </span>
                                        Updated 2 min ago
                                    </span>

                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/organisers/events/${event.id}/edit`
                                            )
                                        }
                                        className={`rounded-md border px-3 py-2 text-xs font-bold hover:bg-accent ${panelClass}`}
                                    >
                                        Edit event
                                    </button>

                                    <button
                                        onClick={() =>
                                            navigate('/gate-check-in')
                                        }
                                        className="inline-flex items-center gap-2 rounded-md bg-headerBackground px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                                    >
                                        <ScanLine size={14} />
                                        OPEN SCANNER
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* STATISTIC CARDS */}
                        <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                            <div className="rounded-lg border border-headerBackground bg-headerBackground p-4 text-white">
                                <p className="text-[10px] font-semibold text-white/80">
                                    Tickets sold
                                </p>
                                <p className="mt-1 text-2xl font-extrabold">
                                    {event.ticketsSold}
                                    <span className="ml-1 text-sm font-semibold text-white/80">
                                        / {event.capacity}
                                    </span>
                                </p>
                                <p className="mt-1 text-[9px] font-bold text-white/80">
                                    {soldPercentage}% sell-through
                                </p>
                            </div>

                            <div
                                className={`rounded-lg border p-4 ${panelClass}`}
                            >
                                <p className="text-[10px] font-medium text-muted-foreground">
                                    Gross revenue
                                </p>
                                <p className="mt-1 text-xl font-extrabold sm:text-2xl">
                                    {formatMoney(event.revenue)}
                                </p>
                                <p className="mt-1 text-[9px] text-muted-foreground">
                                    Avg order {money(averageOrder)}
                                </p>
                            </div>

                            <div
                                className={`rounded-lg border p-4 ${panelClass}`}
                            >
                                <p className="text-[10px] font-medium text-muted-foreground">
                                    Checked in
                                </p>
                                <p className="mt-1 text-xl font-extrabold sm:text-2xl">
                                    {event.checkedIn}
                                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                                        / {event.ticketsSold}
                                    </span>
                                </p>
                                <p className="mt-1 text-[9px] text-muted-foreground">
                                    {checkedPercentage}% attendance so far
                                </p>
                            </div>

                            <div
                                className={`rounded-lg border p-4 ${panelClass}`}
                            >
                                <p className="text-[10px] font-medium text-muted-foreground">
                                    Tickets left
                                </p>
                                <p className="mt-1 text-xl font-extrabold sm:text-2xl">
                                    {event.capacity - event.ticketsSold}
                                </p>
                                <p className="mt-1 text-[9px] text-muted-foreground">
                                    VIP: {event.vipCapacity - event.vipSold}{' '}
                                    left
                                </p>
                            </div>
                        </section>

                        {/* CHART AND TICKET TYPE BREAKDOWN */}
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
                                            Last 14 days
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-muted-foreground">
                                            13 Nov
                                        </p>
                                        <p className="text-sm font-extrabold">
                                            52 tickets
                                        </p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex flex-col justify-between pb-7 pt-1">
                                        {[60, 40, 20, 0].map((number) => (
                                            <div
                                                key={number}
                                                className="flex items-center gap-2"
                                            >
                                                <span className="w-4 text-right text-[9px] text-muted-foreground">
                                                    {number}
                                                </span>
                                                <div className="h-px flex-1 border-t border-dashed border-border" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="relative ml-6 flex h-48 items-end justify-between gap-1 px-1 pb-7 pt-2">
                                        {salesData.map((value, index) => (
                                            <div
                                                key={index}
                                                className="flex h-full flex-1 items-end"
                                            >
                                                <div
                                                    title={`${value} tickets`}
                                                    className={`w-full rounded-t-sm transition hover:opacity-80 ${
                                                        index === 12
                                                            ? 'bg-homeText'
                                                            : 'bg-headerBackground'
                                                    }`}
                                                    style={{
                                                        height: `${(value / 60) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        <div className="absolute bottom-0 left-0 right-0 ml-0 flex justify-between pl-0 text-[9px] text-muted-foreground">
                                            {salesData.map((_, index) => (
                                                <span
                                                    key={index}
                                                    className="flex-1 text-center"
                                                >
                                                    {index % 2 === 0
                                                        ? index + 1
                                                        : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SALES BY TICKET TYPE */}
                            <div
                                className={`rounded-lg border p-4 xl:col-span-2 ${panelClass}`}
                            >
                                <h2 className="mb-4 text-sm font-extrabold">
                                    Sales by ticket type
                                </h2>

                                <div className="mb-5">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <p className="text-xs font-extrabold">
                                            Regular · GHS 40
                                        </p>
                                        <p className="text-[10px] font-semibold">
                                            {event.regularSold} /{' '}
                                            {event.regularCapacity}
                                        </p>
                                    </div>

                                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-headerBackground"
                                            style={{
                                                width: `${(event.regularSold / event.regularCapacity) * 100}%`,
                                            }}
                                        />
                                    </div>

                                    <p className="mt-2 text-[9px] text-muted-foreground">
                                        {formatMoney(event.regularRevenue)}{' '}
                                        revenue ·{' '}
                                        {Math.round(
                                            (event.regularSold /
                                                event.regularCapacity) *
                                                100
                                        )}
                                        % sold
                                    </p>
                                </div>

                                <div className="mb-5">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <p className="text-xs font-extrabold">
                                            VIP · GHS 100
                                        </p>
                                        <p className="text-[10px] font-semibold">
                                            {event.vipSold} /{' '}
                                            {event.vipCapacity}
                                        </p>
                                    </div>

                                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-headerBackground"
                                            style={{
                                                width: `${(event.vipSold / event.vipCapacity) * 100}%`,
                                            }}
                                        />
                                    </div>

                                    <p className="mt-2 text-[9px] text-muted-foreground">
                                        {formatMoney(event.vipRevenue)} revenue
                                        ·{' '}
                                        {Math.round(
                                            (event.vipSold /
                                                event.vipCapacity) *
                                                100
                                        )}
                                        % sold
                                    </p>
                                </div>

                                <div className="rounded-md bg-ticket-warning-bg p-3 text-[10px] leading-relaxed text-ticket-warning-fg">
                                    VIP is close to selling out. You can add
                                    more VIP tickets from Edit event.
                                </div>
                            </div>
                        </section>

                        {/* RECENT ORDERS */}
                        <section
                            className={`overflow-hidden rounded-lg border ${panelClass}`}
                        >
                            <div className="flex items-center justify-between border-b border-inherit px-4 py-4">
                                <h2 className="text-sm font-extrabold">
                                    Recent orders
                                </h2>

                                <button
                                    onClick={exportOrders}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-homeText underline underline-offset-2"
                                >
                                    <Download size={12} />
                                    Export CSV
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[650px] text-left">
                                    <thead>
                                        <tr className="bg-muted text-[9px] font-bold uppercase text-muted-foreground">
                                            <th className="px-4 py-3">Order</th>
                                            <th className="px-4 py-3">Buyer</th>
                                            <th className="px-4 py-3">
                                                Tickets
                                            </th>
                                            <th className="px-4 py-3">Total</th>
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
                                                    {order.status === 'Paid' ? (
                                                        <span className="inline-flex items-center gap-1 font-bold text-homeText">
                                                            <span>●</span> Paid
                                                        </span>
                                                    ) : order.status ===
                                                      'Held' ? (
                                                        <span className="font-semibold text-muted-foreground">
                                                            ● Held · 6 min left
                                                        </span>
                                                    ) : (
                                                        <span className="font-bold text-destructive">
                                                            ● Payment failed
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="border-t border-border px-4 py-3 text-[10px] text-muted-foreground">
                                Showing {totalOrders} recent orders
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* NOTIFICATION */}
            {notice && (
                <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-xs font-semibold text-background shadow-xl">
                    <CheckCircle2 size={16} className="text-homeText" />
                    {notice}
                </div>
            )}
        </div>
    )
}
