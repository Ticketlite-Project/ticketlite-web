import { NavLink, type NavLinkProps } from 'react-router'
import { cn } from '../../mock/utils'

const baseClass =
    'text-sm font-bold transition-colors text-primary hover:opacity-90 hover:text-primary/80'
const activeClass = 'border-b-2 border-[#1a6e44] pb-1'

function navLinkClass({ isActive }: { isActive: boolean }) {
    return cn(baseClass, isActive && activeClass)
}

export function AppNavLink({ className, ...props }: Readonly<NavLinkProps>) {
    return (
        <NavLink
            {...props}
            className={(state) =>
                cn(
                    navLinkClass(state),
                    typeof className === 'function'
                        ? className(state)
                        : className
                )
            }
        />
    )
}
