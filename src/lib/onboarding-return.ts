type OnboardingLocation = {
    pathname?: string
    search?: string
    hash?: string
}

const PROTECTED_PATH_PREFIXES = ['/my-tickets', '/organisers']

export function isProtectedOnboardingReturn(pathname?: string): boolean {
    return (
        !!pathname &&
        PROTECTED_PATH_PREFIXES.some(
            (prefix) =>
                pathname === prefix || pathname.startsWith(`${prefix}/`)
        )
    )
}

export function getOnboardingCloseDestination(
    from?: OnboardingLocation
): string {
    if (!from?.pathname) return '/'

    if (isProtectedOnboardingReturn(from.pathname)) return '/'

    return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
}
