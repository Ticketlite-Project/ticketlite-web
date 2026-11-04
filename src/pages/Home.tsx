import { mockEvents } from '@/lib/mock-data'
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

export default function Home() {
    const [activeCategory, setActiveCategory] = useState('all')
    const [sortBy, setSortBy] = useState<SortOption>('soonest')
    const [searchParams, setSearchParams] = useSearchParams()

    // URL: typed params (validated)
    const query = useMemo(() => parseSearchParams(searchParams), [searchParams])

    // WRITE: search bar only updates the URL
    const handleSearch = (params: EventSearchParams) => {
        setSearchParams(toSearchParams(params))
    }

    const isLoading = false
    const isError = false
    const isFetching = false
    const error: unknown = null
    const events = mockEvents
    const totalCount = events.length
    // const { data, isLoading, isError, error, isFetching } = useEvents(query)
    //useMemo(() => data?.events ?? [], [data])
    // const totalCount = data?.total ?? events.length

    const sortedEvents = useMemo(() => {
        const filtered = events.filter(
            (e) => activeCategory === 'all' || e.type === activeCategory
        )

        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'soonest':
                    return (
                        new Date(a.startDate).getTime() -
                        new Date(b.startDate).getTime()
                    )
                case 'latest':
                    return (
                        new Date(b.startDate).getTime() -
                        new Date(a.startDate).getTime()
                    )
                case 'price-low':
                    return (a.priceFrom ?? 0) - (b.priceFrom ?? 0)
                case 'price-high':
                    return (b.priceFrom ?? 0) - (a.priceFrom ?? 0)
                default:
                    return 0
            }
        })
    }, [events, activeCategory, sortBy])

    return (
        <section className="min-h-screen bg-background">
            {/* HERO */}
            <div className="bg-headerBackground text-white pt-6 pb-3 md:px-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xs font-bold tracking-widest text-[#D3EFA3] mb-6 uppercase">
                        Concerts · Church Programmes · Campus Nights · Meetups
                    </p>
                    <h1 className="text-9xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-3xl">
                        Find your next event. Pay with mobile money.{' '}
                        <span className="text-[#9BE700]">
                            Walk in with one scan.
                        </span>
                    </h1>
                    <p className="text-green-50 text-lg max-w-2xl mb-10">
                        Every ticket gets its own QR code, so there are no paper
                        tickets to lose and no duplicates at the gate.
                    </p>

                    <EventSearchBar
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

            {/* CATEGORY FILTERS — unchanged */}
            <div className="border-b border-gray-200 bg-categround sticky top-0 z-10">
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
                                            : 'text-gray-500 hover:text-gray-900'
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
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        No events match your search.{' '}
                        <button
                            type="button"
                            className="ml-2 underline text-green-700"
                            onClick={() =>
                                setSearchParams(new URLSearchParams())
                            }
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* subtle background-refetch indicator (optional) */}
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
