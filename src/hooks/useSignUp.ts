import { fetchUserProfile, loginUser, registerUser } from '@/src/api/auth'
import type { RegisterData } from '@/src/types/auth'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from './useAuth'

export function useSignUp() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    const signUpState = location.state as
        | { from?: { pathname?: string; search?: string; hash?: string } }
        | null
        | undefined

    return useMutation({
        mutationFn: async (data: RegisterData) => {
            const registration = await registerUser(data)
            const tokens = await loginUser({
                username: data.username,
                password: data.password,
            })
            const user = await fetchUserProfile(tokens.access)
            return { registration, tokens, user }
        },
        onSuccess: ({ registration, tokens, user }) => {
            login(tokens, user)
            toast.success(registration.message ?? 'Account created successfully')
            const destination = signUpState?.from
                ? `${signUpState.from.pathname}${signUpState.from.search ?? ''}${signUpState.from.hash ?? ''}`
                : '/'
            navigate(destination, { replace: true })
        },
        onError: (error: Error) => {
            toast.error('Sign up failed', {
                description: error.message ?? 'Please try again.',
            })
        },
    })
}
