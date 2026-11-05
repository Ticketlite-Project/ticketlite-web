import { registerUser } from '@/src/api/auth'
import type { RegisterData } from '@/src/types/auth'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export function useSignUp() {
    const navigate = useNavigate()

    return useMutation({
        mutationFn: (data: RegisterData) => registerUser(data),
        onSuccess: (response) => {
            toast.success(response.message ?? 'Account created successfully')
            navigate('/login', { replace: true })
        },
        onError: (error: Error) => {
            toast.error('Sign up failed', {
                description: error.message ?? 'Please try again.',
            })
        },
    })
}
