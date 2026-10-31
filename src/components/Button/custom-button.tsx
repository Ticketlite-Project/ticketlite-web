import { Loader2 } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CustomButtonProps } from './custom-button.type'
import { buttonVariantStyles, sizeStyles } from './custom-button.variants'

export function CustomButton(props: CustomButtonProps) {
    const {
        variant = 'primary',
        size = 'md',
        bordered = false,
        rounded = false,
        icon,
        iconRight,
        fullWidth = false,
        loading = false,
        className,
        children,
        ...rest
    } = props

    const styles = buttonVariantStyles[variant]

    const classes = cn(
        'relative',
        'padding-x-4 padding-y-2',
        'rounded-none',
        'font-bold',
        'uppercase',
        'tracking-wide',
        styles.base,
        styles.ring,
        sizeStyles[size],
        bordered ? styles.border : 'border-0',
        rounded && 'rounded-lg',
        fullWidth && 'w-full',
        loading && 'cursor-wait',
        className
    )

    const content = (
        <>
            {loading ? (
                <Loader2
                    className="size-[1em] animate-spin"
                    aria-hidden="true"
                />
            ) : (
                icon && (
                    <span
                        className="shrink-0 [&>svg]:size-[1em]"
                        aria-hidden="true"
                    >
                        {icon}
                    </span>
                )
            )}
            {children && <span>{children}</span>}
            {iconRight && !loading && (
                <span
                    className="shrink-0 [&>svg]:size-[1em]"
                    aria-hidden="true"
                >
                    {iconRight}
                </span>
            )}
        </>
    )

    // Link mode — `to` is present
    if ('to' in rest && rest.to !== undefined) {
        const { to, ...linkRest } = rest
        return (
            <Link
                to={to}
                aria-disabled={loading || undefined}
                className={classes}
                {...linkRest}
            >
                {content}
            </Link>
        )
    }

    // Native button mode
    const { type = 'button', disabled, ...buttonRest } = rest
    return (
        <Button
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={classes}
            {...buttonRest}
        >
            {content}
        </Button>
    )
}
