import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    columnFilteringFeature,
    createColumnHelper,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    globalFilteringFeature,
    rowPaginationFeature,
    rowSortingFeature,
    tableFeatures,
    type SortingState,
    useTable,
} from '@tanstack/react-table'
import { MoreHorizontal, Search, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { initialUsers } from '../mock/mock-user'
import type { User, UserRole } from '../types/auth'

const adminTableFeatures = tableFeatures({
    columnFilteringFeature,
    globalFilteringFeature,
    rowSortingFeature,
    rowPaginationFeature,
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
})

const columnHelper = createColumnHelper<typeof adminTableFeatures, User>()

const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
        case 'ADMIN':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
        case 'ORGANIZER':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
        case 'GATE_STAFF':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
        default:
            return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
    }
}

export default function AdminDashboard() {
    const [data, setData] = useState<User[]>(initialUsers)
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.accessor(
                    (user) => `${user.first_name} ${user.last_name}`,
                    {
                        id: 'name',
                        header: 'Name',
                        cell: (info) => (
                            <div className="font-medium">{info.getValue()}</div>
                        ),
                    }
                ),
                columnHelper.accessor('username', {
                    header: 'Username',
                }),
                columnHelper.accessor('email', {
                    header: 'Email',
                }),
                columnHelper.accessor('role', {
                    header: 'Role',
                    cell: (info) => {
                        const role = info.getValue()
                        return (
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getRoleBadgeClass(role)}`}
                            >
                                {role}
                            </span>
                        )
                    },
                }),
                columnHelper.display({
                    id: 'actions',
                    cell: ({ row }) => {
                        const user = row.original
                        return (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                        >
                                            <span className="sr-only">
                                                Open menu
                                            </span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                        Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            alert(
                                                `Edit role for ${user.username}`
                                            )
                                        }
                                    >
                                        Change Role
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() =>
                                            setData((currentData) =>
                                                currentData.filter(
                                                    (currentUser) =>
                                                        currentUser.id !==
                                                        user.id
                                                )
                                            )
                                        }
                                    >
                                        Remove User
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                    },
                }),
            ]),
        [setData]
    )

    const table = useTable(
        {
            features: adminTableFeatures,
            data,
            columns,
            state: {
                sorting,
                globalFilter,
            },
            onSortingChange: setSorting,
            onGlobalFilterChange: setGlobalFilter,
        },
        (state) => ({
            sorting: state.sorting,
            globalFilter: state.globalFilter,
        })
    )

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" /> Admin
                        Control Panel
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage user accounts, system roles, and platform
                        permissions.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-9 w-[250px]"
                        />
                    </div>
                </div>
            </div>

            {/* TanStack Table wrapped with Shadcn UI components */}
            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : (
                                            <table.FlexRender header={header} />
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getAllCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            <table.FlexRender cell={cell} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
