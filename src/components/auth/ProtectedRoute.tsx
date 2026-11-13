import type { UserRole } from '@/src/types/auth'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
    allowedRoles?: UserRole[]
    children?: React.ReactNode
}

export function ProtectedRoute({
    allowedRoles,
    children,
}: Readonly<ProtectedRouteProps>) {
    const { user, isAuthenticated, isInitializing } = useAuth()
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

    // Check if route requires specific roles and user doesn't have them
    if (allowedRoles && allowedRoles.length > 0) {
        if (!user || !allowedRoles.includes(user.role)) {
            // Redirect unauthorized users to home or a dedicated unauthorized page
            return <Navigate to="/" replace />
        }
    }

    // Render nested children if provided via JSX, otherwise fall back to <Outlet />
    return children ? <>{children}</> : <Outlet />
}
