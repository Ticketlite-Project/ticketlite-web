import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { CustomAlertProps } from './custom-alert.types'
import { alertVariantStyles } from './custom-alert.variants'

export function CustomAlert({
    type = 'primary',
    title,
    description,
    icon,
    bordered = false,
    boldTitle = false,
    largeIcon = false,
    className,
    children,
}: Readonly<CustomAlertProps>) {
    const styles = alertVariantStyles[type]

    if (!title && !description && !icon && !children) return null

    const hasIcon = Boolean(icon)
    const hasText = Boolean(title || description || children)

    return (
        <Alert
            role={type === 'danger' ? 'alert' : 'status'}
            className={cn(
                'w-full',
                styles.base,
                bordered
                    ? cn('border', styles.bordered)
                    : 'border-0 shadow-none',
                largeIcon &&
                    hasIcon &&
                    hasText &&
                    'grid grid-cols-[auto_1fr] items-start gap-3',
                largeIcon && 'sm:[&>svg]:static sm:[&>svg]:translate-y-0',
                className
            )}
        >
            {/* Icon */}
            {hasIcon && (
                <span
                    className={cn(
                        'shrink-0',
                        styles.iconColor,
                        largeIcon
                            ? 'row-span-full self-start [&>svg]:size-7 [&>svg]:sm:size-8'
                            : 'row-span-full self-start [&>svg]:size-6 [&>svg]:sm:size-7'
                    )}
                    aria-hidden="true"
                >
                    {icon}
                </span>
            )}

            {/* Text container: stacks title/description in one column when largeIcon */}
            {(title || description || children) && (
                <div
                    className={cn(
                        'flex flex-col gap-1',
                        largeIcon && 'min-w-0'
                    )}
                >
                    {title && (
                        <AlertTitle
                            className={cn(
                                'mb-0 leading-snug',
                                boldTitle ? 'font-semibold' : 'font-medium',
                                styles.titleColor
                            )}
                        >
                            {title}
                        </AlertTitle>
                    )}

                    {description && (
                        <AlertDescription
                            className={cn(
                                'text-sm leading-relaxed',
                                styles.descriptionColor
                            )}
                        >
                            {description}
                        </AlertDescription>
                    )}

                    {children}
                </div>
            )}
        </Alert>
    )
}
