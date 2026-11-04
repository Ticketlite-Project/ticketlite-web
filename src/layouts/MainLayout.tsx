import { Toaster } from '@/components/ui/sonner'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer/footer'
import { Navbar } from '../components/NavBar/nav-bar'

export function MainLayout() {
    return (
        <>
            <div className="flex flex-col min-h-screen bg-background text-foregrounds hide-scrollbar">
                <Navbar />
                {/* Main content area where child pages will render */}
                <Outlet />
                <Toaster position="top-right" richColors closeButton />
            </div>
            <Footer />
        </>
    )
}
