import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from '@/src/lib/validation/auth-token'
import axios, {
    type AxiosError,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL

if (!API_BASE_URL) {
    throw new Error(
        'VITE_API_URL is not configured. Copy .env.example to .env and restart Vite.'
    )
}

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 15_000,
})

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

type RetryableRequest = AxiosRequestConfig & {
    _retry?: boolean
}

let refreshPromise: Promise<string> | null = null
let authExpiredHandler: (() => void) | null = null

export function setAuthExpiredHandler(handler: () => void) {
    authExpiredHandler = handler
}

async function refreshAccessToken(): Promise<string> {
    if (!refreshPromise) {
        refreshPromise = apiClient
            .post<{ access: string }>('/api/auth/refresh/', undefined, {
                _skipAuthRefresh: true,
            } as RetryableRequest)
            .then(({ data }) => {
                setAccessToken(data.access)
                return data.access
            })
            .finally(() => {
                refreshPromise = null
            })
    }
    return refreshPromise
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableRequest | undefined

        if (
            !originalRequest ||
            error.response?.status !== 401 ||
            originalRequest._retry ||
            originalRequest.url?.includes('/api/auth/login') ||
            originalRequest.url?.includes('/api/auth/refresh')
        ) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            const accessToken = await refreshAccessToken()
            originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${accessToken}`,
            }
            return apiClient(originalRequest)
        } catch (refreshError) {
            clearAccessToken()
            authExpiredHandler?.()
            return Promise.reject(refreshError)
        }
    }
)
