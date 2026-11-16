import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { mockEvents } from '../../mock/mock-data'
import type { EventData } from '../../types/event-ticket.types'

const defaultDescription =
    'Discover events across Ghana and book secure QR-code tickets. Pay with mobile money and enter with one scan.'

type RouteMetadata = {
    title: string
    description: string
    indexable?: boolean
}

type ResolvedMetadata = RouteMetadata & {
    canonicalPath: string
    event?: EventData
}

const publicRoutes: Record<string, RouteMetadata> = {
    '/': {
        title: 'Discover Events in Ghana | TicketLite',
        description: defaultDescription,
    },
    '/events': {
        title: 'Discover Events in Ghana | TicketLite',
        description: defaultDescription,
    },
}

const privateRoutePrefixes = [
    '/admin',
    '/checkout',
    '/login',
    '/logout',
    '/my-tickets',
    '/organisers',
    '/payment',
    '/signup',
]

function setMeta(
    selector: string,
    attributes: Record<string, string>,
    content: string
) {
    let element = document.head.querySelector<HTMLMetaElement>(selector)
    if (!element) {
        element = document.createElement('meta')
        document.head.append(element)
    }

    for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value)
    }
    element.content = content
}

function getCanonicalUrl(pathname: string) {
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim()
    const siteUrl = configuredSiteUrl
        ? new URL(configuredSiteUrl).origin
        : window.location.origin

    return new URL(pathname, `${siteUrl}/`).toString()
}

function formatGhanaStartDate(date: Date) {
    const pad = (value: number) => String(value).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00+00:00`
}

function getEventDescription(event: EventData) {
    const description = event.description.trim()
    return description.startsWith('[') && description.endsWith(']')
        ? `${event.organizer} presents ${event.title}.`
        : description
}

function getMetadata(pathname: string): ResolvedMetadata {
    const normalizedPath = pathname.replace(/\/+$/, '') || '/'
    const routeMetadata = publicRoutes[normalizedPath]
    if (routeMetadata) {
        return {
            ...routeMetadata,
            canonicalPath: normalizedPath === '/events' ? '/' : normalizedPath,
        }
    }

    const eventMatch = normalizedPath.match(/^\/events\/([^/]+)$/)
    if (eventMatch) {
        const event = mockEvents.find((item) => item.id === eventMatch[1])
        if (event) {
            return {
                title: `${event.title} | TicketLite`,
                description: `${getEventDescription(event)} ${event.date} at ${event.location}. Book QR-code tickets with TicketLite.`,
                canonicalPath: normalizedPath,
                event,
            }
        }
    }

    if (
        privateRoutePrefixes.some(
            (prefix) =>
                normalizedPath === prefix ||
                normalizedPath.startsWith(`${prefix}/`)
        )
    ) {
        return {
            title: 'Your TicketLite Account',
            description: 'Manage your TicketLite account and tickets.',
            canonicalPath: normalizedPath,
            indexable: false,
        }
    }

    return {
        title: 'Page Not Found | TicketLite',
        description: 'The page you are looking for could not be found.',
        canonicalPath: normalizedPath,
        indexable: false,
    }
}

function getEventStructuredData(event: EventData, url: string) {
    const offers = event.ticketTypes
    const availableOffers = offers.filter((offer) => offer.available > 0)
    const startDate = Number.isNaN(event.startDate.getTime())
        ? undefined
        : formatGhanaStartDate(event.startDate)

    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        description: getEventDescription(event),
        ...(startDate && { startDate }),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
            '@type': 'Place',
            name: event.venueName,
            address: {
                '@type': 'PostalAddress',
                streetAddress: event.address.join(', '),
                addressCountry: 'GH',
            },
        },
        organizer: {
            '@type': 'Organization',
            name: event.organizer,
        },
        ...(offers.length > 0 && {
            offers: {
                '@type': 'AggregateOffer',
                url,
                priceCurrency: offers[0].currency,
                lowPrice: Math.min(...offers.map((offer) => offer.price)),
                highPrice: Math.max(...offers.map((offer) => offer.price)),
                offerCount: offers.length,
                availability:
                    availableOffers.length > 0 && !event.isSoldOut
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/SoldOut',
            },
        }),
    }
}

export function RouteSeo() {
    const { pathname } = useLocation()

    useEffect(() => {
        const metadata = getMetadata(pathname)
        const canonicalUrl = getCanonicalUrl(metadata.canonicalPath)
        const description = metadata.description.trim()
        const descriptionSnippet =
            description.length > 160
                ? `${description
                      .slice(0, 157)
                      .trimEnd()
                      .replace(/\s+\S*$/, '')}...`
                : description

        document.title = metadata.title
        setMeta(
            'meta[name="description"]',
            { name: 'description' },
            descriptionSnippet
        )
        setMeta(
            'meta[name="robots"]',
            { name: 'robots' },
            metadata.indexable === false ? 'noindex, follow' : 'index, follow'
        )
        setMeta('meta[property="og:type"]', { property: 'og:type' }, 'website')
        setMeta(
            'meta[property="og:site_name"]',
            { property: 'og:site_name' },
            'TicketLite'
        )
        setMeta('meta[property="og:url"]', { property: 'og:url' }, canonicalUrl)
        setMeta(
            'meta[property="og:title"]',
            { property: 'og:title' },
            metadata.title
        )
        setMeta(
            'meta[property="og:description"]',
            { property: 'og:description' },
            descriptionSnippet
        )
        setMeta(
            'meta[name="twitter:card"]',
            { name: 'twitter:card' },
            'summary'
        )
        setMeta(
            'meta[name="twitter:title"]',
            { name: 'twitter:title' },
            metadata.title
        )
        setMeta(
            'meta[name="twitter:description"]',
            { name: 'twitter:description' },
            descriptionSnippet
        )

        let canonicalLink = document.head.querySelector<HTMLLinkElement>(
            'link[rel="canonical"]'
        )
        if (!canonicalLink) {
            canonicalLink = document.createElement('link')
            canonicalLink.rel = 'canonical'
            document.head.append(canonicalLink)
        }
        canonicalLink.href = canonicalUrl

        let structuredData = document.head.querySelector<HTMLScriptElement>(
            'script[data-ticketlite-seo]'
        )
        const structuredDataContent = metadata.event
            ? getEventStructuredData(metadata.event, canonicalUrl)
            : metadata.canonicalPath === '/'
              ? {
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: 'TicketLite',
                    url: canonicalUrl,
                    inLanguage: 'en-GH',
                    publisher: {
                        '@type': 'Organization',
                        name: 'TicketLite',
                    },
                }
              : undefined

        if (structuredDataContent) {
            if (!structuredData) {
                structuredData = document.createElement('script')
                structuredData.type = 'application/ld+json'
                structuredData.dataset.ticketliteSeo = 'true'
                document.head.append(structuredData)
            }
            structuredData.textContent = JSON.stringify(structuredDataContent)
        } else {
            structuredData?.remove()
        }
    }, [pathname])

    return null
}
