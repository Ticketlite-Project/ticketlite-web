
import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
    ArrowLeft,
    Check,
    CircleAlert,
    Plus,
    Trash2,
    Upload,
    X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/axios'

type TicketType = {
    id: number
    name: string
    price: string
    quantity: string
}

const categories = [
    'Music',
    'Church',
    'Tech & meetups',
    'Campus',
    'Arts & Culture',
    'Sports',
]

const cities = [
    'Accra',
    'Kumasi',
    'Cape Coast',
    'Tamale',
    'Takoradi',
    'Koforidua',
    'Other',
]

const formatApiValue = (value: string) =>
    value
        .trim()
        .toUpperCase()
        .replace(/&/g, ' AND ')
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_|_$/g, '')

export default function CreateEvent() {
    const navigate = useNavigate()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('')
    const [city, setCity] = useState('')
    const [description, setDescription] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [venue, setVenue] = useState('')

    const [banner, setBanner] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState('')

    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
        { id: 1, name: 'Regular', price: '', quantity: '' },
    ])

    const [message, setMessage] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const isSuccessMessage = message.startsWith('SUCCESS:')
    const isInfoMessage = message.startsWith('INFO:')

    const totalTickets = useMemo(
        () =>
            ticketTypes.reduce(
                (total, ticket) =>
                    total + (Number(ticket.quantity) || 0),
                0,
            ),
        [ticketTypes],
    )

    const validTicketTypes = ticketTypes.every(
        (ticket) =>
            ticket.name.trim() !== '' &&
            ticket.price.trim() !== '' &&
            Number.isFinite(Number(ticket.price)) &&
            Number(ticket.price) >= 0 &&
            ticket.quantity.trim() !== '' &&
            Number.isInteger(Number(ticket.quantity)) &&
            Number(ticket.quantity) > 0,
    )

    const basicsComplete =
        title.trim() !== '' && category !== ''

    const dateComplete =
        startDate !== '' &&
        endDate !== '' &&
        venue.trim() !== '' &&
        new Date(endDate) > new Date(startDate)

    // The banner image is optional.
    const isFormComplete =
        title.trim() !== '' &&
        category !== '' &&
        city !== '' &&
        description.trim() !== '' &&
        dateComplete &&
        validTicketTypes &&
        totalTickets > 0

    const updateTicket = (
        id: number,
        field: keyof TicketType,
        value: string,
    ) => {
        setTicketTypes((current) =>
            current.map((ticket) =>
                ticket.id === id
                    ? { ...ticket, [field]: value }
                    : ticket,
            ),
        )
    }

    const addTicketType = () => {
        setTicketTypes((current) => [
            ...current,
            {
                id: Date.now(),
                name: '',
                price: '',
                quantity: '',
            },
        ])
    }

    const removeTicketType = (id: number) => {
        if (ticketTypes.length === 1) return

        setTicketTypes((current) =>
            current.filter((ticket) => ticket.id !== id),
        )
    }

    const resetForm = () => {
        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview)
        }

        setTitle('')
        setCategory('')
        setCity('')
        setDescription('')
        setStartDate('')
        setEndDate('')
        setVenue('')

        setBanner(null)
        setBannerPreview('')

        setTicketTypes([
            {
                id: Date.now(),
                name: 'Regular',
                price: '',
                quantity: '',
            },
        ])

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleBannerChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0]

        if (!file) return

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setMessage('Please upload a JPG or PNG image.')
            event.target.value = ''
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage('Your banner image must be 5 MB or smaller.')
            event.target.value = ''
            return
        }

        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview)
        }

        setBanner(file)
        setBannerPreview(URL.createObjectURL(file))
        setMessage('')
    }

    const removeBanner = () => {
        if (bannerPreview) {
            URL.revokeObjectURL(bannerPreview)
        }

        setBanner(null)
        setBannerPreview('')

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (publish: boolean) => {
        setMessage('')

        if (publish && !isFormComplete) {
            setMessage(
                'Please complete all required event details and add at least one valid ticket type before publishing. The banner image is optional.',
            )
            return
        }

        if (!title.trim() || !category) {
            setMessage(
                'Please enter an event title and select a category.',
            )
            return
        }

        if (!dateComplete) {
            setMessage(
                'Please enter valid start and end dates and a venue. The end date must be after the start date.',
            )
            return
        }

        if (!validTicketTypes) {
            setMessage(
                'Please complete the name, price and quantity for every ticket type. Quantity must be a whole number greater than zero.',
            )
            return
        }

        // Save draft locally without publishing it to the backend.
        if (!publish) {
            const eventData = {
                title,
                category,
                city,
                description,
                startDate,
                endDate,
                venue,
                ticketTypes,
                totalTickets,
                status: 'draft',
            }

            setIsSaving(true)

            try {
                const existingDrafts = JSON.parse(
                    localStorage.getItem('ticketlite_event_drafts') || '[]',
                )

                if (!Array.isArray(existingDrafts)) {
                    throw new Error('Invalid saved drafts.')
                }

                localStorage.setItem(
                    'ticketlite_event_drafts',
                    JSON.stringify([
                        ...existingDrafts,
                        {
                            ...eventData,
                            bannerName: banner?.name || '',
                            savedAt: new Date().toISOString(),
                        },
                    ]),
                )

                setMessage(
                    'INFO: Your event has been saved as a draft on this device. It has not been published to the server.',
                )
            } catch {
                setMessage(
                    'Unable to save your draft. Please try again.',
                )
            } finally {
                setIsSaving(false)
            }

            return
        }

        setIsSaving(true)

        try {
            const formData = new FormData()

            formData.append('title', title.trim())
            formData.append('category', formatApiValue(category))
            formData.append('city', formatApiValue(city))
            formData.append('description', description.trim())
            formData.append('venue', venue.trim())
            formData.append(
                'start_date',
                new Date(startDate).toISOString(),
            )
            formData.append(
                'end_date',
                new Date(endDate).toISOString(),
            )

            if (banner) {
                formData.append('banner_image', banner, banner.name)
            }

            // Submit nested ticket fields in multipart form data.
            ticketTypes.forEach((ticket, index) => {
                formData.append(
                    `ticket_types[${index}]name`,
                    formatApiValue(ticket.name),
                )
                formData.append(
                    `ticket_types[${index}]price`,
                    ticket.price.trim(),
                )
                formData.append(
                    `ticket_types[${index}]quantity`,
                    String(Number(ticket.quantity)),
                )
            })

            // Axios sets the multipart boundary automatically.
            await apiClient.post('/events/create/', formData)

            // Reset only after the backend confirms successful publishing.
            resetForm()

            setMessage('SUCCESS: Event published successfully!')
        } catch (error: unknown) {
            console.error('Event creation failed:', error)

            let errorMessage =
                'Unable to publish your event. Please try again.'

            if (typeof error === 'object' && error !== null) {
                const apiError = error as {
                    response?: {
                        data?: {
                            detail?: string
                            message?: string
                            error?: string
                            [key: string]: unknown
                        }
                    }
                    message?: string
                }

                const responseData = apiError.response?.data

                if (responseData?.detail) {
                    errorMessage = responseData.detail
                } else if (responseData?.message) {
                    errorMessage = responseData.message
                } else if (responseData?.error) {
                    errorMessage = responseData.error
                } else if (responseData) {
                    errorMessage = Object.entries(responseData)
                        .map(([field, value]) => {
                            const readableField = field
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (letter) =>
                                    letter.toUpperCase(),
                                )

                            const readableValue = Array.isArray(value)
                                ? value.join(', ')
                                : String(value)

                            return `${readableField}: ${readableValue}`
                        })
                        .join(' | ')
                } else if (apiError.message) {
                    errorMessage = apiError.message
                }
            }

            setMessage(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    const checklist = [
        {
            label: 'Title and category',
            complete: basicsComplete,
            note: basicsComplete ? 'Done' : 'Required',
        },
        {
            label: 'Date, time and venue',
            complete: dateComplete,
            note: dateComplete ? 'Done' : 'Required',
        },
        {
            label: 'Banner image',
            complete: Boolean(banner),
            note: banner ? 'Done' : 'Optional',
        },
        {
            label: 'At least 1 ticket type',
            complete: validTicketTypes && totalTickets > 0,
            note:
                validTicketTypes && totalTickets > 0
                    ? 'Done'
                    : 'Fix ticket details',
        },
    ]

    return (
        <main className="min-h-screen bg-[#f5f5f5] text-gray-900">
            {/* Top navigation */}
            <header className="sticky top-0 z-30 border-b bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 text-left"
                    >
                        <ArrowLeft size={19} />
                        <span>
                            <span className="block text-xs text-gray-500">
                                My events
                            </span>
                            <span className="block text-lg font-bold">
                                Create event
                            </span>
                        </span>
                    </button>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="hidden text-xs text-gray-500 sm:block">
                            Draft · Not published
                        </span>

                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handleSubmit(false)}
                            className="rounded-md border border-emerald-700 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                        >
                            SAVE DRAFT
                        </button>

                        <button
                            type="button"
                            disabled={isSaving || !isFormComplete}
                            onClick={() => handleSubmit(true)}
                            className="rounded-md bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isSaving ? 'PUBLISHING...' : 'PUBLISH'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {/* Notification */}
                {message && (
                    <div
                        role="alert"
                        className={`mb-5 flex items-center justify-between gap-3 rounded-lg border p-4 text-sm ${
                            isSuccessMessage
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : isInfoMessage
                                  ? 'border-blue-200 bg-blue-50 text-blue-800'
                                  : 'border-red-200 bg-red-50 text-red-700'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {isSuccessMessage ? (
                                <Check
                                    size={19}
                                    className="shrink-0 text-emerald-600"
                                />
                            ) : (
                                <CircleAlert
                                    size={19}
                                    className="shrink-0"
                                />
                            )}

                            <span>
                                {message.replace(
                                    /^(SUCCESS: |INFO: )/,
                                    '',
                                )}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setMessage('')}
                            aria-label="Dismiss message"
                            className="shrink-0"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    {/* Main form */}
                    <div className="space-y-5">
                        {/* Basics */}
                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 className="mb-5 text-lg font-bold">
                                Basics
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium">
                                        Event title
                                    </label>
                                    <input
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder="e.g. Campus Jazz Night"
                                        className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium">
                                            Category
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) =>
                                                setCategory(e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600"
                                        >
                                            <option value="">
                                                Select category
                                            </option>
                                            {categories.map((item) => (
                                                <option
                                                    key={item}
                                                    value={item}
                                                >
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium">
                                            City
                                        </label>
                                        <select
                                            value={city}
                                            onChange={(e) =>
                                                setCity(e.target.value)
                                            }
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600"
                                        >
                                            <option value="">
                                                Select city
                                            </option>
                                            {cities.map((item) => (
                                                <option
                                                    key={item}
                                                    value={item}
                                                >
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        rows={4}
                                        placeholder="What should attendees know? Line-up, dress code, what to bring..."
                                        className="w-full resize-y rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Date and venue */}
                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 className="mb-5 text-lg font-bold">
                                When and where
                            </h2>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium">
                                        Starts
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-medium">
                                        Ends
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        min={startDate || undefined}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="mb-1.5 block text-xs font-medium">
                                    Venue
                                </label>
                                <input
                                    value={venue}
                                    onChange={(e) =>
                                        setVenue(e.target.value)
                                    }
                                    placeholder="e.g. Great Hall, KNUST"
                                    className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-emerald-600"
                                />
                            </div>
                        </section>

                        {/* Banner */}
                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 className="mb-4 text-lg font-bold">
                                Banner image
                            </h2>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={handleBannerChange}
                                className="hidden"
                            />

                            {bannerPreview ? (
                                <div className="relative">
                                    <img
                                        src={bannerPreview}
                                        alt="Event banner preview"
                                        className="h-56 w-full rounded-lg object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={removeBanner}
                                        className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
                                        aria-label="Remove banner"
                                    >
                                        <X size={17} />
                                    </button>

                                    <p className="mt-2 text-xs text-gray-500">
                                        {banner?.name} · This image will be
                                        uploaded when you publish.
                                    </p>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="flex min-h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-6 text-center hover:bg-emerald-50"
                                >
                                    <span className="mb-2 rounded-full bg-white p-3 text-emerald-700">
                                        <Upload size={20} />
                                    </span>

                                    <span className="text-sm font-bold">
                                        Upload a banner
                                    </span>

                                    <span className="mt-1 text-xs text-gray-500">
                                        JPG or PNG, at least 1600 × 900 px,
                                        up to 5 MB
                                    </span>
                                </button>
                            )}
                        </section>

                        {/* Ticket types */}
                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <h2 className="text-lg font-bold">
                                    Ticket types
                                </h2>

                                <span className="text-xs text-gray-500">
                                    {totalTickets.toLocaleString()} tickets
                                    in total
                                </span>
                            </div>

                            <div className="space-y-4">
                                {ticketTypes.map((ticket, index) => (
                                    <fieldset
                                        key={ticket.id}
                                        className="rounded-lg border border-gray-200 p-3"
                                    >
                                        <legend className="px-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                                            Ticket type {index + 1}
                                        </legend>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <div>
                                                <label className="mb-1 block text-xs text-gray-600">
                                                    Name
                                                </label>
                                                <input
                                                    value={ticket.name}
                                                    onChange={(e) =>
                                                        updateTicket(
                                                            ticket.id,
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g. Regular"
                                                    className="w-full rounded border border-gray-300 px-2.5 py-2.5 text-sm outline-none focus:border-emerald-600"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs text-gray-600">
                                                    Price (GHS)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={ticket.price}
                                                    onChange={(e) =>
                                                        updateTicket(
                                                            ticket.id,
                                                            'price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="40.00"
                                                    className="w-full rounded border border-gray-300 px-2.5 py-2.5 text-sm outline-none focus:border-emerald-600"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs text-gray-600">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={ticket.quantity}
                                                    onChange={(e) =>
                                                        updateTicket(
                                                            ticket.id,
                                                            'quantity',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g. 100"
                                                    className="w-full rounded border border-gray-300 px-2.5 py-2.5 text-sm outline-none focus:border-emerald-600"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-3 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeTicketType(ticket.id)
                                                }
                                                disabled={
                                                    ticketTypes.length === 1
                                                }
                                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                <Trash2 size={14} />
                                                Remove ticket type
                                            </button>
                                        </div>
                                    </fieldset>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addTicketType}
                                className="mt-4 flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                            >
                                <Plus size={15} />
                                Add ticket type
                            </button>
                        </section>

                        {/* Bottom actions */}
                        <div className="flex flex-wrap justify-end gap-3 pb-6">
                            <button
                                type="button"
                                onClick={() => handleSubmit(false)}
                                disabled={isSaving}
                                className="rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
                            >
                                Save draft
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSubmit(true)}
                                disabled={isSaving || !isFormComplete}
                                className="rounded-md bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isSaving ? 'Publishing...' : 'Publish event'}
                            </button>
                        </div>
                    </div>

                    {/* Publishing checklist */}
                    <aside className="space-y-4 lg:sticky lg:top-24">
                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h2 className="mb-4 text-base font-bold">
                                Before you publish
                            </h2>

                            <div className="divide-y divide-gray-100">
                                {checklist.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center justify-between gap-3 py-3"
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            {item.complete ? (
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white">
                                                    <Check size={12} />
                                                </span>
                                            ) : (
                                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                                                    <CircleAlert size={12} />
                                                </span>
                                            )}

                                            <span className="text-xs font-medium">
                                                {item.label}
                                            </span>
                                        </div>

                                        <span className="shrink-0 text-[11px] text-gray-500">
                                            {item.note}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <p className="mt-4 text-xs leading-relaxed text-gray-500">
                                Published events appear on the public listing.
                                You can still edit event details after
                                publishing, but not lower a ticket quantity
                                below what has already sold.
                            </p>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <h3 className="mb-2 text-sm font-bold">
                                Need help?
                            </h3>

                            <p className="text-xs leading-relaxed text-gray-500">
                                Make sure your event information, venue and
                                ticket prices are correct before publishing.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    )
}
