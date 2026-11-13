import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicOnlyRoute } from './components/auth/PublicOnlyRoute'
import { Page } from './components/Page'
import { MainLayout } from './layouts/MainLayout'

import {
    AdminDashboard,
    AdminPlatformNumbers,
    AdminUsers,
    Checkout,
    CreateEvent,
    EventDetails,
    EventsDashboard,
    Home,
    Login,
    Logout,
    MobileMoneyPaymentFlow,
    MyTickets,
    NotFound,
    OrganisersGetAllPage,
    Signup,
} from './routes/lazyPages'

import { createBrowserRouter } from 'react-router'

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

            // Logout page
            {
                path: 'logout',
                element: (
                    <Page>
                        <Logout />
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
                    // My tickets
                    {
                        path: 'my-tickets',
                        element: (
                            <Page>
                                <MyTickets />
                            </Page>
                        ),
                    },
                    {
                        path: 'checkout',
                        element: (
                            <Page>
                                <Checkout />
                            </Page>
                        ),
                    },
                    {
                        path: 'payment/mobile-money',
                        element: (
                            <Page>
                                <MobileMoneyPaymentFlow />
                            </Page>
                        ),
                    },
                    {
                        path: 'organisers',
                        element: (
                            <ProtectedRoute allowedRoles={['ORGANIZER']}>
                                <Page>
                                    <OrganisersGetAllPage />
                                </Page>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'organisers/create-event',
                        element: (
                            <ProtectedRoute allowedRoles={['ORGANIZER']}>
                                <Page>
                                    <CreateEvent />
                                </Page>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'organisers/events/:id/dashboard',
                        element: (
                            <Page>
                                <EventsDashboard />
                            </Page>
                        ),
                    },
                    {
                        path: 'admin',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <Page>
                                    <AdminDashboard />
                                </Page>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'admin/users',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <Page>
                                    <AdminUsers />
                                </Page>
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'admin/platform-numbers',
                        element: (
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <Page>
                                    <AdminPlatformNumbers />
                                </Page>
                            </ProtectedRoute>
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
