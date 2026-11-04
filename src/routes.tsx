import { MainLayout } from '@/src/layouts/MainLayout'
import { createBrowserRouter } from 'react-router-dom'
import CreateEvent from './pages/CreateEvent'
import EventDetails from './pages/EventDetails'
import EventsDashboard from './pages/EventsDashboard'
import Home from './pages/Home'
import { NotFound } from './pages/NotFound'
import OrganisersGetAllPage from './pages/OrganisersGetAllPage'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        errorElement: <NotFound />,
        children: [
            {
                // index: true means this is the default page at "/"
                index: true,
                element: <Home />,
            },
            {
                path: 'events',
                element: <Home />,
            },
            {
                path: 'events/:id',
                element: <EventDetails />,
            },
        ],
    },
    {
        //TODO: move organisers route into a common and shared layout
        path: 'organisers',
        element: <OrganisersGetAllPage />,
        errorElement: <NotFound />,
    },
    {
        path: 'organisers/:id',
        element: <EventsDashboard />,
        errorElement: <NotFound />,
    },
    {
        path: 'organisers/create-event',
        element: <CreateEvent />,
        errorElement: <NotFound />,
    },
])
