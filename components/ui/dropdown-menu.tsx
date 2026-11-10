
import * as React from 'react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { cn } from '../../src/mock/utils'
import { CheckIcon, ChevronRightIcon } from 'lucide-react'

type DropdownMenuContentProps =
    React.ComponentProps<typeof MenuPrimitive.Popup> & {
        align?: 'start' | 'center' | 'end'
        side?: 'top' | 'right' | 'bottom' | 'left'
        sideOffset?: number
    }

function DropdownMenu(
    props: React.ComponentProps<typeof MenuPrimitive.Root>
) {
    return <MenuPrimitive.Root {...props} />
}

function DropdownMenuTrigger(
    props: React.ComponentProps<typeof MenuPrimitive.Trigger>
) {
    return <MenuPrimitive.Trigger {...props} />
}

function DropdownMenuContent({
    className,
    align = 'end',
    side = 'bottom',
    sideOffset = 4,
    ...props
}: DropdownMenuContentProps) {
    return (
        <MenuPrimitive.Portal>
            <MenuPrimitive.Positioner
                align={align}
                side={side}
                sideOffset={sideOffset}
            >
                <MenuPrimitive.Popup
                    className={cn(
                        'z-50 min-w-32 overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-lg outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
                        className
                    )}
                    {...props}
                />
            </MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
    )
}

function DropdownMenuItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.Item>) {
    return (
        <MenuPrimitive.Item
            className={cn(
                'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-100',
                className
            )}
            {...props}
        >
            {children}
        </MenuPrimitive.Item>
    )
}

function DropdownMenuLabel({
    className,
    children,
    ...props
}: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'px-2 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

function DropdownMenuSeparator({
    className,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.Separator>) {
    return (
        <MenuPrimitive.Separator
            className={cn(
                '-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700',
                className
            )}
            {...props}
        />
    )
}

function DropdownMenuGroup(
    props: React.ComponentProps<typeof MenuPrimitive.Group>
) {
    return <MenuPrimitive.Group {...props} />
}

function DropdownMenuShortcut({
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span
            className={cn(
                'ml-auto text-xs tracking-widest text-gray-500',
                className
            )}
            {...props}
        />
    )
}

function DropdownMenuSub(
    props: React.ComponentProps<typeof MenuPrimitive.SubmenuRoot>
) {
    return <MenuPrimitive.SubmenuRoot {...props} />
}

function DropdownMenuSubTrigger({
    className,
    children,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.SubmenuTrigger>) {
    return (
        <MenuPrimitive.SubmenuTrigger
            className={cn(
                'flex cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-800',
                className
            )}
            {...props}
        >
            {children}
            <ChevronRightIcon className="ml-auto h-4 w-4" />
        </MenuPrimitive.SubmenuTrigger>
    )
}

function DropdownMenuSubContent({
    className,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup>) {
    return (
        <MenuPrimitive.Popup
            className={cn(
                'z-50 min-w-32 overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
                className
            )}
            {...props}
        />
    )
}

function DropdownMenuRadioGroup(
    props: React.ComponentProps<typeof MenuPrimitive.RadioGroup>
) {
    return <MenuPrimitive.RadioGroup {...props} />
}

function DropdownMenuCheckboxItem({
    className,
    children,
    checked,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
    return (
        <MenuPrimitive.CheckboxItem
            checked={checked}
            className={cn(
                'relative flex cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-800',
                className
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <MenuPrimitive.CheckboxItemIndicator>
                    <CheckIcon className="h-4 w-4" />
                </MenuPrimitive.CheckboxItemIndicator>
            </span>
            {children}
        </MenuPrimitive.CheckboxItem>
    )
}

function DropdownMenuRadioItem({
    className,
    children,
    ...props
}: React.ComponentProps<typeof MenuPrimitive.RadioItem>) {
    return (
        <MenuPrimitive.RadioItem
            className={cn(
                'relative flex cursor-default select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-800',
                className
            )}
            {...props}
        >
            {children}
        </MenuPrimitive.RadioItem>
    )
}

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuShortcut,
}
