export type LoginCredentials = {
    username: string
    password: string
}

export type AuthTokens = {
    access: string
    refresh: string
}

export type User = {
    id?: number
    first_name: string
    last_name: string
    username: string
    email: string
}

export type RegisterData = {
    first_name: string
    last_name: string
    username: string
    email: string
    password: string
    role: 'attendee' | 'organizer'
}

export type AuthResponse = {
    message?: string
    access?: string
    refresh?: string
    user?: User
}

export type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    isInitializing: boolean
    login: (tokens: AuthTokens, userData: User) => void
    logout: () => void
}
