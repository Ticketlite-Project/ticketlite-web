import { createContext, useContext } from 'react'
import type { AuthTokens, User } from '@/src/types/auth'

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    isInitializing: boolean
    login: (tokens: AuthTokens, userData: User) => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}