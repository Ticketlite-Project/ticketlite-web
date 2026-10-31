import type { AlertVariant } from './custom-alert.types'

export const alertVariantStyles: Record<
    AlertVariant,
    {
        base: string
        bordered: string
        iconColor: string
        titleColor?: string
        descriptionColor?: string
    }
> = {
    primary: {
        base: 'bg-green-50 text-gray-900 dark:bg-green-950/40 dark:text-gray-100',
        bordered: 'border-green-300 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        titleColor: 'text-green-900 dark:text-green-50',
        descriptionColor: 'text-green-800/90 dark:text-green-200/90',
    },
    secondary: {
        base: 'bg-muted text-muted-foreground',
        bordered: 'border-border',
        iconColor: 'text-muted-foreground',
        titleColor: 'text-foreground',
        descriptionColor: 'text-muted-foreground',
    },
    danger: {
        // System background (light/dark friendly) + red border + red icon
        base: 'bg-background text-foreground',
        bordered: 'border-red-400 dark:border-red-700',
        iconColor: 'text-red-600 dark:text-red-400',
        titleColor: 'text-foreground',
        descriptionColor: 'text-muted-foreground',
    },
}
