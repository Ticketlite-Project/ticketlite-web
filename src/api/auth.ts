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
            '/auth/login/',
            new URLSearchParams({
                username: credentials.username,
                password: credentials.password,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
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
            '/auth/register/',
            new URLSearchParams({
                first_name: data.first_name,
                last_name: data.last_name,
                username: data.username,
                email: data.email,
                password: data.password,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        return response.data
    } catch (error) {
        if (isAxiosError(error)) {
            const responseData = error.response?.data as
                | {
                      message?: string
                      detail?: string
                      error?: string
                      [field: string]: string | string[] | undefined
                  }
                | undefined
            const fieldErrors = responseData
                ? Object.entries(responseData)
                      .filter(([key]) => !['message', 'detail', 'error'].includes(key))
                      .flatMap(([, value]) =>
                          Array.isArray(value) ? value : [value]
                      )
                      .filter((value): value is string => typeof value === 'string')
                : []
            const message =
                responseData?.message ??
                responseData?.detail ??
                responseData?.error ??
                fieldErrors.join(' ')

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
        const response = await apiClient.get<User>('/auth/me/', {
            headers: { Authorization: `Bearer ${token}` },
        })
        return response.data
    } catch (error) {
        throw new Error('Failed to fetch user profile.', { cause: error })
    }
}
