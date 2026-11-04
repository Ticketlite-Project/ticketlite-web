import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/src/hooks/useAuth'
import { LogOut, Moon, Sun, Ticket, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CustomButton } from '../Button/custom-button'

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth()

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
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `text-sm font-bold transition-colors text-primary ${isActive ? 'border-b-2 border-[#1a6e44] pb-1' : ''}`
                            }
                        >
                            Events
                        </NavLink>
                        <NavLink
                            to="/my-tickets"
                            className={({ isActive }) =>
                                `text-sm font-bold transition-colors text-primary ${isActive ? 'border-b-2 border-[#1a6e44] pb-1' : ''}`
                            }
                        >
                            My tickets
                        </NavLink>
                        <NavLink
                            to="/organisers"
                            className={({ isActive }) =>
                                `text-sm font-bold transition-colors text-primary ${isActive ? 'border-b-2 border-[#1a6e44] pb-1' : ''}`
                            }
                        >
                            For organisers
                        </NavLink>
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
                        className=" cursor-pointer border rounded-full text-muted-foreground hover:text-foreground p-2 transition-colors hidden sm:block"
                    >
                        {isDark ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </button>

                    {!isAuthenticated ? (
                        /* --- LOGGED OUT STATE --- */
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <CustomButton
                                    variant="secondary"
                                    className="shadow"
                                >
                                    Log in
                                </CustomButton>
                            </Link>
                            <Link to="/signup">
                                <CustomButton
                                    variant="primary"
                                    className="shadow"
                                >
                                    Sign up
                                </CustomButton>
                            </Link>
                        </div>
                    ) : (
                        /* --- LOGGED IN STATE --- */
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <button className="flex items-center gap-3 hover:opacity-80 transition-opacity outline-none">
                                        <Avatar className="h-9 w-9 bg-[#d1f4e0] text-[#1a6e44] border border-[#b3e6a1]">
                                            <AvatarFallback className="font-bold text-sm">
                                                {getInitials(
                                                    user?.first_name,
                                                    user?.last_name
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-bold text-gray-900 hidden sm:block">
                                            {user?.first_name}{' '}
                                            {user?.last_name?.charAt(0)}.
                                        </span>
                                    </button>
                                }
                            />
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
                                    render={
                                        <Link
                                            to="/my-tickets"
                                            className="cursor-pointer"
                                        >
                                            <Ticket className="mr-2 h-4 w-4" />
                                            <span>My Tickets</span>
                                        </Link>
                                    }
                                ></DropdownMenuItem>
                                <DropdownMenuItem
                                    render={
                                        <Link
                                            to="/profile"
                                            className="cursor-pointer"
                                        >
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            <span>Profile Settings</span>
                                        </Link>
                                    }
                                ></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    render={
                                        <button
                                            onClick={logout}
                                            className="w-full text-left cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </button>
                                    }
                                ></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </header>
    )
}
