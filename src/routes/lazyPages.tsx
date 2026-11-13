import { lazy } from 'react'

export const Home = lazy(() => import('../pages/Home'))

export const AdminDashboard = lazy(() => import('../pages/AdminDashboard'))
export const AdminUsers = lazy(() => import('../pages/AdminUsers'))
export const AdminPlatformNumbers = lazy(
    () => import('../pages/AdminPlatformNumbers')
)

export const EventDetails = lazy(() => import('../pages/EventDetails'))

export const MyTickets = lazy(() => import('../pages/MyTickets'))

export const OrganisersGetAllPage = lazy(
    () => import('../pages/OrganisersGetAllPage')
)

export const EventsDashboard = lazy(() => import('../pages/OrganizerEventsDashboard'))

export const CreateEvent = lazy(() => import('../pages/CreateEvent'))

export const Login = lazy(() => import('../pages/Login'))

export const Logout = lazy(() => import('../pages/Logout'))

export const Signup = lazy(() => import('../pages/SignUp'))

export const NotFound = lazy(() => import('../pages/NotFound'))

export const Checkout = lazy(() => import('../pages/CheckoutPage'))

// Mobile Money Payment component
export const MobileMoneyPaymentFlow = lazy(
    () => import('../components/MobileMoneyPaymentFlow')
)
