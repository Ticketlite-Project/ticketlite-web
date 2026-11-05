import { registerUser } from '@/src/api/auth'
import type { RegisterData } from '@/src/types/auth'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function useSignUp() {
    const navigate = useNavigate()
    const location = useLocation()
    const signUpState = location.state as
        | { from?: { pathname?: string; search?: string; hash?: string } }
        | null
        | undefined

    return useMutation({
        mutationFn: (data: RegisterData) => registerUser(data),
        onSuccess: (response) => {
            toast.success(response.message ?? 'Account created successfully')
            navigate('/login', {
                replace: true,
                state: signUpState?.from ? { from: signUpState.from } : undefined,
            })
        },
        onError: (error: Error) => {
            toast.error('Sign up failed', {
                description: error.message ?? 'Please try again.',
            })
        },
    })
}
