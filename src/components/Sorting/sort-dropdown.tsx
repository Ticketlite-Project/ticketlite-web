import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

export type SortOption = 'soonest' | 'latest' | 'price-low' | 'price-high'

const SORT_LABELS: Record<SortOption, string> = {
    soonest: 'Soonest first',
    latest: 'Latest first',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
}

interface SortDropdownProps {
    totalCount: number
    visibleCount: number
    sortBy: SortOption
    onSortChange: (value: SortOption) => void
}

export function SortDropdown({
    totalCount,
    visibleCount,
    sortBy,
    onSortChange,
}: Readonly<SortDropdownProps>) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-muted-foreground whitespace-nowrap">
                Showing{' '}
                <span className="font-bold text-foreground">
                    {visibleCount}
                </span>{' '}
                of {totalCount}
            </span>

            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 h-9 px-3 font-normal text-muted-foreground w-full sm:w-auto justify-between sm:justify-start"
                        >
                            <span>Sort</span>
                            <span className="font-bold text-foreground">
                                {SORT_LABELS[sortBy]}
                            </span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground opacity-50 shrink-0" />
                        </Button>
                    }
                ></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-50">
                    <DropdownMenuRadioGroup
                        value={sortBy}
                        onValueChange={(val) => onSortChange(val as SortOption)}
                    >
                        <DropdownMenuRadioItem value="soonest">
                            Soonest first
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="latest">
                            Latest first
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price-low">
                            Price: Low to High
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price-high">
                            Price: High to Low
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
