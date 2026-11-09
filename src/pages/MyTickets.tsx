
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import {
    CalendarDays,
    ChevronRight,
    Download,
    Moon,
    Sun,
    Ticket,
    CheckCircle2,
    ArrowLeft,
} from 'lucide-react'

interface TicketData {
    ticketId: string
    paymentReference: string
    eventName: string
    ticketType: string
    eventDate: string
    eventTime: string
    venue: string
    phoneNumber: string
    network: string
    amount: number
    status: 'valid' | 'scanned'
    createdAt: string
}

const STORAGE_KEY = 'ticketlite_tickets'

export default function MyTickets() {
    const navigate = useNavigate()

    const [tickets, setTickets] = useState<TicketData[]>([])
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
    const [selectedTicket, setSelectedTicket] = useState(0)
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        try {
            const savedTickets = localStorage.getItem(STORAGE_KEY)

            if (savedTickets) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setTickets(JSON.parse(savedTickets))
            }
        } catch (error) {
            console.error('Unable to load tickets:', error)
        }
    }, [])

    const isPastEvent = (date: string) => {
        const parsedDate = new Date(date)

        if (Number.isNaN(parsedDate.getTime())) {
            return false
        }

        // eslint-disable-next-line react-hooks/purity
        return parsedDate.getTime() < Date.now()
    }

    const upcomingTickets = tickets.filter(
        (ticket) => !isPastEvent(ticket.eventDate)
    )

    const pastTickets = tickets.filter(
        (ticket) => isPastEvent(ticket.eventDate)
    )

    const displayedTickets =
        activeTab === 'upcoming' ? upcomingTickets : pastTickets

    const currentTicket = displayedTickets[selectedTicket]

    const handleTabChange = (tab: 'upcoming' | 'past') => {
        setActiveTab(tab)
        setSelectedTicket(0)
    }

    const nextTicket = () => {
        setSelectedTicket((previous) =>
            previous < displayedTickets.length - 1 ? previous + 1 : 0
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const previousTicket = () => {
        setSelectedTicket((previous) =>
            previous > 0 ? previous - 1 : displayedTickets.length - 1
        )
    }

    const downloadTicket = () => {
        window.print()
    }

    const formatAmount = (amount: number) =>
        `GHS ${Number(amount).toFixed(2)}`

    return (
        <main
            className={`min-h-screen transition-colors duration-300 ${
                darkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'
            }`}
        >
            <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white shadow-xl dark:bg-gray-900">

                {/* HEADER */}
                <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-5 dark:border-gray-800 dark:bg-gray-900">
                    <div>
                        <h1 className="text-xl font-extrabold">
                            My tickets
                        </h1>
                        <p className="mt-1 text-xs text-gray-500">
                            Your event tickets in one place
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/events')}
                            className="text-sm font-bold text-emerald-700 underline"
                        >
                            Find events
                        </button>

                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            aria-label="Toggle theme"
                            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            {darkMode ? (
                                <Sun size={19} />
                            ) : (
                                <Moon size={19} />
                            )}
                        </button>
                    </div>
                </header>

                {/* TABS */}
                <div className="flex border-b border-gray-200 px-4 dark:border-gray-800">
                    <button
                        onClick={() => handleTabChange('upcoming')}
                        className={`border-b-2 px-1 py-4 text-sm font-bold ${
                            activeTab === 'upcoming'
                                ? 'border-emerald-600 text-gray-950 dark:text-white'
                                : 'border-transparent text-gray-500'
                        }`}
                    >
                        Upcoming ({upcomingTickets.length})
                    </button>

                    <button
                        onClick={() => handleTabChange('past')}
                        className={`ml-6 border-b-2 px-1 py-4 text-sm font-bold ${
                            activeTab === 'past'
                                ? 'border-emerald-600 text-gray-950 dark:text-white'
                                : 'border-transparent text-gray-500'
                        }`}
                    >
                        Past
                    </button>
                </div>

                <div className="space-y-3 p-3">

                    {/* NO TICKETS */}
                    {displayedTickets.length === 0 && (
                        <div className="flex min-h-[450px] flex-col items-center justify-center px-6 text-center">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                                <Ticket
                                    size={36}
                                    className="text-emerald-700"
                                />
                            </div>

                            <h2 className="text-xl font-bold">
                                {activeTab === 'upcoming'
                                    ? 'No upcoming tickets'
                                    : 'No past tickets'}
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {activeTab === 'upcoming'
                                    ? 'You have not purchased any upcoming event tickets yet.'
                                    : 'Your previous event tickets will appear here.'}
                            </p>

                            <button
                                onClick={() => navigate('/events')}
                                className="mt-6 rounded-lg bg-emerald-700 px-7 py-3 text-sm font-bold text-white hover:bg-emerald-800"
                            >
                                EXPLORE EVENTS
                            </button>
                        </div>
                    )}

                    {/* SELECTED TICKET */}
                    {currentTicket && (
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">

                            {/* EVENT HEADER */}
                            <div className="relative bg-emerald-700 px-4 py-4 text-white">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                                    {currentTicket.ticketType} · TICKET{' '}
                                    {selectedTicket + 1} OF {displayedTickets.length}
                                </p>

                                <h2 className="mt-1 text-xl font-extrabold">
                                    {currentTicket.eventName}
                                </h2>

                                <p className="mt-1 text-xs text-emerald-100">
                                    {currentTicket.eventDate} ·{' '}
                                    {currentTicket.eventTime} ·{' '}
                                    {currentTicket.venue}
                                </p>
                            </div>

                            {/* QR CODE */}
                            <div className="flex flex-col items-center px-5 py-6">

                                <div className="rounded-lg bg-white p-3">
                                    <QRCodeSVG
                                        value={`TICKETLITE:${currentTicket.ticketId}:${currentTicket.paymentReference}`}
                                        size={190}
                                        level="H"
                                        includeMargin
                                    />
                                </div>

                                <p className="mt-4 text-xs font-medium text-gray-500">
                                    {currentTicket.ticketId}
                                </p>

                                {/* STATUS */}
                                <div
                                    className={`mt-3 flex items-center gap-2 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide ${
                                        currentTicket.status === 'valid'
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            currentTicket.status === 'valid'
                                                ? 'bg-emerald-600'
                                                : 'bg-gray-500'
                                        }`}
                                    />

                                    {currentTicket.status === 'valid'
                                        ? 'Valid · Not yet scanned'
                                        : 'Scanned'}
                                </div>

                                <p className="mt-4 max-w-[290px] text-center text-xs leading-5 text-gray-400">
                                    Turn your screen brightness up at the gate.
                                    Each QR code works once.
                                </p>

                                {/* TICKET ACTIONS */}
                                <div className="mt-5 grid w-full grid-cols-2 gap-2">
                                    <button
                                        onClick={downloadTicket}
                                        className="flex items-center justify-center gap-2 rounded-sm bg-emerald-700 py-3 text-xs font-bold text-white hover:bg-emerald-800"
                                    >
                                        <Download size={15} />
                                        DOWNLOAD
                                    </button>

                                    <button
                                        onClick={nextTicket}
                                        disabled={displayedTickets.length <= 1}
                                        className="rounded-sm bg-gray-100 py-3 text-xs font-bold text-emerald-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        NEXT TICKET
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OTHER TICKETS */}
                    {displayedTickets.map((ticket, index) => {
                        if (index === selectedTicket) return null

                        return (
                            <button
                                key={ticket.ticketId}
                                onClick={() => setSelectedTicket(index)}
                                className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                            >
                                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
                                    <CalendarDays size={15} />
                                    <span className="mt-1 text-[9px] font-bold">
                                        {index + 1}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-bold">
                                        {ticket.eventName}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {ticket.ticketType} · {ticket.venue}
                                    </p>

                                    <p className="mt-1 text-[10px] text-gray-400">
                                        {ticket.eventDate}
                                    </p>
                                </div>

                                <ChevronRight
                                    size={19}
                                    className="shrink-0 text-emerald-700"
                                />
                            </button>
                        )
                    })}

                    {/* FOOTER INFORMATION */}
                    {currentTicket && (
                        <div className="space-y-2 rounded-lg bg-emerald-50 p-4 dark:bg-gray-800">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                                <CheckCircle2 size={16} />
                                Payment information
                            </div>

                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                Amount: {formatAmount(currentTicket.amount)}
                            </p>

                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                Network: {currentTicket.network}
                            </p>

                            <p className="break-all text-xs text-gray-600 dark:text-gray-300">
                                Reference: {currentTicket.paymentReference}
                            </p>
                        </div>
                    )}

                    {/* BOTTOM NAVIGATION */}
                    <div className="flex justify-between border-t border-gray-100 pt-5 dark:border-gray-800">
                        <button
                            onClick={() => navigate('/events')}
                            className="flex items-center gap-2 text-xs font-bold text-emerald-700"
                        >
                            <ArrowLeft size={15} />
                            FIND EVENTS
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="text-xs font-bold text-gray-500"
                        >
                            HOME
                        </button>
                    </div>
                </div>
            </div>

            {/* PRINT STYLING */}
            <style>{`
                @media print {
                    body {
                        background: white !important;
                    }

                    body * {
                        visibility: hidden;
                    }

                    main,
                    main * {
                        visibility: visible;
                    }

                    main {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                    }

                    header,
                    main > div > div > div:first-of-type,
                    main button,
                    main > div > div > div:last-child {
                        display: none !important;
                    }

                    main > div {
                        max-width: 100% !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </main>
    )
}
