import { Avatar, AvatarFallback } from '../../../components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { useAuth } from '../../hooks/useAuth'
import {
    LogOut,
    Menu,
    Moon,
    Sun,
    Ticket,
    X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CustomButton } from '../Button/custom-button'
import { AppNavLink } from './nav-link'

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const returnState = { from: location }
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)

    const [isDark, setIsDark] = useState(
        () =>
            localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
    )

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }, [isDark])

    // Helper to get initials (e.g., "Ama M." -> "AM")
    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return 'U'
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                {/* LEFT: Logo & Links */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-homeText hover:opacity-90 transition-opacity"
                    >
                        <Ticket className="h-6 w-6 fill-current" />
                        <span className="font-extrabold text-xl tracking-tight">
                            TicketLite
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-6">
                        <AppNavLink to="/">Events</AppNavLink>
                        <AppNavLink to="/my-tickets">My tickets</AppNavLink>
                        <AppNavLink to="/organisers">For organisers</AppNavLink>
                    </nav>
                </div>

                {/* RIGHT: Auth Actions */}
                <div className="flex items-center gap-4">
                    {/* Dark Mode Toggle (Placeholder for now) */}
                    <button
                        type="button"
                        aria-label={
                            isDark
                                ? 'Switch to light theme'
                                : 'Switch to dark theme'
                        }
                        onClick={() => setIsDark((current) => !current)}
                        className="cursor-pointer border rounded-full text-muted-foreground hover:text-foreground p-2 transition-colors"
                    >
                        {isDark ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </button>

                    {!isAuthenticated ? (
                        /* --- LOGGED OUT STATE --- */
                        <div className="hidden md:flex items-center gap-2">
                            <CustomButton
                                to="/login"
                                state={returnState}
                                variant="secondary"
                                className="flex items-center shadow"
                            >
                                Log in
                            </CustomButton>
                            <CustomButton
                                to="/signup"
                                state={returnState}
                                variant="primary"
                                className="flex items-center shadow"
                            >
                                Sign up
                            </CustomButton>
                        </div>
                    ) : (
                        /* --- LOGGED IN STATE --- */
                        <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                            <DropdownMenuTrigger
                                type="button"
                                aria-label="Open profile menu"
                                className="hidden md:flex items-center gap-3 hover:opacity-80 transition-opacity outline-none"
                            >
                                <Avatar className="h-9 w-9 bg-[#d1f4e0] text-[#1a6e44] border border-[#b3e6a1]">
                                    <AvatarFallback className="font-bold text-sm">
                                        {getInitials(
                                            user?.first_name,
                                            user?.last_name
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-bold text-primary hidden sm:block">
                                    {user?.first_name}{' '}
                                    {user?.last_name?.charAt(0)}.
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-56 mt-2"
                            >
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {user?.first_name} {user?.last_name}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        setProfileMenuOpen(false)
                                        navigate('/my-tickets')
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Ticket className="mr-2 h-4 w-4" />
                                    <span>My Tickets</span>
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem
                                    render={
                                        <Link
                                            to="/profile"
                                            className="cursor-pointer"
                                        >
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            <span>Profile Settings</span>
                                        </Link>
                                    }
                                ></DropdownMenuItem> */}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        logout()
                                        setProfileMenuOpen(false)
                                        navigate('/', { replace: true })
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <button
                        type="button"
                        aria-label={
                            mobileMenuOpen
                                ? 'Close navigation menu'
                                : 'Open navigation menu'
                        }
                        aria-expanded={mobileMenuOpen}
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        className="flex items-center justify-center rounded-md border p-2 md:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="absolute left-0 right-0 top-full border-b bg-background px-4 py-5 shadow-lg md:hidden">
                    <nav className="flex flex-col gap-4">
                        <AppNavLink
                            to="/"
                            className="py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Events
                        </AppNavLink>
                        <AppNavLink
                            to="/my-tickets"
                            className="py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            My tickets
                        </AppNavLink>
                        <AppNavLink
                            to="/organisers"
                            className="py-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            For organisers
                        </AppNavLink>
                    </nav>
                    <div className="mt-5 flex gap-2 border-t pt-4">
                        {!isAuthenticated ? (
                            <>
                                <CustomButton
                                    to="/login"
                                    state={returnState}
                                    variant="secondary"
                                    className="flex items-center flex-1 justify-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log in
                                </CustomButton>
                                <CustomButton
                                    to="/signup"
                                    state={returnState}
                                    variant="primary"
                                    className="flex items-center flex-1 justify-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign up
                                </CustomButton>
                            </>
                        ) : (
                            <CustomButton
                                variant="danger"
                                className="w-full justify-center"
                                onClick={() => {
                                    setMobileMenuOpen(false)
                                    logout()
                                    navigate('/', { replace: true })
                                }}
                            >
                                Log out
                            </CustomButton>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
