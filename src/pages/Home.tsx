import { mockEvents } from '@/lib/mock-data'
import EventCard from '@/src/components/EventCard/event-card'
import { ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'

// Category definitions for the icons row
const CATEGORIES = [
    { id: 'all', label: 'All events', icon: '🏛️' }, // Using emojis as fallback if you don't have specific icons
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'church', label: 'Church', icon: '⛪' },
    { id: 'campus', label: 'Campus', icon: '🎓' },
    { id: 'tech', label: 'Tech & meetups', icon: '💻' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'arts', label: 'Arts & culture', icon: '🎭' },
]

export default function Home() {
    const [activeCategory, setActiveCategory] = useState('all')

    // Filter events based on selected category
    const filteredEvents = mockEvents.filter(
        (event) => activeCategory === 'all' || event.type === activeCategory
    )

    // Sort events by start date (soonest first)
    const sortedEvents = [...filteredEvents].sort(
        (a, b) => a.startDate.getTime() - b.startDate.getTime()
    )

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* --- HERO SECTION --- */}
            <section className="bg-[#2b7a56] text-white pt-12 pb-16 px-4 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xs font-bold tracking-widest text-green-100 mb-6 uppercase">
                        Concerts · Church Programmes · Campus Nights · Meetups
                    </p>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-3xl">
                        Find your next event. Pay with mobile money.{' '}
                        <span className="text-[#b3e6a1]">
                            Walk in with one scan.
                        </span>
                    </h1>

                    <p className="text-green-50 text-lg max-w-2xl mb-10">
                        Every ticket gets its own QR code, so there are no paper
                        tickets to lose and no duplicates at the gate.
                    </p>

                    {/* Search Bar */}
                    <div className="bg-white rounded-xl p-2 flex flex-col md:flex-row gap-2 max-w-4xl shadow-lg mb-6">
                        <div className="flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200">
                            <label
                                htmlFor="search"
                                className="text-xs font-bold text-gray-500 block mb-1"
                            >
                                Search events
                            </label>
                            <input
                                type="text"
                                id="search"
                                placeholder="Event name, artist or organiser"
                                className="w-full text-gray-900 outline-none placeholder:text-gray-400 text-sm"
                            />
                        </div>
                        <div className="flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200 flex justify-between items-center cursor-pointer">
                            <div>
                                <label
                                    htmlFor="city"
                                    className="text-xs font-bold text-gray-500 block mb-1"
                                >
                                    City
                                </label>
                                <span className="text-sm text-gray-900">
                                    Anywhere in Ghana
                                </span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1 px-4 py-2 flex justify-between items-center cursor-pointer">
                            <div>
                                <label
                                    htmlFor="date"
                                    className="text-xs font-bold text-gray-500 block mb-1"
                                >
                                    Date
                                </label>
                                <span className="text-sm text-gray-900">
                                    Any date
                                </span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                        <button className="bg-white text-gray-700 font-bold px-6 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-2 md:w-auto w-full justify-center">
                            <Search className="w-5 h-5 text-[#2b7a56]" />
                            SEARCH
                        </button>
                    </div>

                    {/* Feature Badges */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-green-100">
                        <span className="flex items-center gap-1.5">
                            ✓ MOBILE MONEY CHECKOUT
                        </span>
                        <span className="flex items-center gap-1.5">
                            ✓ QR TICKET BY EMAIL
                        </span>
                        <span className="flex items-center gap-1.5">
                            ✓ ONE SCAN PER TICKET AT THE GATE
                        </span>
                    </div>
                </div>
            </section>

            {/* --- CATEGORY FILTERS --- */}
            <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 md:px-8">
                    <div className="flex overflow-x-auto hide-scrollbar gap-8 py-4">
                        {CATEGORIES.map((cat) => {
                            const isActive = activeCategory === cat.id
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex flex-col items-center gap-2 min-w-20 transition-colors ${
                                        isActive
                                            ? 'text-[#1a6e44]'
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                            isActive
                                                ? 'bg-[#1a6e44] text-white'
                                                : 'bg-gray-100'
                                        }`}
                                    >
                                        {cat.icon}
                                    </div>
                                    <span
                                        className={`text-xs font-bold ${isActive ? 'border-b-2 border-[#1a6e44] pb-1' : ''}`}
                                    >
                                        {cat.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* --- EVENT LISTING --- */}
            <main className="max-w-6xl mx-auto px-4 md:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Upcoming Events
                        </p>
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            Happening soon near you
                        </h2>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">
                            Showing{' '}
                            <span className="font-bold text-gray-900">
                                1–{sortedEvents.length}
                            </span>{' '}
                            of {sortedEvents.length}
                        </span>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-50">
                            <span className="text-gray-600">Sort</span>
                            <span className="font-bold text-gray-900">
                                Soonest first
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {sortedEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {sortedEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        No events found for this category.
                    </div>
                )}

                {/* Pagination Placeholder */}
                {sortedEvents.length > 0 && (
                    <div className="flex justify-center items-center gap-2 mt-16">
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
                            &lt;
                        </button>
                        <button className="w-8 h-8 rounded-full bg-[#1a6e44] text-white font-bold flex items-center justify-center">
                            1
                        </button>
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                            2
                        </button>
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                            3
                        </button>
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                            &gt;
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
