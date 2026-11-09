
import { lazy } from 'react'

export const Home = lazy(() => import('../pages/Home'))

export const EventDetails = lazy(() => import('../pages/EventDetails'))

export const MyTickets = lazy(() => import('../pages/MyTickets'))

export const OrganisersGetAllPage = lazy(
    () => import('../pages/OrganisersGetAllPage')
)

export const EventsDashboard = lazy(
    () => import('../pages/EventsDashboard')
)

export const CreateEvent = lazy(() => import('../pages/CreateEvent'))

export const Login = lazy(() => import('../pages/Login'))

export const Signup = lazy(() => import('../pages/SignUp'))

export const NotFound = lazy(() => import('../pages/NotFound'))

export const Checkout = lazy(() => import('../pages/CheckoutPage'))

// Mobile Money Payment component
export const MobileMoneyPaymentFlow = lazy(
    () => import('../components/MobileMoneyPaymentFlow')
)
