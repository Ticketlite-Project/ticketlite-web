import { lazy } from 'react'

export const Home = lazy(() => import('@/src/pages/Home'))
export const EventDetails = lazy(() => import('@/src/pages/EventDetails'))
export const MyTickets = lazy(() => import('@/src/pages/MyTickets'))
export const OrganisersGetAllPage = lazy(
    () => import('@/src/pages/OrganisersGetAllPage')
)
export const EventsDashboard = lazy(() => import('@/src/pages/EventsDashboard'))
export const CreateEvent = lazy(() => import('@/src/pages/CreateEvent'))
export const Login = lazy(() => import('@/src/pages/Login'))
export const Signup = lazy(() => import('@/src/pages/SignUp'))
export const NotFound = lazy(() => import('@/src/pages/NotFound'))
