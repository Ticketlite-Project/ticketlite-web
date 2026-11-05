import { fetchUserProfile, loginUser } from '@/src/api/auth'
import { useAuth } from '@/src/hooks/useAuth'
import { type LoginCredentials } from '@/src/types/auth'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function useLogin(returnTo = '/') {
    const { login } = useAuth()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            // 1. Get tokens
            const tokens = await loginUser(credentials)

            // 2. Fetch user data using the new token
            const userData = await fetchUserProfile(tokens.access)

            return { tokens, userData }
        },
        onSuccess: ({ tokens, userData }) => {
            // 3. Update global state and redirect
            login(tokens, userData)
            toast.success('Login successful')
            navigate(returnTo, { replace: true })
        },
        onError: (error: Error) => {
            toast.error('Login failed', {
                description:
                    error.message ??
                    'Please check your connection and try again.',
            })
        },
    })
}
