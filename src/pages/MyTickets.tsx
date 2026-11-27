
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Download,
    MapPin,
    Ticket,
} from 'lucide-react'
import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { apiClient } from '@/src/api/axios'
import { CustomButton } from '../components/Button/custom-button'

interface TicketData {
    ticketId: string
    ticketCode: string
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

interface ApiTicket {
    id: number
    ticket_code: string
    event_title: string
    ticket_type: string
    status: string
    qr_code_url?: string
    issued_at: string
}

type ApiTicketResponse =
    | ApiTicket[]
    | {
          results?: ApiTicket[]
          tickets?: ApiTicket[]
          data?: ApiTicket[] | {
              results?: ApiTicket[]
              tickets?: ApiTicket[]
          }
      }

function getTicketArray(data: unknown): ApiTicket[] {
    if (Array.isArray(data)) {
        return data as ApiTicket[]
    }

    if (
        typeof data !== 'object' ||
        data === null
    ) {
        return []
    }

    const response = data as Record<string, unknown>

    if (Array.isArray(response.results)) {
        return response.results as ApiTicket[]
    }

    if (Array.isArray(response.tickets)) {
        return response.tickets as ApiTicket[]
    }

    if (Array.isArray(response.data)) {
        return response.data as ApiTicket[]
    }

    if (
        typeof response.data === 'object' &&
        response.data !== null
    ) {
        const nested = response.data as Record<string, unknown>

        if (Array.isArray(nested.results)) {
            return nested.results as ApiTicket[]
        }

        if (Array.isArray(nested.tickets)) {
            return nested.tickets as ApiTicket[]
        }
    }

    return []
}

function normalizeTicket(ticket: ApiTicket): TicketData {
    const rawStatus = ticket.status?.toUpperCase()

    return {
        ticketId: String(ticket.id),
        ticketCode: ticket.ticket_code || '',
        paymentReference: '',
        eventName: ticket.event_title || 'Event',
        ticketType: ticket.ticket_type || 'General Admission',
        eventDate: '',
        eventTime: '',
        venue: 'Venue not provided',
        phoneNumber: '',
        network: '',
        amount: 0,
        status:
            rawStatus === 'VALID'
                ? 'valid'
                : 'scanned',
        createdAt: ticket.issued_at || '',
    }
}

function isPastEvent(date: string): boolean {
    if (!date) return false

    const parsedDate = new Date(date)

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.getTime() < Date.now()
    )
}



export default function MyTickets() {
    const navigate = useNavigate()

    const [tickets, setTickets] = useState<TicketData[]>([])
    const [activeTab, setActiveTab] = useState<
        'upcoming' | 'past'
    >('upcoming')

    const [selectedTicketId, setSelectedTicketId] = useState<
        string | null
    >(null)

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    // Retrieve tickets from the backend.
    useEffect(() => {
        let isMounted = true

        const loadTickets = async () => {
            try {
                const response =
                    await apiClient.get<ApiTicketResponse>(
                        '/bookings/my-tickets/'
                    )

                if (!isMounted) return

                const apiTickets = getTicketArray(response.data)

                const normalizedTickets =
                    apiTickets.map(normalizeTicket)

                setTickets(normalizedTickets)

                setSelectedTicketId(
                    normalizedTickets[0]?.ticketId ?? null
                )
            } catch (err) {
                console.error(
                    'Unable to retrieve tickets:',
                    err
                )

                if (isMounted) {
                    setError(
                        'We could not retrieve your tickets. Please check your connection and try again.'
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        void loadTickets()

        return () => {
            isMounted = false
        }
    }, [])

    // Retry ticket retrieval.
    const handleRetry = async () => {
        setIsLoading(true)
        setError('')

        try {
            const response =
                await apiClient.get<ApiTicketResponse>(
                    '/bookings/my-tickets/'
                )

            const apiTickets = getTicketArray(response.data)

            const normalizedTickets =
                apiTickets.map(normalizeTicket)

            setTickets(normalizedTickets)

            setSelectedTicketId(
                normalizedTickets[0]?.ticketId ?? null
            )
        } catch (err) {
            console.error(
                'Unable to retrieve tickets:',
                err
            )

            setError(
                'We could not retrieve your tickets. Please check your connection and try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    const upcomingTickets = useMemo(
        () =>
            tickets.filter(
                (ticket) => !isPastEvent(ticket.eventDate)
            ),
        [tickets]
    )

    const pastTickets = useMemo(
        () =>
            tickets.filter(
                (ticket) => isPastEvent(ticket.eventDate)
            ),
        [tickets]
    )

    const displayedTickets =
        activeTab === 'upcoming'
            ? upcomingTickets
            : pastTickets

    const selectedTicket =
        displayedTickets.find(
            (ticket) =>
                ticket.ticketId === selectedTicketId
        ) ??
        displayedTickets[0] ??
        null

    const handleTabChange = (
        tab: 'upcoming' | 'past'
    ) => {
        setActiveTab(tab)
        setSelectedTicketId(null)
    }

    const handleSelectTicket = (ticketId: string) => {
        setSelectedTicketId(ticketId)
    }

    const downloadTicket = () => {
        window.print()
    }

    return (
        <section className="min-h-screen bg-background text-foreground">
            {/* Navbar is rendered globally by MainLayout. */}

            <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-green-700">
                            Your TicketLite account
                        </p>

                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                            My tickets
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                            View your event tickets, access your QR
                            codes and keep your booking details in one
                            place.
                        </p>
                    </div>

                    <CustomButton
                        variant="primary"
                        type="button"
                        icon={<Ticket className="mr-2 h-4 w-4" />}
                        onClick={() => navigate('/events')}
                        className="flex w-fit items-center justify-center px-5 py-3 text-sm transition"
                    >
                        Find events
                    </CustomButton>
                </div>

                {/* Ticket navigation */}
                <div className="sticky top-16 z-20 -mx-4 border-b border-gray-200 bg-background/95 px-4 backdrop-blur md:mx-0 md:px-0">
                    <nav
                        aria-label="Ticket categories"
                        className="flex gap-8 overflow-x-auto"
                    >
                        <button
                            type="button"
                            onClick={() =>
                                handleTabChange('upcoming')
                            }
                            aria-current={
                                activeTab === 'upcoming'
                                    ? 'page'
                                    : undefined
                            }
                            className={`shrink-0 cursor-pointer border-b-2 py-4 text-sm font-bold transition-colors ${
                                activeTab === 'upcoming'
                                    ? 'border-green-700 text-green-900'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            Upcoming events

                            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                {upcomingTickets.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleTabChange('past')
                            }
                            aria-current={
                                activeTab === 'past'
                                    ? 'page'
                                    : undefined
                            }
                            className={`shrink-0 cursor-pointer border-b-2 py-4 text-sm font-bold transition-colors ${
                                activeTab === 'past'
                                    ? 'border-green-700 text-green-900'
                                    : 'border-transparent text-gray-500 hover:text-green-800'
                            }`}
                        >
                            Past events

                            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                {pastTickets.length}
                            </span>
                        </button>
                    </nav>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="flex min-h-80 flex-col items-center justify-center py-12">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

                        <p className="mt-4 text-sm text-muted-foreground">
                            Retrieving your tickets...
                        </p>
                    </div>
                )}

                {/* Error state */}
                {!isLoading && error && (
                    <div
                        role="alert"
                        className="my-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center"
                    >
                        <p className="font-semibold text-red-800">
                            Unable to load your tickets
                        </p>

                        <p className="mt-2 text-sm text-red-700">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => void handleRetry()}
                            className="mt-5 rounded-lg bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-800"
                        >
                            TRY AGAIN
                        </button>
                    </div>
                )}

                {/* Ticket content */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-3">
                        {/* Selected ticket and QR code */}
                        <aside className="ticket-print-area lg:col-span-1">
                            <div className="mb-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Ticket details
                                </p>

                                <h2 className="mt-1 text-2xl font-extrabold">
                                    Your entry pass
                                </h2>
                            </div>

                            {selectedTicket ? (
                                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-card shadow-sm">
                                    <div className="bg-green-800 px-5 py-5 text-white">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-100">
                                            {selectedTicket.ticketType}
                                        </p>

                                        <h3 className="mt-2 text-xl font-extrabold">
                                            {selectedTicket.eventName}
                                        </h3>

                                        <p className="mt-2 text-xs text-green-100">
                                            Ticket #{selectedTicket.ticketId}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center px-5 py-6">
                                        <div className="flex min-h-[214px] w-full items-center justify-center rounded-xl border border-gray-100 bg-white p-3">
                                            {selectedTicket.ticketCode ? (
                                                <QRCodeSVG
                                                    value={selectedTicket.ticketCode}
                                                    size={190}
                                                    level="H"
                                                    includeMargin
                                                    title={`Ticket QR code for ${selectedTicket.eventName}`}
                                                />
                                            ) : (
                                                <div className="px-4 text-center">
                                                    <Ticket className="mx-auto h-10 w-10 text-gray-400" />

                                                    <p className="mt-2 text-sm font-semibold text-gray-600">
                                                        QR code unavailable
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        This ticket does not have a ticket code.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <p className="mt-3 break-all text-center text-xs font-medium text-gray-500">
                                            {selectedTicket.ticketCode}
                                        </p>

                                        <span
                                            className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide ${
                                                selectedTicket.status ===
                                                'valid'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            <span
                                                className={`h-2 w-2 rounded-full ${
                                                    selectedTicket.status ===
                                                    'valid'
                                                        ? 'bg-green-600'
                                                        : 'bg-gray-500'
                                                }`}
                                            />

                                            {selectedTicket.status ===
                                            'valid'
                                                ? 'Valid · Not yet scanned'
                                                : 'Scanned / Used'}
                                        </span>

                                        <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                                            Turn your screen brightness
                                            up at the gate. Each QR code
                                            works once.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={downloadTicket}
                                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 py-3 text-xs font-bold text-white hover:bg-green-800 print:hidden"
                                        >
                                            <Download className="h-4 w-4" />
                                            PRINT / DOWNLOAD TICKET
                                        </button>
                                    </div>

                                    <div className="space-y-2 border-t border-gray-100 bg-green-50 p-5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-green-800">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Ticket information
                                        </div>

                                        <p className="text-xs text-gray-600">
                                            
                                        </p>

                                        <p className="text-xs text-gray-600">
                                            
                                        </p>

                                        <p className="text-xs text-gray-600">
                                            Payment details: Refer to your booking confirmation.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-card p-6 text-center text-sm text-gray-500">
                                    Select an event ticket to view
                                    its QR code and ticket details.
                                </div>
                            )}
                        </aside>

                        {/* Event and ticket list */}
                        <section className="lg:col-span-2">
                            <div className="mb-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    {activeTab === 'upcoming'
                                        ? 'Ready for your next event'
                                        : 'Your event history'}
                                </p>

                                <h2 className="mt-1 text-2xl font-extrabold">
                                    {activeTab === 'upcoming'
                                        ? 'Upcoming tickets'
                                        : 'Past tickets'}
                                </h2>
                            </div>

                            {displayedTickets.length === 0 ? (
                                <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-card px-6 py-12 text-center">
                                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                                        <Ticket className="h-8 w-8 text-green-700" />
                                    </div>

                                    <h3 className="text-xl font-bold">
                                        {activeTab === 'upcoming'
                                            ? 'No upcoming tickets yet'
                                            : 'No past tickets'}
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                        {activeTab === 'upcoming'
                                            ? 'Tickets for events you book will appear here.'
                                            : 'When you have attended events, your previous tickets will appear here.'}
                                    </p>

                                    {activeTab === 'upcoming' && (
                                        <CustomButton
                                            variant="primary"
                                            type="button"
                                            to="/events"
                                            className="mt-6 px-6 py-3 text-sm transition"
                                        >
                                            Explore events
                                        </CustomButton>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    {displayedTickets.map((ticket) => {
                                        const isSelected =
                                            selectedTicket?.ticketId ===
                                            ticket.ticketId

                                        return (
                                            <button
                                                type="button"
                                                key={ticket.ticketId}
                                                onClick={() =>
                                                    handleSelectTicket(
                                                        ticket.ticketId
                                                    )
                                                }
                                                aria-pressed={isSelected}
                                                className={`group cursor-pointer overflow-hidden rounded-xl border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                                                    isSelected
                                                        ? 'border-green-700 ring-2 ring-green-700/15'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex min-h-28 items-start justify-between gap-3 bg-green-800 p-5 text-white">
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-100">
                                                            {ticket.ticketType}
                                                        </p>

                                                        <h3 className="mt-2 line-clamp-2 text-lg font-extrabold">
                                                            {ticket.eventName}
                                                        </h3>
                                                    </div>

                                                    <span className="shrink-0 rounded-full bg-white/15 p-2">
                                                        <Ticket className="h-5 w-5" />
                                                    </span>
                                                </div>

                                                <div className="space-y-3 p-5">
                                                    <p className="flex items-start gap-2 text-sm text-gray-600">
                                                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />

                                                        <span>
                                                            
                                                        </span>
                                                    </p>

                                                    <p className="flex items-start gap-2 text-sm text-gray-600">
                                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />

                                                        <span className="line-clamp-2">
                                                            {ticket.venue}
                                                        </span>
                                                    </p>

                                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                                                ticket.status ===
                                                                'valid'
                                                                    ? 'text-green-700'
                                                                    : 'text-gray-500'
                                                            }`}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />

                                                            {ticket.status ===
                                                            'valid'
                                                                ? 'Valid ticket'
                                                                : 'Scanned'}
                                                        </span>

                                                        <span className="inline-flex items-center text-xs font-bold text-green-800">
                                                            View ticket

                                                            <ChevronRight className="ml-1 h-4 w-4" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </section>

            {/* Print only the selected ticket */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }

                    .ticket-print-area,
                    .ticket-print-area * {
                        visibility: visible !important;
                    }

                    .ticket-print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                    }

                    .ticket-print-area button {
                        display: none !important;
                    }
                }
            `}</style>
        </section>
    )
}
