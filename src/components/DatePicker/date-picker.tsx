'use client'
import { Button } from '../../../components/ui/button'
import { Calendar } from '../../../components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../../../components/ui/popover'
import { cn } from '../../mock/utils'
import { format } from 'date-fns'

interface DatePickerProps {
    date?: Date
    onDateChange: (date?: Date) => void
    placeholder?: string
}

export function DatePicker({
    date,
    onDateChange,
    placeholder = 'Any date',
}: Readonly<DatePickerProps>) {
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <button
                        type="button"
                        className={cn(
                            'text-sm text-left outline-none w-full',
                            !date && 'text-primary'
                        )}
                    >
                        {date ? format(date, 'PPP') : placeholder}
                    </button>
                }
            ></PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={onDateChange}
                    autoFocus
                />
                {date && (
                    <div className="p-2 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => onDateChange(undefined)}
                        >
                            Clear date
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
