import type {
    AuthTokens,
    LoginCredentials,
    RegisterData,
    User,
    AuthResponse,
} from '@/src/types/auth'
import { isAxiosError } from 'axios'
import { apiClient } from './axios'

export async function loginUser(
    credentials: LoginCredentials
): Promise<AuthTokens> {
    try {
        const response = await apiClient.post<AuthTokens>(
            '/api/auth/login/',
            credentials
        )
        return response.data
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
            throw new Error('Invalid username or password', { cause: error })
        }
        throw new Error('Failed to login. Please try again.', { cause: error })
    }
}

export async function registerUser(
    data: RegisterData
): Promise<AuthResponse> {
    try {
        const response = await apiClient.post<AuthResponse>(
            '/api/auth/register/',
            data
        )
        return response.data
    } catch (error) {
        if (isAxiosError(error)) {
            const responseData = error.response?.data as
                | { message?: string; detail?: string; error?: string }
                | undefined
            const message =
                responseData?.message ??
                responseData?.detail ??
                responseData?.error

            if (message) {
                throw new Error(message, { cause: error })
            }
        }
        throw new Error('Unable to create your account. Please try again.', {
            cause: error,
        })
    }
}

export async function fetchUserProfile(token: string): Promise<User> {
    try {
        const response = await apiClient.get<User>('/api/auth/me/', {
            headers: { Authorization: `Bearer ${token}` },
        })
        return response.data
    } catch (error) {
        throw new Error('Failed to fetch user profile.', { cause: error })
    }
}
