const ACCESS_TOKEN_KEY = 'ticketlite.accessToken'
const REFRESH_TOKEN_KEY = 'ticketlite.refreshToken'

const readStoredToken = (key: string): string | null => {
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

const writeStoredToken = (key: string, token: string | null): void => {
    try {
        if (token) {
            localStorage.setItem(key, token)
        } else {
            localStorage.removeItem(key)
        }
    } catch {
        // Authentication state can still work in memory when storage is unavailable.
    }
}

let accessToken: string | null = readStoredToken(ACCESS_TOKEN_KEY)
let refreshToken: string | null = readStoredToken(REFRESH_TOKEN_KEY)

export const setAccessToken = (token: string | null): void => {
    accessToken = token
    writeStoredToken(ACCESS_TOKEN_KEY, token)
}

export const getAccessToken = (): string | null => {
    return accessToken
}

export const clearAccessToken = (): void => {
    accessToken = null
    writeStoredToken(ACCESS_TOKEN_KEY, null)
}

export const setRefreshToken = (token: string | null): void => {
    refreshToken = token
    writeStoredToken(REFRESH_TOKEN_KEY, token)
}

export const getRefreshToken = (): string | null => refreshToken
