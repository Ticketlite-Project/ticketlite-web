import type { AuthTokens, User } from '@/src/types/auth'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { apiClient } from '../api/axios'
import { clearAccessToken, setAccessToken } from '../lib/validation/auth-token'
import { AuthContext } from './AuthContext'

const getInitialUser = async (): Promise<User | null> => {
    try {
        const { data } = await apiClient.post('/api/auth/refresh')

        setAccessToken(data.access)

        return data.user
    } catch (error: unknown) {
        clearAccessToken()

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                // No valid refresh session exists.
                return null
            }

            console.error(
                'Unable to restore authentication session:',
                error.message
            )
        } else {
            console.error('Unexpected session restoration error:', error)
        }

        return null
    }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<User | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)

    const queryClient = useQueryClient()

    // Restore the authenticated session on application startup.
    useEffect(() => {
        let isMounted = true

        const initializeAuth = async () => {
            try {
                const initialUser = await getInitialUser()

                if (isMounted) {
                    setUser(initialUser)
                }
            } catch (error: unknown) {
                clearAccessToken()

                if (isMounted) {
                    setUser(null)
                }
                toast.error(`Authentication initialization failed:, ${error}`)
            } finally {
                if (isMounted) {
                    setIsInitializing(false)
                }
            }
        }

        void initializeAuth()

        return () => {
            isMounted = false
        }
    }, [])

    // Preserve the existing login signature.
    const login = useCallback(
        (tokens: AuthTokens, userData: User) => {
            queryClient.clear()

            setAccessToken(tokens.access)
            setUser(userData)
        },
        [queryClient]
    )

    const logout = useCallback(() => {
        // Clear local authentication immediately.
        clearAccessToken()
        setUser(null)

        // Remove cached data belonging to the previous user.
        queryClient.clear()

        // Invalidate the refresh session on the backend.
        void apiClient.post('/api/auth/logout').catch((error: unknown) => {
            if (axios.isAxiosError(error)) {
                toast.error(
                    'Server logout failed:',
                    error.response?.data ?? error.message
                )
            } else {
                console.error('Server logout failed:', error)
            }
        })
    }, [queryClient])

    const contextValue = useMemo(
        () => ({
            user,
            isAuthenticated: !!user,
            isInitializing,
            login,
            logout,
        }),
        [user, isInitializing, login, logout]
    )

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}
