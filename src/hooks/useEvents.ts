import { useQuery } from '@tanstack/react-query'
import type { EventsResponse } from '../api/events'
import type { EventSearchParams } from '../components/EventSearchBar/event-search-bar'
import { fetchEvents } from '../lib/use-event'

// Stable, serializable query key — this is what TanStack uses for caching
export const eventsQueryKey = (params: EventSearchParams) =>
    [
        'events',
        {
            q: params.search,
            city: params.city,
            date: params.date ? params.date.toISOString().split('T')[0] : null,
        },
    ] as const

export function useEvents(params: EventSearchParams) {
    return useQuery<EventsResponse>({
        queryKey: eventsQueryKey(params),
        queryFn: ({ signal }) => fetchEvents(params, signal),
        staleTime: 60_000,
        placeholderData: (prev) => prev,
    })
}
