import { LogOut, Menu, Moon, Shield, Sun, Ticket, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
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
import { CustomButton } from '../Button/custom-button'
import { AppNavLink } from './nav-link'

interface NavItem {
    to: string
    label: string
    icon?: React.ReactNode
}

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const returnState = { from: location }
    const isLoginPage = location.pathname === '/login'

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return 'U'
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
    }

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully', { duration: 3500 })
        navigate('/logout', { replace: true })
    }

    const isAdmin = user?.role === 'ADMIN'
    const isOrganizer = user?.role === 'ORGANIZER'

    // Dynamic Navigation Links Configuration based on User Role
    const getNavLinks = (): NavItem[] => {
        if (isAdmin) {
            return [
                { to: '/organisers', label: 'Organisers' },
                { to: '/admin/users', label: 'Users' },
                { to: '/admin/platform-numbers', label: 'Platform Numbers' },
            ]
        }

        // Standard links for Attendee / Organizer / Guest
        const links: NavItem[] = [
            { to: '/', label: 'Events' },
            { to: '/my-tickets', label: 'My tickets' },
        ]

        if (isAdmin || isOrganizer) {
            links.push({ to: '/organisers', label: 'For organisers' })
        }

        return links
    }

    const navLinks = getNavLinks()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
                {/* LEFT: Logo and Navigation */}
                <div className="flex items-center gap-8">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-homeText transition-opacity hover:opacity-90"
                    >
                        <Ticket className="h-6 w-6 fill-current" />
                        <span className="text-xl font-extrabold tracking-tight">
                            TicketLite
                        </span>
                    </Link>

                    {isAdmin && (
                        <span className="rounded-md bg-ticket-warning-bg px-2 py-0.5 text-xs font-semibold text-ticket-warning-fg">
                            Admin
                        </span>
                    )}

                    {!isLoginPage && (
                        <nav className="hidden items-center gap-6 md:flex">
                            {navLinks.map((link) => (
                                <AppNavLink
                                    key={link.to}
                                    to={link.to}
                                    className={
                                        isAdmin && link.label === 'Admin'
                                            ? 'flex items-center gap-1.5 font-semibold text-primary'
                                            : ''
                                    }
                                >
                                    {link.label}
                                </AppNavLink>
                            ))}
                        </nav>
                    )}
                </div>

                {/* RIGHT: Auth Actions */}
                <div className="flex items-center gap-4">
                    {/* Dark Mode Toggle */}
                    <button
                        type="button"
                        aria-label={
                            isDark
                                ? 'Switch to light theme'
                                : 'Switch to dark theme'
                        }
                        onClick={() => setIsDark((current) => !current)}
                        className="cursor-pointer rounded-full border p-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {isDark ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </button>

                    {!isLoginPage && (
                        <>
                            {!isAuthenticated ? (
                                <div className="hidden items-center gap-2 md:flex">
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
                                <div className="hidden md:block">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            type="button"
                                            aria-label="Open profile menu"
                                            className="flex cursor-pointer items-center gap-3 rounded-md p-2 outline-none transition-colors hover:bg-accent"
                                        >
                                            <Avatar className="h-9 w-9 border border-[#b3e6a1] bg-[#d1f4e0] text-[#1a6e44]">
                                                <AvatarFallback className="text-sm font-bold">
                                                    {getInitials(
                                                        user?.first_name,
                                                        user?.last_name
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>

                                            <span className="hidden text-sm font-bold text-primary sm:block">
                                                {user?.first_name}{' '}
                                                {user?.last_name?.charAt(0)}.
                                            </span>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="end"
                                            side="bottom"
                                            sideOffset={8}
                                            className="w-56"
                                        >
                                            <DropdownMenuLabel>
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {user?.first_name}{' '}
                                                        {user?.last_name}
                                                    </p>

                                                    <p className="text-xs leading-none text-muted-foreground">
                                                        {user?.email}
                                                    </p>
                                                </div>
                                            </DropdownMenuLabel>

                                            <DropdownMenuSeparator />

                                            {!isAdmin && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        navigate('/my-tickets')
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    <Ticket className="mr-2 h-4 w-4" />
                                                    <span>My Tickets</span>
                                                </DropdownMenuItem>
                                            )}

                                            {isAdmin && (
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        navigate('/admin')
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    <span>Admin Dashboard</span>
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator />

                                            <DropdownMenuItem
                                                onClick={handleLogout}
                                                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                            >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Log out</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </>
                    )}

                    {/* Mobile Menu Button */}
                    {!isLoginPage && (
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
                    )}
                </div>
            </div>

            {/* MOBILE NAVIGATION */}
            {mobileMenuOpen && !isLoginPage && (
                <div className="absolute left-0 right-0 top-full border-b bg-background px-4 py-5 shadow-lg md:hidden">
                    <nav className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <AppNavLink
                                key={link.to}
                                to={link.to}
                                className="py-2 flex items-center gap-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {isAdmin && link.label === 'Admin' && (
                                    <Shield className="h-4 w-4" />
                                )}
                                {link.label}
                            </AppNavLink>
                        ))}
                    </nav>

                    <div className="mt-5 flex gap-2 border-t pt-4">
                        {!isAuthenticated ? (
                            <>
                                <CustomButton
                                    to="/login"
                                    state={returnState}
                                    variant="secondary"
                                    className="flex flex-1 items-center justify-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log in
                                </CustomButton>

                                <CustomButton
                                    to="/signup"
                                    state={returnState}
                                    variant="primary"
                                    className="flex flex-1 items-center justify-center"
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
                                    handleLogout()
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
