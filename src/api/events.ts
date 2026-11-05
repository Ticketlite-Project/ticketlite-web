import type { EventData } from '@/src/types/event-ticket.types'

export type Event = EventData

export interface EventsResponse {
    events: Event[]
    total: number
}
