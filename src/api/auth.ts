import type { AuthTokens, LoginCredentials, User } from '@/src/types/auth'
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
