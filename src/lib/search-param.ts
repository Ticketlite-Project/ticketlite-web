import type { EventSearchParams } from '../components/EventSearchBar/event-search-bar'

export function parseSearchParams(params: URLSearchParams): EventSearchParams {
    const dateStr = params.get('date')
    // Validate date — never trust the URL
    const date =
        dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
            ? new Date(`${dateStr}T00:00:00`)
            : null

    return {
        search: params.get('q')?.trim() ?? '',
        city: params.get('city') || null,
        date: date && !Number.isNaN(date.getTime()) ? date : null,
    }
}

export function toSearchParams(p: EventSearchParams): URLSearchParams {
    const next = new URLSearchParams()
    if (p.search) next.set('q', p.search)
    if (p.city) next.set('city', p.city)
    if (p.date) next.set('date', p.date.toISOString().split('T')[0])
    return next
}
