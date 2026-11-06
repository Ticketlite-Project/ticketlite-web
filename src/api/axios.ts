import {
    clearAccessToken,
    getAccessToken,
    getRefreshToken,
    setAccessToken,
} from '../lib/validation/auth-token'
import axios, {
    type AxiosError,
    type AxiosRequestConfig,
    type InternalAxiosRequestConfig,
} from 'axios'

export const apiClient = axios.create({
    // Use the same origin in both development and production. Vite and Vercel
    // proxy /api to the backend, avoiding CORS for browser requests.
    baseURL: '/api',
    withCredentials: false,
    timeout: 60_000,
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
    const refresh = getRefreshToken()
    if (!refresh) {
        throw new Error('No refresh session is available')
    }
    if (!refreshPromise) {
        refreshPromise = apiClient
            .post<{ access: string }>('/auth/token/refresh/', { refresh }, {
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
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/token/refresh')
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
