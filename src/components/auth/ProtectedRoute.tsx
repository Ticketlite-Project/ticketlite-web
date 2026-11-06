import { useAuth } from '../../hooks/useAuth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export function ProtectedRoute() {
    const { isAuthenticated, isInitializing } = useAuth()
    const location = useLocation()

    if (isInitializing) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                Restoring session...
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return <Outlet />
}
