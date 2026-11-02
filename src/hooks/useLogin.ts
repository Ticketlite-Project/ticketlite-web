import { fetchUserProfile, loginUser } from '@/src/api/auth'
import { useAuth } from '@/src/hooks/useAuth'
import { type LoginCredentials } from '@/src/types/auth'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export function useLogin() {
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
            navigate('/') // Redirect to home or dashboard
        },
        onError: (error: Error) => {
            // Handle error (e.g., show a toast notification)
            console.error(error.message)
        },
    })
}
