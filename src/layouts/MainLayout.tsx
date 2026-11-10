
import { Toaster } from '../../components/ui/sonner'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/Footer/footer'
import { Navbar } from '../components/NavBar/nav-bar'

export function MainLayout() {
    const location = useLocation()

    // Hide the main Navbar on the My Tickets page.
    const hideNavbar =
        location.pathname === '/my-tickets' ||
        location.pathname.startsWith('/my-tickets/')

    return (
        <>
            <div className="flex flex-col min-h-screen bg-background text-foreground hide-scrollbar">
                {!hideNavbar && <Navbar />}

                {/* Main content area */}
                <Outlet />

                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                />
            </div>

            <Footer />
        </>
    )
}
