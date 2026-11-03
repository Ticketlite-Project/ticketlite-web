import type { ComponentProps, ReactNode } from 'react'
import type { LinkProps } from 'react-router'

export type ButtonVariant =
    'primary' | 'secondary' | 'danger' | 'valid' | 'already'

export type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseProps {
    variant?: ButtonVariant
    size?: ButtonSize
    bordered?: boolean
    rounded?: boolean
    icon?: ReactNode
    iconRight?: ReactNode
    iconLeft?: ReactNode
    fullWidth?: boolean
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
