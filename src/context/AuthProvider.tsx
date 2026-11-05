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
import { apiClient, setAuthExpiredHandler } from '../api/axios'
import {
    clearAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
} from '../lib/validation/auth-token'
import { AuthContext } from './AuthContext'

const getInitialUser = async (): Promise<User | null> => {
    const refresh = getRefreshToken()
    if (!refresh) {
        return null
    }
    try {
        const { data } = await apiClient.post('/auth/token/refresh/', { refresh })
        setAccessToken(data.access)
        const profile = await apiClient.get<User>('/auth/me/')
        return profile.data
    } catch (error: unknown) {
        clearAccessToken()
        setRefreshToken(null)
        if (axios.isAxiosError(error) && error.response?.status !== 401) {
            console.error('Unable to restore authentication session:', error.message)
        } else if (!axios.isAxiosError(error)) {
            console.error('Unexpected session restoration error:', error)
        }
        return null
    }
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [user, setUser] = useState<User | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)
    const queryClient = useQueryClient()

    useEffect(() => {
        let isMounted = true
        void getInitialUser().then((initialUser) => {
            if (isMounted) {
                setUser(initialUser)
                setIsInitializing(false)
            }
        })
        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        setAuthExpiredHandler(() => {
            clearAccessToken()
            setRefreshToken(null)
            setUser(null)
            queryClient.clear()
        })
        return () => setAuthExpiredHandler(() => undefined)
    }, [queryClient])

    const login = useCallback(
        (tokens: AuthTokens, userData: User) => {
            queryClient.clear()
            setAccessToken(tokens.access)
            setRefreshToken(tokens.refresh)
            setUser(userData)
        },
        [queryClient]
    )

    const logout = useCallback(() => {
        clearAccessToken()
        setRefreshToken(null)
        setUser(null)
        queryClient.clear()
        void apiClient.post('/auth/logout/', undefined).catch((error: unknown) => {
            toast.error('Server logout failed', {
                description: axios.isAxiosError(error)
                    ? String(error.response?.data ?? error.message)
                    : 'Please try again.',
            })
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
