import { getAccessToken } from '@/src/lib/validation/auth-token'
import axios from 'axios'

const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'https://ticketlite-api.onrender.com'

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
    const token = getAccessToken()

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})
