'use client'

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '../../../components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../../../components/ui/popover'
import { DatePicker } from '../../components/DatePicker/date-picker'

import { ghanaCities } from '../../mock/ghana-cities'
import { cn } from '../../mock/utils'
import { Check, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import { CustomButton } from '../Button/custom-button'

export interface EventSearchParams {
    search: string
    city: string | null
    date: Date | null
}

export interface Event {
    id: string
    name: string
    city: string
    date: string
    [key: string]: unknown
}

interface EventSearchBarProps {
    onSearch?: (params: EventSearchParams) => void
    initialValues?: Partial<EventSearchParams>
}

export function EventSearchBar({
    onSearch,
    initialValues,
}: Readonly<EventSearchBarProps>) {
    const [search, setSearch] = useState(initialValues?.search ?? '')
    const [city, setCity] = useState<string | null>(initialValues?.city ?? null)
    const [date, setDate] = useState<Date | null>(initialValues?.date ?? null)
    const [cityOpen, setCityOpen] = useState(false)

    const handleSearch = () => {
        const params: EventSearchParams = {
            search: search.trim(),
            city,
            date,
        }
        onSearch?.(params)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch()
    }

    return (
        <div className="flex flex-col md:flex-row max-w-4xl mb-6">
            {/* Search input */}
            <div className="bg-background flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-primary-200">
                <label
                    htmlFor="search"
                    className="text-xs font-bold text-primary block mb-1"
                >
                    Search events
                </label>
                <input
                    type="text"
                    id="search"
                    value={search}
                    onChange={(e) => {
                        const nextSearch = e.target.value
                        setSearch(nextSearch)
                        onSearch?.({
                            search: nextSearch,
                            city,
                            date,
                        })
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Event name, artist or organiser"
                    className="w-full text-primary outline-none placeholder:text-primary text-sm"
                />
            </div>

            {/* City picker */}
            <div className="bg-background flex-1 px-4 py-2 border-b md:border-b-0 md:border-r border-primary-200">
                <label
                    htmlFor="city"
                    className="text-xs font-bold text-primary block mb-1"
                >
                    City
                </label>
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger
                        render={
                            <button
                                type="button"
                                className="flex justify-between items-center w-full cursor-pointer text-primary-900 outline-none placeholder:text-primary-400 text-sm"
                            >
                                <span className="text-primary outline-none placeholder:text-primary text-sm">
                                    {city ?? 'Anywhere in Ghana'}
                                </span>
                                <ChevronDown className="w-5 h-5 text-primary" />
                            </button>
                        }
                    ></PopoverTrigger>
                    <PopoverContent className="w-64 p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Search city..." />
                            <CommandList>
                                <CommandEmpty>No city found.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                        value="anywhere"
                                        onSelect={() => {
                                            setCity(null)
                                            setCityOpen(false)
                                            onSearch?.({
                                                search,
                                                city: null,
                                                date,
                                            })
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                city === null
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            )}
                                        />
                                        Anywhere in Ghana
                                    </CommandItem>
                                    {ghanaCities.map((c) => (
                                        <CommandItem
                                            key={c}
                                            value={c}
                                            onSelect={() => {
                                                setCity(c)
                                                setCityOpen(false)
                                                onSearch?.({
                                                    search,
                                                    city: c,
                                                    date,
                                                })
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    city === c
                                                        ? 'opacity-100'
                                                        : 'opacity-0'
                                                )}
                                            />
                                            {c}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Date picker */}
            <div className="bg-background flex-1 px-4 py-2 flex justify-between items-center">
                <div className="w-full">
                    <label
                        htmlFor="date"
                        className="text-xs font-bold text-primary block mb-1"
                    >
                        Date
                    </label>
                    <DatePicker
                        date={date ?? undefined}
                        onDateChange={(d) => {
                            setDate(d ?? null)
                            onSearch?.({ search, city, date: d ?? null })
                        }}
                    />
                </div>
                <ChevronDown className="w-5 h-5 text-primary pointer-events-none" />
            </div>
            {/* Search button */}
            <CustomButton
                variant="primary"
                bordered
                onClick={handleSearch}
                icon={<Search />}
                className="md:self-stretch md:h-auto rounded-none px-6 border-primary-400"
            >
                Search
            </CustomButton>
        </div>
    )
}
