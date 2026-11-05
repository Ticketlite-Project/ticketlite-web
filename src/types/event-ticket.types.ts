export type TicketType = {
    id: string
    name: string
    description?: string
    price: number
    currency: string
    available: number
    maxPerOrder?: number
    lowStockThreshold?: number
}

export type EventData = {
    id: string
    title: string
    category: string // e.g., "Music", "Tech & Meetups"
    type: string // For the top filter icons, e.g., "music", "tech"
    date: string // Display date
    startDate: Date // For sorting
    time: string
    location: string
    venueName: string
    address: string[]
    organizer: string
    bannerUrl?: string
    description: string
    doorsOpen: string
    entryType: string
    isSellingFast?: boolean
    isFewLeft?: boolean
    isSoldOut?: boolean
    other?: boolean
    priceFrom: number
    maxTicketsPerOrder: number
    ticketTypes: TicketType[]
}
