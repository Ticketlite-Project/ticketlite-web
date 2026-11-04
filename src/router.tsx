import { ProtectedRoute } from '@/src/components/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/src/components/auth/PublicOnlyRoute'
import { Page } from '@/src/components/Page'
import { MainLayout } from '@/src/layouts/MainLayout'
import {
    CreateEvent,
    EventDetails,
    EventsDashboard,
    Home,
    Login,
    MyTickets,
    NotFound,
    OrganisersGetAllPage,
    Signup,
} from '@/src/routes/lazyPages'
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
