import { useAuth } from '../../hooks/useAuth'
import { Navigate, Outlet } from 'react-router-dom'

export function PublicOnlyRoute() {
    const { isAuthenticated, isInitializing } = useAuth()

    if (isInitializing) {
        return null
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}
