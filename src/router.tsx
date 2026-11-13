
import { createBrowserRouter } from 'react-router-dom'

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
    MobileMoneyPaymentFlow,
} from './routes/lazyPages'

import OrganizerEventsDashboard from './pages/OrganizerEventsDashboard'

export const router = createBrowserRouter([
    {
        element: <MainLayout />,

        errorElement: (
            <Page>
                <NotFound />
            </Page>
        ),

        children: [
            // Home page
            {
                index: true,
                element: (
                    <Page>
                        <Home />
                    </Page>
                ),
            },

            // My tickets
            {
                path: 'my-tickets',
                element: (
                    <Page>
                        <MyTickets />
                    </Page>
                ),
            },

            // Events
            {
                path: 'events',
                element: (
                    <Page>
                        <Home />
                    </Page>
                ),
            },

            // Event details
            {
                path: 'events/:id',
                element: (
                    <Page>
                        <EventDetails />
                    </Page>
                ),
            },

            // Public routes
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

            // Protected routes
            {
                element: <ProtectedRoute />,
                children: [
                    // Checkout
                    {
                        path: 'checkout',
                        element: (
                            <Page>
                                <Checkout />
                            </Page>
                        ),
                    },

                    // Mobile Money Payment
                    {
                        path: 'payment/mobile-money',
                        element: (
                            <Page>
                                <MobileMoneyPaymentFlow />
                            </Page>
                        ),
                    },

                    // Organisers list
                    {
                        path: 'organisers',
                        element: (
                            <Page>
                                <OrganisersGetAllPage />
                            </Page>
                        ),
                    },

                    // Create event
                    {
                        path: 'organisers/create-event',
                        element: (
                            <Page>
                                <CreateEvent />
                            </Page>
                        ),
                    },

                    // New organiser event dashboard
                    {
                        path: 'organisers/events/:id/dashboard',
                        element: (
                            <Page>
                                <OrganizerEventsDashboard />
                            </Page>
                        ),
                    },

                    // Existing organiser dashboard
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

            // Catch-all route
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
