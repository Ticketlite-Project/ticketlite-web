import type { ComponentProps, ReactNode } from 'react'
import type { LinkProps } from 'react-router'

export type ButtonVariant =
    'primary' | 'secondary' | 'danger' | 'valid' | 'already'

export type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseProps {
    variant?: ButtonVariant
    size?: ButtonSize
    /** Show a border in the variant's accent color */
    bordered?: boolean
    /** Rounded corners (default: square) */
    rounded?: boolean
    /** Icon rendered before the label */
    icon?: ReactNode
    /** Icon rendered after the label */
    iconRight?: ReactNode
    /** Stretch to fill parent width */
    fullWidth?: boolean
    /** Show spinner and disable interactions */
    loading?: boolean
    className?: string
    children?: ReactNode
}

// Discriminated by `to` — link mode vs button mode
type ButtonAsButton = BaseProps &
    Omit<ComponentProps<'button'>, keyof BaseProps> & { to?: undefined }

type ButtonAsLink = BaseProps &
    Omit<LinkProps, keyof BaseProps> & { to: LinkProps['to'] }

export type CustomButtonProps = ButtonAsButton | ButtonAsLink
