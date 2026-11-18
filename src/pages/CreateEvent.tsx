
import {
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
} from 'react'
import {
    ArrowLeft,
    Plus,
    Trash2,
    Upload,
    X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiClient } from '../api/axios'
import { useAuth } from '../context/AuthContext'

type TicketType = {
    id: number
    name: string
    price: string
    quantity: string
}

type EventCategory = {
    value: string
    label: string
}

const categories: EventCategory[] = [
    { value: 'MUSIC', label: 'Music' },
    { value: 'CHURCH', label: 'Church' },
    { value: 'CAMPUS', label: 'Campus' },
    { value: 'TECH_MEETUPS', label: 'Tech & Meetups' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'ARTS_CULTURE', label: 'Arts & Culture' },
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

// Used for city values and ticket type names only.
// Category values must be submitted exactly as selected.
const formatApiValue = (value: string) =>
    value
        .trim()
        .toUpperCase()
        .replace(/&/g, ' AND ')
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_|_$/g, '')

type EditableEvent = {
    id: number | string
    title?: string
    category?: string
    city?: string
    description?: string
    venue?: string
    start_date?: string
    end_date?: string
    status?: string
    banner_image?: string | null
    ticket_types?: Array<{
        id?: number | string
        name?: string
        price?: number | string
        quantity?: number | string
    }>
}



const toDateTimeLocal = (value?: string) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
}

const fromApiCity = (value?: string) => {
    if (!value) return ''
    const normalized = value.trim().toLowerCase().replace(/_/g, ' ')
    return cities.find((city) => city.toLowerCase() === normalized) || value
}

export default function CreateEvent() {
    const navigate = useNavigate()
    const location = useLocation()

    const { user, isInitializing } = useAuth()

    const isOrganizerEnabled = user?.role === 'ORGANIZER'
    const editingEvent = (location.state as { event?: EditableEvent } | null)?.event
    const isEditing = Boolean(editingEvent?.id)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Initialize the form directly from the selected dashboard record.
    // This avoids synchronously setting state inside an effect and prevents
    // an empty form from rendering before the edit data is populated.
    const [title, setTitle] = useState(() => editingEvent?.title ?? '')
    const [category, setCategory] = useState(() => editingEvent?.category ?? '')
    const [city, setCity] = useState(() => fromApiCity(editingEvent?.city))
    const [description, setDescription] = useState(() => editingEvent?.description ?? '')
    const [startDate, setStartDate] = useState(() => toDateTimeLocal(editingEvent?.start_date))
    const [endDate, setEndDate] = useState(() => toDateTimeLocal(editingEvent?.end_date))
    const [venue, setVenue] = useState(() => editingEvent?.venue ?? '')

    const [banner, setBanner] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState(() => editingEvent?.banner_image ?? '')

    const [ticketTypes, setTicketTypes] = useState<TicketType[]>(() => {
        const existingTickets = editingEvent?.ticket_types ?? []
        return existingTickets.length
            ? existingTickets.map((ticket, index) => ({
                id: Number(ticket.id) || index + 1,
                name: ticket.name ?? '',
                price: String(ticket.price ?? ''),
                quantity: String(ticket.quantity ?? ''),
            }))
            : [{ id: 1, name: 'Regular', price: '', quantity: '' }]
    })

    const [message, setMessage] = useState('')
    const [isSaving, setIsSaving] = useState(false)

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


    const dateComplete =
        startDate !== '' &&
        endDate !== '' &&
        venue.trim() !== '' &&
        new Date(endDate) > new Date(startDate)

    const isFormComplete =
        title.trim() !== '' &&
        category !== '' &&
        city !== '' &&
        description.trim() !== '' &&
        dateComplete &&
        validTicketTypes &&
        totalTickets > 0

    // Publishing requires both an enabled organizer account and a complete form.
   const canPublish =
    !isInitializing &&
    isOrganizerEnabled &&
    isFormComplete

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

    const buildCreateFormData = () => {
    const formData = new FormData()

    formData.append('title', title.trim())
    formData.append('category', category)
    formData.append('city', formatApiValue(city))
    formData.append('description', description.trim())
    formData.append('venue', venue.trim())
    formData.append('start_date', new Date(startDate).toISOString())
    formData.append('end_date', new Date(endDate).toISOString())

    if (banner) {
        formData.append('banner_image', banner, banner.name)
    }

    formData.append(
        'ticket_types',
        JSON.stringify(
            ticketTypes.map((ticket) => ({
                name: ticket.name.trim().toUpperCase(),
                price: Number(ticket.price),
                quantity: Number(ticket.quantity),
            })),
        ),
    )

    return formData
}

const buildCreatePayload = () => ({
    title: title.trim(),
    category,
    city: formatApiValue(city),
    description: description.trim(),
    venue: venue.trim(),
    start_date: new Date(startDate).toISOString(),
    end_date: new Date(endDate).toISOString(),
    ticket_types: ticketTypes.map(ticket => ({
        name: ticket.name.trim().toUpperCase(),
        price: Number(ticket.price),
        quantity: Number(ticket.quantity),
    })),
})


const buildUpdateFormData = () => {
    const formData = new FormData()

    formData.append('title', title.trim())
    formData.append('category', category)
    formData.append('city', formatApiValue(city))
    formData.append('description', description.trim())
    formData.append('venue', venue.trim())
    formData.append('start_date', new Date(startDate).toISOString())
    formData.append('end_date', new Date(endDate).toISOString())

    if (banner) {
        formData.append('banner_image', banner, banner.name)
    }

    return formData
}

    const getApiErrorMessage = (error: unknown, fallback: string) => {
        if (typeof error !== 'object' || error === null) return fallback
        const apiError = error as {
            response?: { data?: { detail?: string; message?: string; error?: string } }
            message?: string
        }
        return apiError.response?.data?.detail
            || apiError.response?.data?.message
            || apiError.response?.data?.error
            || apiError.message
            || fallback
    }

    const handleSubmit = async (publish: boolean) => {
    setMessage('')

    if (isInitializing) {
        setMessage('Please wait while your account is being verified.')
        return
    }

    if (publish && !isOrganizerEnabled) {
        setMessage('Only users with an ORGANIZER role can publish events.')
        return
    }

    if (!title.trim() || !category || !city || !description.trim()) {
        setMessage('Please complete all required event details.')
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

    if (publish && !isFormComplete) {
        setMessage(
            'Please complete all required event details before publishing.',
        )
        return
    }

    setIsSaving(true)

    try {
        if (isEditing) {
            // Update existing event.
            // EventUpdateSerializer does not accept ticket_types.
            await apiClient.patch(
                `/events/${editingEvent!.id}/update/`,
                buildUpdateFormData(),
            )

            if (publish) {
                const status = editingEvent?.status?.toUpperCase()

                if (status !== 'DRAFT') {
                    setMessage(
                        'Your event details have been updated. This event is not a draft, so it cannot be published again.',
                    )
                    return
                }

                await apiClient.post(
                    `/events/${editingEvent!.id}/publish/`,
                )

                setMessage('Your event has been published successfully.')
            } else {
                setMessage('Your event has been updated successfully.')
            }
        } else {
            if (!publish) {
                setMessage(
                    'New drafts are currently saved locally. They have not been created on the server.',
                )
                return
            }

            // Create event using EventSerializer.
            // This request includes ticket_types.
            if (banner) {
    await apiClient.post(
        '/events/create/',
        buildCreateFormData()
    )
} else {
    await apiClient.post(
        '/events/create/',
        buildCreatePayload()
    )
}

            setMessage('Your event has been published successfully.')
        }

        navigate(-1)
    } catch (error: unknown) {
        console.error('Event submission failed:', error)

        setMessage(
            getApiErrorMessage(
                error,
                publish
                    ? 'Unable to publish your event. Please try again.'
                    : 'Unable to update your event. Please try again.',
            ),
        )
    } finally {
        setIsSaving(false)
    }
}

    

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
                                {isEditing ? 'Edit event' : 'Create event'}
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
                            {isEditing ? 'SAVE DRAFT' : 'SAVE DRAFT'}
                        </button>

                        <button
                            type="button"
                            disabled={isSaving || !canPublish}
                            onClick={() => handleSubmit(true)}
                            className="rounded-md bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSaving ? (isEditing ? 'UPDATING...' : 'PUBLISHING...') : 'PUBLISH'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {!isInitializing && !isOrganizerEnabled && (
                    <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        Your organizer account is not enabled yet. You can complete
                        the form and save a draft, but publishing will remain
                        disabled until your account is enabled.
                    </div>
                )}

                {message && (
                    <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
                        <span>{message}</span>
                        <button
                            type="button"
                            onClick={() => setMessage('')}
                            aria-label="Dismiss message"
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
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.label}
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
                                        {banner?.name} · This image will be uploaded when you publish.
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
                    </div>
                </div>
            </div>
        </main>
    )
}
