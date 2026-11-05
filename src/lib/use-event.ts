import { apiClient } from '../api/axios'
import type { EventsResponse } from '../api/events'
import type { EventSearchParams } from '../components/EventSearchBar/event-search-bar'

// Serialize only the params that are actually set
function buildQuery(params: EventSearchParams): Record<string, string> {
    const q: Record<string, string> = {}
    if (params.search) q.q = params.search
    if (params.city) q.city = params.city
    if (params.date) q.date = params.date.toISOString().split('T')[0]
    return q
}

export async function fetchEvents(
    params: EventSearchParams,
    signal?: AbortSignal
): Promise<EventsResponse> {
    const { data } = await apiClient.get<EventsResponse>('/events', {
        params: buildQuery(params),
        signal,
    })
    return data
}
