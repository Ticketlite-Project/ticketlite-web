import type { ButtonVariant } from './custom-button.type'

export const buttonVariantStyles: Record<
    ButtonVariant,
    {
        base: string // solid / outline colors
        border: string // border color when `bordered` is true
        ring: string // focus ring color
    }
> = {
    primary: {
        base: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
        border: 'border border-green-700',
        ring: 'focus-visible:ring-green-500',
    },
    secondary: {
        base: 'bg-gray-200 text-green-700 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700',
        border: 'border border-gray-300 dark:border-gray-700',
        ring: 'focus-visible:ring-green-500',
    },
    danger: {
        base: 'bg-white text-red-600 hover:bg-red-50 active:bg-red-100 dark:bg-background dark:hover:bg-red-950/40',
        border: 'border border-red-500',
        ring: 'focus-visible:ring-red-500',
    },
    valid: {
        base: 'bg-white text-green-600 hover:bg-green-50 active:bg-green-100 dark:bg-background dark:hover:bg-green-950/40',
        border: 'border border-green-500',
        ring: 'focus-visible:ring-green-500',
    },
    already: {
        base: 'bg-black text-white hover:bg-neutral-800 active:bg-neutral-700 dark:bg-neutral-900',
        border: 'border border-neutral-700',
        ring: 'focus-visible:ring-neutral-500',
    },
}

export const sizeStyles = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2.5',
} as const
