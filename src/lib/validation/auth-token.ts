// Auth Token
let accessToken: string | null = null
let refreshToken: string | null = null

export const setAccessToken = (token: string | null): void => {
    accessToken = token
}

export const getAccessToken = (): string | null => {
    return accessToken
}

export const clearAccessToken = (): void => {
    accessToken = null
}

export const setRefreshToken = (token: string | null): void => {
    refreshToken = token
}

export const getRefreshToken = (): string | null => refreshToken
