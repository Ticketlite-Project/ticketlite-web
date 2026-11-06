import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute'
import { Page } from './components/Page'
import { MainLayout } from './layouts/MainLayout'
import {
    CreateEvent,
    Checkout,
    EventDetails,
    EventsDashboard,
    Home,
    Login,
    MyTickets,
    NotFound,
    OrganisersGetAllPage,
    Signup,
} from './routes/lazyPages'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        errorElement: (
            <Page>
                <NotFound />
            </Page>
        ),
        children: [
            {
                index: true,
                element: (
                    <Page>
                        <Home />
                    </Page>
                ),
            },
            {
                path: 'my-tickets',
                element: (
                    <Page>
                        <MyTickets />
                    </Page>
                ),
            },
            {
                path: 'events',
                element: (
                    <Page>
                        <Home />
                    </Page>
                ),
            },
            {
                path: 'events/:id',
                element: (
                    <Page>
                        <EventDetails />
                    </Page>
                ),
            },
            {
                element: <PublicOnlyRoute />,
                children: [
                    {
                        path: 'login',
                        element: (
                            <Page>
                                <Login />
                            </Page>
                        ),
                    },
                    {
                        path: 'signup',
                        element: (
                            <Page>
                                <Signup />
                            </Page>
                        ),
                    },
                ],
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: 'checkout',
                        element: (
                            <Page>
                                <Checkout />
                            </Page>
                        ),
                    },
                    {
                        path: 'organisers',
                        element: (
                            <Page>
                                <OrganisersGetAllPage />
                            </Page>
                        ),
                    },
                    {
                        path: 'organisers/create-event',
                        element: (
                            <Page>
                                <CreateEvent />
                            </Page>
                        ),
                    },
                    {
                        path: 'organisers/:id',
                        element: (
                            <Page>
                                <EventsDashboard />
                            </Page>
                        ),
                    },
                ],
            },
            {
                path: '*',
                element: (
                    <Page>
                        <NotFound />
                    </Page>
                ),
            },
        ],
    },
])
