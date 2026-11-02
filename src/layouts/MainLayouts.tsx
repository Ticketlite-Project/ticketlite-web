// src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/NavBar/nav-bar'

export function MainLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Navbar stays fixed at the top */}
            <Navbar />

            {/* Main content area where child pages will render */}
            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="bg-white border-t py-4 text-center text-gray-600">
                &copy; {new Date().getFullYear()} TicketLite. All rights
                reserved.
            </footer>
        </div>
    )
}
