import axios from 'axios'

const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'https://ticketlite-api.onrender.com'

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Optional: Add an interceptor to automatically attach the token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('ticketlite_access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
