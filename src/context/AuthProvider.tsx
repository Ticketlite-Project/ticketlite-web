import type { AuthTokens, User } from '@/src/types/auth'
import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'

const getInitialUser = (): User | null => {
    const storedUser = localStorage.getItem('ticketlite_user')
    const token = localStorage.getItem('ticketlite_access_token')

    if (storedUser && token) {
        try {
            return JSON.parse(storedUser)
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error)
            // If JSON is corrupted, clear it and return null
            localStorage.removeItem('ticketlite_user')
            return null
        }
    }
    return null
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<User | null>(getInitialUser)

    // useCallback ensures this function reference doesn't change on re-renders
    const login = useCallback((tokens: AuthTokens, userData: User) => {
        localStorage.setItem('ticketlite_access_token', tokens.access)
        localStorage.setItem('ticketlite_refresh_token', tokens.refresh)
        localStorage.setItem('ticketlite_user', JSON.stringify(userData))
        setUser(userData)
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('ticketlite_access_token')
        localStorage.removeItem('ticketlite_refresh_token')
        localStorage.removeItem('ticketlite_user')
        setUser(null)
    }, [])

    const contextValue = useMemo(
        () => ({
            user,
            isAuthenticated: !!user,
            login,
            logout,
        }),
        [user, login, logout]
    )

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}
