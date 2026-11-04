import { mockEvents } from '@/lib/mock-data'
import TicketSelector from '@/src/components/TicketSelector/ticket-selector'
import { ArrowRight, Calendar, Image as ImageIcon, MapPin } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export default function EventDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Derive the event synchronously - no state or effect needed for static mock data
    const event = mockEvents.find((event) => event.id === id) ?? null

    // Handle 404 navigation in an effect (external system sync)
    useEffect(() => {
        if (!event) {
            navigate('/404')
        }
    }, [event, navigate])

    if (!event) return null

    return (
        <div className="min-h-screen bg-background pb-20 gap-5">
            {/* Header Section */}
            <header className="bg-headerBackground text-white pt-8 pb-12 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-xs font-medium text-green-100 mb-4 flex gap-2">
                        <Link to="/events" className="hover:underline">
                            Events
                        </Link>
                        <span>›</span>
                        <span>{event.category}</span>
                        <span>›</span>
                        <span className="text-white">{event.title}</span>
                    </div>

                    {event.isSellingFast && (
                        <span className="inline-block bg-[#b3e6a1] text-[#1a5c38] text-xs font-bold px-3 py-1 rounded-full mb-4">
                            SELLING FAST
                        </span>
                    )}

                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                        {event.title}
                    </h1>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm md:text-base">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 text-green-50">
                            <p className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {event.date} · {event.time}
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                {event.location}
                            </p>
                        </div>
                        <p className="text-green-100">
                            Organised by{' '}
                            <span className="font-bold text-white">
                                {event.organizer}
                            </span>
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content Layout */}
            <section className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Main Event Info) */}
                    <div className="lg:col-span-2 gap-4 space-y-6">
                        {/* Banner Image Placeholder */}
                        <div className="w-full aspect-2/1 bg-image-placeholder rounded-2xl flex flex-col items-center justify-center text-[#2b7a56] border-6 border-image-placeholder-border">
                            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                            <span className="text-sm font-medium">
                                Event banner image (uploaded by organiser)
                            </span>
                        </div>

                        {/* Description */}
                        <div className="bg-background p-8 border-gray-100">
                            <h2 className="text-2xl font-bold text-primary mb-4">
                                About this event
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                {event.description}
                            </p>
                        </div>

                        {/* Event Details Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1 border rounded-lg mb-5">
                            <div className="p-4">
                                <p className="text-xs text-gray-500 font-medium mb-1">
                                    Doors open
                                </p>
                                <p className="font-bold ">{event.doorsOpen}</p>
                            </div>
                            <div className="p-4 border-r border-l">
                                <p className="text-xs text-gray-500 font-medium mb-1">
                                    Category
                                </p>
                                <p className="font-bold ">{event.category}</p>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-gray-500 font-medium mb-1">
                                    Entry
                                </p>
                                <p className="font-bold">{event.entryType}</p>
                            </div>
                        </div>

                        {/* How Entry Works Section */}
                        <section className="bg-ticket-warning-bg p-6 rounded-2xl">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1">
                                    <h3 className="font-bold mb-2 flex items-center gap-2">
                                        <ArrowRight className="w-5 h-5 text-green-700" />
                                        How entry works
                                    </h3>
                                    <p className="text-sm text-primary leading-relaxed">
                                        When you continue, we hold your tickets
                                        for 10 minutes while you pay with mobile
                                        money. Once payment is approved, each
                                        ticket gets its own QR code in My
                                        tickets and by email. Show it at the
                                        gate; each code can only be scanned
                                        once.
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

                        {/* Venue Section */}
                        <section className="pt-4">
                            <h2 className="text-2xl font-bold text-primary mb-4">
                                Venue
                            </h2>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full h-50 md:w-2/3 aspect-video md:aspect-square bg-image-placeholder/80 rounded-xl flex items-center justify-center text-[#2b7a56]">
                                    <span className="text-xs font-medium">
                                        [Map placeholder]
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-primary mb-1">
                                        {event.venueName}
                                    </h3>
                                    {event.address.map((line, idx) => (
                                        <p
                                            key={idx}
                                            className="text-gray-600 text-sm"
                                        >
                                            {line}
                                        </p>
                                    ))}
                                    <Link
                                        to="#"
                                        className="inline-block mt-3 text-sm font-bold text-[#1a6e44] hover:underline"
                                    >
                                        Get directions
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Ticket Selection) */}
                    <div className="lg:col-span-1">
                        <TicketSelector
                            ticketTypes={event.ticketTypes}
                            maxTicketsPerOrder={event.maxTicketsPerOrder}
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}
