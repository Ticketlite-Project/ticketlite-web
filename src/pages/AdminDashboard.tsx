import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { useCallback, useMemo, useState } from 'react'
import { apiClient } from '../api/axios'
import { CustomButton } from '../components/Button/custom-button'

type OrganiserStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

type OrganiserRequest = {
    id: number | string
    organization_name: string
    reason: string
    status: OrganiserStatus
    created_at: string
}

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
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
}

const formatDate = (date: string) => {
    if (!date) return '—'

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) return '—'

    return parsedDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const extractApplications = (response: unknown): OrganiserRequest[] => {
    if (Array.isArray(response)) {
        return response as OrganiserRequest[]
    }

    if (!response || typeof response !== 'object') {
        return []
    }

    const result = response as {
        applications?: OrganiserRequest[]
        results?: OrganiserRequest[]
        data?: OrganiserRequest[]
        application?: OrganiserRequest
    }

    if (Array.isArray(result.applications)) {
        return result.applications
    }

    if (Array.isArray(result.results)) {
        return result.results
    }

    if (Array.isArray(result.data)) {
        return result.data
    }

    if (result.application) {
        return [result.application]
    }

    return []
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<OrganiserStatus>('PENDING')
    const [sorting, setSorting] = useState<SortingState>([])
    const [notice, setNotice] = useState('')
    const [reviewingId, setReviewingId] = useState<string | null>(null)
    const queryClient = useQueryClient()

    // Fetch organizer applications
    const {
        data: applications = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['organizer-applications'],
        queryFn: async () => {
            const response = await apiClient.get(
                '/auth/admin/organizer-applications'
            )
            return extractApplications(response.data)
        },
    })

    const reviewMutation = useMutation({
        mutationFn: async ({
            id,
            newStatus,
        }: {
            id: number | string
            newStatus: OrganiserStatus
        }) => {
            await apiClient.patch(
                `/auth/admin/organizer-applications/${id}/review`,
                {
                    status: newStatus,
                }
            )
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['organizer-applications'],
            })
            setNotice(
                `Organizer application ${variables.newStatus.toLowerCase()} successfully`
            )
        },
        onError: (err) => {
            console.error('Failed to review organizer applications: ', err)
        },
        onSettled: () => {
            setReviewingId(null)
        },
    })

    // Approve or reject an application
    const handleStatusChange = useCallback(
        (id: number | string, newStatus: OrganiserStatus) => {
            const confirmed = window.confirm(
                `Are you sure you want to ${newStatus.toLowerCase()} this organizer application?`
            )
            if (!confirmed) return

            setReviewingId(String(id))
            setNotice('')
            reviewMutation.mutate({ id, newStatus })
        },
        [reviewMutation]
    )

    const filteredData = useMemo(
        () => applications.filter((item) => item.status === activeTab),
        [applications, activeTab]
    )

    const pendingCount = useMemo(
        () => applications.filter((item) => item.status === 'PENDING').length,
        [applications]
    )

    const approvedCount = useMemo(
        () => applications.filter((item) => item.status === 'APPROVED').length,
        [applications]
    )

    const rejectedCount = useMemo(
        () => applications.filter((item) => item.status === 'REJECTED').length,
        [applications]
    )

    const columns = useMemo(
        () =>
            columnHelper.columns([
                columnHelper.accessor('organization_name', {
                    header: 'ORGANISER',
                    cell: (info) => {
                        const name = info.getValue() || 'Unnamed organisation'
                        const initials = getInitials(name)

                        return (
                            <div className="flex items-center gap-3 py-1">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    {initials || 'O'}
                                </div>

                                <div className="flex min-w-0 flex-col">
                                    <span className="font-bold text-foreground">
                                        {name}
                                    </span>
                                    <span className="max-w-xs truncate text-xs text-muted-foreground">
                                        {info.row.original.reason ||
                                            'No reason provided'}
                                    </span>
                                </div>
                            </div>
                        )
                    },
                }),

                columnHelper.accessor('created_at', {
                    header: 'APPLIED',
                    cell: (info) => (
                        <span className="text-sm text-muted-foreground">
                            {formatDate(info.getValue())}
                        </span>
                    ),
                }),

                columnHelper.accessor('reason', {
                    header: 'DRAFT',
                    cell: () => (
                        <span className="block max-w-sm text-sm text-muted-foreground"></span>
                    ),
                }),

                columnHelper.accessor('status', {
                    header: 'STATUS',
                    cell: (info) => {
                        const status = info.getValue()

                        return (
                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                    status === 'APPROVED'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : status === 'REJECTED'
                                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                            >
                                {status}
                            </span>
                        )
                    },
                }),

                columnHelper.display({
                    id: 'actions',
                    header: () => <div className="text-right">DECISION</div>,
                    cell: ({ row }) => {
                        const item = row.original
                        const isReviewing = reviewingId === String(item.id)

                        return (
                            <div className="flex items-center justify-end gap-2">
                                {item.status !== 'REJECTED' && (
                                    <CustomButton
                                        variant="secondary"
                                        size="sm"
                                        bordered
                                        rounded
                                        disabled={isReviewing}
                                        onClick={() =>
                                            handleStatusChange(
                                                item.id,
                                                'REJECTED'
                                            )
                                        }
                                        className="border-gray-100 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:bg-transparent dark:text-red-400"
                                    >
                                        {isReviewing
                                            ? 'Please wait...'
                                            : 'Reject'}
                                    </CustomButton>
                                )}

                                {item.status !== 'APPROVED' && (
                                    <CustomButton
                                        variant="primary"
                                        size="sm"
                                        disabled={isReviewing}
                                        onClick={() =>
                                            handleStatusChange(
                                                item.id,
                                                'APPROVED'
                                            )
                                        }
                                    >
                                        {isReviewing
                                            ? 'Please wait...'
                                            : 'Approve'}
                                    </CustomButton>
                                )}
                            </div>
                        )
                    },
                }),
            ]),
        [reviewingId, activeTab]
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
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                ORGANISER REQUESTS
            </span>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground md:text-4xl">
                Approve organisers
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Only approved organisers can publish events. Check that each
                request looks like a real person or group before approving.
            </p>

            {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    Unable to load organizer applications. Please try again {''}
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="ml-2 font-bold underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {reviewMutation.isError && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    Failed to update this application. Please try again.
                </div>
            )}

            {notice && (
                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                    {notice}
                </div>
            )}

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

            {/* Table */}
            <div className="mt-6 overflow-x-auto rounded-lg border bg-card shadow-sm">
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center text-sm text-muted-foreground"
                                >
                                    Loading organizer applications...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length ? (
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
                                    No {activeTab.toLowerCase()} applications
                                    found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
