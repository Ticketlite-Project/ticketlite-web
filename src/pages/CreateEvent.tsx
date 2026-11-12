
import { useMemo, useRef, useState } from 'react'
import {
    ArrowLeft,
    Info,
    Plus,
    Trash2,
    Upload,
    X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type TicketType = {
    id: number
    name: string
    price: string
    quantity: string
}

const categories = [
    'Music',
    'Business',
    'Technology',
    'Education',
    'Arts & Culture',
    'Sports',
    'Food & Drink',
    'Other',
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
    const [organiserApproved] = useState(false)
    const [message, setMessage] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const totalTickets = useMemo(
        () =>
            ticketTypes.reduce(
                (total, ticket) => total + (Number(ticket.quantity) || 0),
                0,
            ),
        [ticketTypes],
    )

    const validTicketTypes = ticketTypes.every(
        (ticket) =>
            ticket.name.trim() !== '' &&
            ticket.price.trim() !== '' &&
            Number(ticket.price) >= 0 &&
            ticket.quantity.trim() !== '' &&
            Number(ticket.quantity) > 0,
    )

    // const basicsComplete =
    //     title.trim() !== '' && category !== ''

    const dateComplete =
        startDate !== '' &&
        endDate !== '' &&
        venue.trim() !== '' &&
        new Date(endDate) > new Date(startDate)

    // const canPublish =
    //     basicsComplete &&
    //     dateComplete &&
    //     validTicketTypes &&
    //     organiserApproved

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
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0]

        if (!file) return

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setMessage('Please upload a JPG or PNG image.')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage('Your banner image must be 5 MB or smaller.')
            return
        }

        setBanner(file)
        setBannerPreview(URL.createObjectURL(file))
        setMessage('')
    }

    const handleSubmit = async (publish: boolean) => {
        setMessage('')

        if (!title.trim() || !category) {
            setMessage('Please enter an event title and select a category.')
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
                'Please complete the name, price and quantity for every ticket type.',
            )
            return
        }

        if (publish && !organiserApproved) {
            setMessage(
                'Your organiser account must be approved before you can publish. You can still save your event as a draft.',
            )
            return
        }

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
            status: publish ? 'published' : 'draft',
        }

        setIsSaving(true)

        try {
            // Frontend draft storage only.
            // Connect this to your backend API to save events permanently.
            const existingDrafts = JSON.parse(
                localStorage.getItem('ticketlite_event_drafts') || '[]',
            )

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
                publish
                    ? 'Event published successfully.'
                    : 'Your event has been saved as a draft.',
            )
        } catch {
            setMessage('Unable to save your event. Please try again.')
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
                            disabled={isSaving}
                            onClick={() => handleSubmit(true)}
                            className="rounded-md bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-700 disabled:opacity-50"
                        >
                            PUBLISH
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {/* Approval notice */}
                {!organiserApproved && (
                    <div className="mb-6 flex gap-3 rounded-lg border border-lime-200 bg-lime-100 p-4">
                        <Info className="mt-0.5 shrink-0 text-emerald-700" size={18} />
                        <div>
                            <p className="text-sm font-bold">
                                Your organiser account is waiting for approval
                            </p>
                            <p className="text-xs text-gray-600">
                                Keep building your event as a draft. You can
                                publish it as soon as our team approves your account.
                            </p>
                        </div>
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
                            <h2 className="mb-5 text-lg font-bold">Basics</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium">
                                        Event title
                                    </label>
                                    <input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
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
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((item) => (
                                                <option key={item} value={item}>
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
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600"
                                        >
                                            <option value="">Select city</option>
                                            {cities.map((item) => (
                                                <option key={item} value={item}>
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
                                        onChange={(e) => setDescription(e.target.value)}
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
                                        onChange={(e) => setStartDate(e.target.value)}
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
                                        onChange={(e) => setEndDate(e.target.value)}
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
                                    onChange={(e) => setVenue(e.target.value)}
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
                                        onClick={() => {
                                            setBanner(null)
                                            setBannerPreview('')
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = ''
                                            }
                                        }}
                                        className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
                                        aria-label="Remove banner"
                                    >
                                        <X size={17} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex min-h-40 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-6 text-center hover:bg-emerald-50"
                                >
                                    <span className="mb-2 rounded-full bg-white p-3 text-emerald-700">
                                        <Upload size={20} />
                                    </span>
                                    <span className="text-sm font-bold">
                                        Upload a banner
                                    </span>
                                    <span className="mt-1 text-xs text-gray-500">
                                        JPG or PNG, at least 1600 × 900 px, up to 5 MB
                                    </span>
                                </button>
                            )}
                        </section>

                        {/* Ticket types */}
                        <section className="rounded-lg border border-gray-200 bg-white p-5">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <h2 className="text-lg font-bold">Ticket types</h2>
                                <span className="text-xs text-gray-500">
                                    {totalTickets.toLocaleString()} tickets in total
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
                                                        updateTicket(ticket.id, 'name', e.target.value)
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
                                                        updateTicket(ticket.id, 'price', e.target.value)
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
                                                        updateTicket(ticket.id, 'quantity', e.target.value)
                                                    }
                                                    placeholder="e.g. 100"
                                                    className="w-full rounded border border-gray-300 px-2.5 py-2.5 text-sm outline-none focus:border-emerald-600"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-3 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeTicketType(ticket.id)}
                                                disabled={ticketTypes.length === 1}
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
