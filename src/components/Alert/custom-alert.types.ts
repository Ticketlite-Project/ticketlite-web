import type { ReactNode } from 'react'

export type AlertVariant = 'primary' | 'secondary' | 'danger'

export interface CustomAlertProps {
    type?: AlertVariant
    title?: string
    description?: string
    icon?: ReactNode
    bordered?: boolean
    boldTitle?: boolean
    largeIcon?: boolean
    className?: StringConstructor
    children?: ReactNode
}
