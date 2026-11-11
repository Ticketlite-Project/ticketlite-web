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
    coreRowModelsFeature,
    createColumnHelper,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    rowPaginationFeature,
    rowSortingFeature,
    tableFeatures,
    useTable,
    type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { CustomButton } from '../components/Button/custom-button'
import {
    mockOrganisers,
    type OrganiserRequest,
    type OrganiserStatus,
} from '../mock/mock-user'

const adminTableFeatures = tableFeatures({
    columnFilteringFeature,
    coreRowModelsFeature,
    rowSortingFeature,
    rowPaginationFeature,
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
})

const columnHelper = createColumnHelper<
    typeof adminTableFeatures,
    OrganiserRequest
>()

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
}

export default function AdminDashboard() {
    const [data, setData] = useState<OrganiserRequest[]>(mockOrganisers)
    const [activeTab, setActiveTab] = useState<OrganiserStatus>('PENDING')
    const [sorting, setSorting] = useState<SortingState>([])

    const handleStatusChange = (id: string, newStatus: OrganiserStatus) => {
        setData((currentData) =>
            currentData.map((item) =>
                item.id === id ? { ...item, status: newStatus } : item
            )
        )
    }

    // Filter table data based on active tab
    const filteredData = useMemo(() => {
        return data.filter((item) => item.status === activeTab)
    }, [data, activeTab])

    // Count statistics for tab badges
    const pendingCount = useMemo(
        () => data.filter((item) => item.status === 'PENDING').length,
        [data]
    )
    const approvedCount = useMemo(
        () => data.filter((item) => item.status === 'APPROVED').length,
        [data]
    )
    const rejectedCount = useMemo(
        () => data.filter((item) => item.status === 'REJECTED').length,
        [data]
    )

    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.accessor('name', {
                    header: 'ORGANISER',
                    cell: (info) => {
                        const name = info.getValue()
                        const category = info.row.original.category
                        const initials = getInitials(name)
                        return (
                            <div className="flex items-center gap-3 py-1">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    {initials}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-foreground">
                                        {name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {category}
                                    </span>
                                </div>
                            </div>
                        )
                    },
                }),
                columnHelper.accessor('contactName', {
                    header: 'CONTACT',
                    cell: (info) => {
                        const contact = info.getValue()
                        const email = info.row.original.email
                        return (
                            <div className="flex flex-col">
                                <span className="font-medium text-foreground">
                                    {contact}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {email}
                                </span>
                            </div>
                        )
                    },
                }),
                columnHelper.accessor('appliedDate', {
                    header: 'APPLIED',
                    cell: (info) => (
                        <span className="text-sm text-muted-foreground">
                            {info.getValue()}
                        </span>
                    ),
                }),
                columnHelper.accessor('drafts', {
                    header: 'DRAFTS',
                    cell: (info) => (
                        <span className="text-sm text-muted-foreground">
                            {info.getValue()}
                        </span>
                    ),
                }),
                columnHelper.display({
                    id: 'actions',
                    header: () => <div className="text-right">DECISION</div>,
                    cell: ({ row }) => {
                        const item = row.original
                        return (
                            <div className="flex items-center justify-end gap-2">
                                {activeTab !== 'REJECTED' && (
                                    <CustomButton
                                        variant="secondary"
                                        size="sm"
                                        bordered
                                        rounded
                                        onClick={() =>
                                            handleStatusChange(
                                                item.id,
                                                'REJECTED'
                                            )
                                        }
                                        className=" text-red-600 hover:bg-red-50 border-gray-100  dark:border-red-900/50 dark:bg-transparent dark:text-red-400"
                                    >
                                        Reject
                                    </CustomButton>
                                )}
                                {activeTab !== 'APPROVED' && (
                                    <CustomButton
                                        variant="primary"
                                        size="sm"
                                        onClick={() =>
                                            handleStatusChange(
                                                item.id,
                                                'APPROVED'
                                            )
                                        }
                                    >
                                        Approve
                                    </CustomButton>
                                )}
                            </div>
                        )
                    },
                }),
            ]),
        [activeTab]
    )

    const table = useTable(
        {
            features: adminTableFeatures,
            data: filteredData,
            columns,
            state: {
                sorting,
            },
            onSortingChange: setSorting,
        },
        (state) => ({
            sorting: state.sorting,
        })
    )

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
            {/* Sub-header */}
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                ORGANISER REQUESTS
            </span>

            {/* Page Heading */}
            <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground md:text-4xl">
                Approve organisers
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Only approved organisers can publish events. Check that each
                request looks like a real person or group before approving.
            </p>

            {/* Status Tabs */}
            <div className="mt-8 flex items-center gap-6 border-b pb-3">
                <button
                    type="button"
                    onClick={() => setActiveTab('PENDING')}
                    className={`relative flex items-center gap-2 pb-1 text-sm font-bold transition-colors ${
                        activeTab === 'PENDING'
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Pending{''}
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-xs font-bold text-white">
                        {pendingCount}
                    </span>
                    {activeTab === 'PENDING' && (
                        <span className="absolute -bottom-3.5 left-0 right-0 h-0.75 rounded-t bg-emerald-700" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('APPROVED')}
                    className={`relative flex items-center gap-2 pb-1 text-sm font-bold transition-colors ${
                        activeTab === 'APPROVED'
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Approved
                    {approvedCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-bold text-muted-foreground">
                            {approvedCount}
                        </span>
                    )}
                    {activeTab === 'APPROVED' && (
                        <span className="absolute -bottom-3.5 left-0 right-0 h-0.75 rounded-t bg-emerald-700" />
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('REJECTED')}
                    className={`relative flex items-center gap-2 pb-1 text-sm font-bold transition-colors ${
                        activeTab === 'REJECTED'
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Rejected
                    {rejectedCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-bold text-muted-foreground">
                            {rejectedCount}
                        </span>
                    )}
                    {activeTab === 'REJECTED' && (
                        <span className="absolute -bottom-3.5 left-0 right-0 h-0.75 rounded-t bg-emerald-700" />
                    )}
                </button>
            </div>

            {/* Table Container */}
            <div className="mt-6 rounded-lg border bg-card shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/30">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground"
                                    >
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
                                    className="h-32 text-center text-sm text-muted-foreground"
                                >
                                    No {activeTab.toLowerCase()} requests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
