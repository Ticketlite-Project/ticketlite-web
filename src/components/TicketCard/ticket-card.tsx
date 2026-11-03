import { type EventData } from '@/src/types/event-ticket.types'

type TicketCardProps = {
    event: EventData
    className?: string
}

export default function TicketCard({
    event,
    className,
}: Readonly<TicketCardProps>) {
    const dateObj = new Date(event.startDate)
    const month = dateObj
        .toLocaleString('en-US', { month: 'short' })
        .toUpperCase()
    const day = dateObj.getDate().toString().padStart(2, '0')

    const urgency = event.isSoldOut
        ? { label: 'SOLD OUT', tone: 'muted' as const }
        : event.isSellingFast
          ? { label: 'SELLING FAST', tone: 'warning' as const }
          : event.isFewLeft
            ? { label: 'FEW LEFT', tone: 'warning' as const }
            : event.other
              ? {
                    label: 'OTHER',
                    tone: 'alert' as const,
                }
              : null

    return (
        <div
            className={`relative w-full aspect-4/3 rounded overflow-hidden
                bg-(--ticket-card-bg) text-(--ticket-card-fg)
                ${className ?? ''}`}
        >
            {/* Placeholder icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <svg
                    aria-hidden="true"
                    className="w-16 h-16 opacity-20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-4.42 4.8L12 14.5l-3.58 2.3 1.08-4.12-3.29-2.69 4.24-.25L12 5.8l1.54 3.95 4.24.25-3.29 2.69 1.09 4.11z" />
                </svg>
            </div>

            {/* Top row: category (left) · urgency (right) */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                <span
                    className="inline-flex items-center max-w-[60%] truncate
                        rounded-full bg-(--ticket-badge-bg) text-(--ticket-badge-fg)
                        px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
                        backdrop-blur-sm"
                >
                    {event.category}
                </span>

                {urgency && (
                    <span
                        className={`inline-flex items-center whitespace-nowrap
                            rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide
                            ${
                                urgency.tone === 'alert'
                                    ? 'bg-(--ticket-alert-bg) text-(--ticket-alert-fg)'
                                    : urgency.tone === 'warning'
                                      ? 'bg-(--ticket-warning-bg) text-(--ticket-warning-fg)'
                                      : 'bg-(--ticket-muted-bg) text-(--ticket-muted-fg)'
                            }`}
                    >
                        {urgency.label}
                    </span>
                )}
            </div>

            {/* Bottom-left: date chip */}
            <div
                className="absolute bottom-3 left-3 flex flex-col items-center
                    rounded-lg bg-(--ticket-date-bg) text-(--ticket-date-fg)
                    px-2.5 py-1 shadow-sm"
            >
                <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">
                    {month}
                </span>
                <span className="text-lg font-extrabold leading-none">
                    {day}
                </span>
            </div>
        </div>
    )
}
