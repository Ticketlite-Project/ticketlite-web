
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    Check,
    AlertTriangle,
    X,
    RefreshCw,
    Camera,
    ScanLine,
} from 'lucide-react'
import {
    Html5Qrcode,
    Html5QrcodeSupportedFormats,
} from 'html5-qrcode'
import { AxiosError } from 'axios'
import { apiClient } from '@/src/api/axios'

type ScanResult = {
    type: 'valid' | 'already_used' | 'invalid'
    message: string
    ticketCode: string
    status?: string
}

type VerifyTicketErrorResponse = {
    error?: string
}

export default function EventTicketScanner() {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const scannerRef = useRef<Html5Qrcode | null>(null)
    const lastScannedCodeRef = useRef<string | null>(null)
    const mountedRef = useRef(false)
    const startingRef = useRef(false)
    const isVerifyingRef = useRef(false)

    const [scanResult, setScanResult] = useState<ScanResult | null>(null)
    const [isStarting, setIsStarting] = useState(true)
    const [isVerifying, setIsVerifying] = useState(false)
    const [cameraError, setCameraError] = useState('')
    const [scanCount, setScanCount] = useState(0)

    const eventTitle =
        location.state?.eventTitle || 'Event ticket scanner'

    const stopScanner = useCallback(async () => {
        const scanner = scannerRef.current

        if (!scanner) return

        try {
            if (scanner.isScanning) {
                await scanner.stop()
            }
        } catch (error) {
            console.error('Could not stop scanner:', error)
        }

        try {
            scanner.clear()
        } catch (error) {
            console.error('Could not clear scanner:', error)
        }

        if (scannerRef.current === scanner) {
            scannerRef.current = null
        }
    }, [])

    const verifyTicket = useCallback(
        async (decodedText: string) => {
            if (
                lastScannedCodeRef.current === decodedText ||
                isVerifyingRef.current
            ) {
                return
            }

            lastScannedCodeRef.current = decodedText
            isVerifyingRef.current = true

            setIsVerifying(true)
            setCameraError('')
            setScanCount((count) => count + 1)

            await stopScanner()

            try {
                const response = await apiClient.post(
                    '/bookings/verify-ticket/',
                    {
                        ticket_code: decodedText,
                    },
                )

                if (!mountedRef.current) return

                setScanResult({
                    type: 'valid',
                    message:
                        response.data?.message ||
                        'Ticket verified successfully.',
                    ticketCode:
                        response.data?.ticket_code || decodedText,
                    status: response.data?.status,
                })
            } catch (error: unknown) {
                if (!mountedRef.current) return

                const apiError =
                    error instanceof AxiosError
                        ? error
                        : null

                const status = apiError?.response?.status

                const responseData =
                    apiError?.response?.data as
                        | VerifyTicketErrorResponse
                        | undefined

                const message =
                    responseData?.error ||
                    'Unable to verify this ticket.'

                if (status === 400) {
                    setScanResult({
                        type: 'already_used',
                        message,
                        ticketCode: decodedText,
                    })
                } else {
                    setScanResult({
                        type: 'invalid',
                        message,
                        ticketCode: decodedText,
                    })
                }
            } finally {
                isVerifyingRef.current = false

                if (mountedRef.current) {
                    setIsVerifying(false)
                }
            }
        },
        [stopScanner],
    )

    const startScanner = useCallback(async () => {
        if (startingRef.current || scannerRef.current) return

        startingRef.current = true
        setIsStarting(true)
        setCameraError('')

        try {
            const element = document.getElementById('ticket-qr-reader')

            if (!element) {
                throw new Error('Scanner view is not available.')
            }

            const cameras = await Html5Qrcode.getCameras()

            if (!mountedRef.current) return

            if (!cameras.length) {
                throw new Error('No camera was found on this device.')
            }

            const preferredCamera =
                cameras.find((camera) =>
                    /back|rear|environment|world/i.test(camera.label),
                ) || cameras[cameras.length - 1]

            const scanner = new Html5Qrcode('ticket-qr-reader', {
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                ],
                verbose: false,
            })

            scannerRef.current = scanner

            await scanner.start(
                preferredCamera.id,
                {
                    fps: 15,
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const size = Math.floor(
                            Math.min(
                                viewfinderWidth,
                                viewfinderHeight,
                            ) * 0.8,
                        )

                        const qrSize = Math.min(size, 420)

                        return {
                            width: qrSize,
                            height: qrSize,
                        }
                    },
                    aspectRatio: 1,
                    disableFlip: false,
                },
                (decodedText) => {
                    void verifyTicket(decodedText)
                },
                () => {
                    // Ignore frames where no QR code is detected.
                },
            )

            if (mountedRef.current) {
                setIsStarting(false)
            }
        } catch (error: unknown) {
            console.error('Scanner startup error:', error)

            await stopScanner()

            if (mountedRef.current) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Unable to access your camera.'

                setCameraError(message)
                setIsStarting(false)
            }
        } finally {
            startingRef.current = false
        }
    }, [stopScanner, verifyTicket])

    const handleScanNext = async () => {
        await stopScanner()

        lastScannedCodeRef.current = null
        isVerifyingRef.current = false

        setScanResult(null)
        setCameraError('')
        setIsVerifying(false)
    }

    const handleRetryCamera = async () => {
        await stopScanner()
        setCameraError('')
        setIsStarting(true)
    }

    // Handle scanner cleanup when the page is unmounted.
    useEffect(() => {
        mountedRef.current = true

        return () => {
            mountedRef.current = false
            void stopScanner()
        }
    }, [stopScanner])

    // Start the camera after the scanner element has rendered.
    // Deferring startup avoids synchronous state updates inside the effect.
    useEffect(() => {
        if (scanResult || cameraError) return

        const timer = window.setTimeout(() => {
            void startScanner()
        }, 100)

        return () => {
            window.clearTimeout(timer)
        }
    }, [scanResult, cameraError, startScanner])

    const handleBack = () => {
        navigate(`/organisers/events/${id}/dashboard`)
    }

    return (
        <main className="flex min-h-[100dvh] w-full flex-col bg-[#111214] text-white">
            {/* Full-width header */}
            <header className="flex w-full items-center justify-between border-b border-white/10 px-4 py-4 sm:px-8">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                        aria-label="Back to event dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="min-w-0">
                        <h1 className="truncate text-base font-semibold sm:text-lg">
                            {eventTitle}
                        </h1>
                        <p className="text-xs text-gray-400 sm:text-sm">
                            Gate check-in scanner
                        </p>
                    </div>
                </div>

                <div className="ml-3 flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                    <ScanLine size={16} className="text-gray-300" />
                    <span className="text-sm font-medium">
                        {scanCount}
                    </span>
                </div>
            </header>

            {/* Camera screen */}
            {!scanResult && (
                <section className="relative flex flex-1 flex-col overflow-hidden">
                    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
                        {!cameraError && (
                            <div
                                id="ticket-qr-reader"
                                className="absolute inset-0 h-full w-full overflow-hidden [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
                            />
                        )}

                        {!cameraError && (
                            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                                <div className="absolute inset-0 bg-black/25" />

                                <div className="relative h-[min(78vw,58vh)] max-h-[460px] w-[min(78vw,58vh)] max-w-[460px] rounded-3xl border-2 border-white/80 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]">
                                    <span className="absolute -left-1 -top-1 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-emerald-400" />
                                    <span className="absolute -right-1 -top-1 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-emerald-400" />
                                    <span className="absolute -bottom-1 -left-1 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-emerald-400" />
                                    <span className="absolute -bottom-1 -right-1 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-emerald-400" />
                                </div>
                            </div>
                        )}

                        {isStarting && !cameraError && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70">
                                <RefreshCw
                                    size={30}
                                    className="animate-spin text-white"
                                />
                                <p className="text-sm text-gray-300">
                                    Starting camera...
                                </p>
                            </div>
                        )}

                        {isVerifying && (
                            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/80">
                                <RefreshCw
                                    size={34}
                                    className="animate-spin text-white"
                                />
                                <p className="font-medium">
                                    Verifying ticket...
                                </p>
                            </div>
                        )}

                        {cameraError && (
                            <div className="flex min-h-[65vh] w-full flex-col items-center justify-center px-6 text-center">
                                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                                    <Camera size={30} />
                                </div>

                                <h2 className="text-xl font-semibold">
                                    Camera unavailable
                                </h2>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
                                    {cameraError}
                                </p>

                                <button
                                    type="button"
                                    onClick={handleRetryCamera}
                                    className="mt-6 flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
                                >
                                    <RefreshCw size={17} />
                                    Try again
                                </button>
                            </div>
                        )}
                    </div>

                    {!cameraError && (
                        <div className="flex w-full flex-col items-center gap-2 bg-[#1c1d20] px-5 py-6 text-center">
                            <div className="flex items-center gap-2">
                                <ScanLine
                                    size={20}
                                    className="text-emerald-400"
                                />
                                <h2 className="font-semibold">
                                    Scan attendee ticket
                                </h2>
                            </div>

                            <p className="max-w-md text-sm text-gray-400">
                                Position the ticket QR code inside the
                                scanning frame. Verification will happen
                                automatically.
                            </p>
                        </div>
                    )}
                </section>
            )}

            {/* Full-page ticket status screen */}
            {scanResult && (
                <section className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
                    {scanResult.type === 'valid' && (
                        <div className="flex w-full max-w-xl flex-col items-center text-center">
                            <div className="mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 sm:h-32 sm:w-32">
                                <Check size={66} strokeWidth={2.5} />
                            </div>

                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
                                Valid ticket
                            </p>

                            <h2 className="text-4xl font-bold text-emerald-400 sm:text-5xl">
                                Let them in
                            </h2>

                            <p className="mt-4 max-w-md text-sm leading-6 text-gray-300 sm:text-base">
                                {scanResult.message}
                            </p>

                            {scanResult.status && (
                                <div className="mt-6 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
                                    Status: {scanResult.status}
                                </div>
                            )}

                            <div className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
                                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                    Ticket code
                                </p>
                                <p className="mt-2 break-all font-mono text-sm text-white">
                                    {scanResult.ticketCode}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleScanNext}
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-gray-200 sm:max-w-sm"
                            >
                                <ScanLine size={19} />
                                Scan Next
                            </button>
                        </div>
                    )}

                    {scanResult.type === 'already_used' && (
                        <div className="flex w-full max-w-xl flex-col items-center text-center">
                            <div className="mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 sm:h-32 sm:w-32">
                                <AlertTriangle size={64} strokeWidth={2} />
                            </div>

                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
                                Already used
                            </p>

                            <h2 className="text-3xl font-bold text-amber-400 sm:text-5xl">
                                Do not let in
                            </h2>

                            <p className="mt-4 text-base font-semibold text-white">
                                Call a supervisor.
                            </p>

                            <p className="mt-3 max-w-md text-sm leading-6 text-gray-300">
                                {scanResult.message}
                            </p>

                            <button
                                type="button"
                                onClick={handleScanNext}
                                className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-4 font-semibold text-black transition hover:bg-amber-300 sm:max-w-sm"
                            >
                                <ScanLine size={19} />
                                Scan Next
                            </button>
                        </div>
                    )}

                    {scanResult.type === 'invalid' && (
                        <div className="flex w-full max-w-xl flex-col items-center text-center">
                            <div className="mb-7 flex h-28 w-28 items-center justify-center rounded-full bg-red-500/15 text-red-400 sm:h-32 sm:w-32">
                                <X size={68} strokeWidth={2.5} />
                            </div>

                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
                                Invalid ticket
                            </p>

                            <h2 className="text-4xl font-bold text-red-400 sm:text-5xl">
                                Do not let in
                            </h2>

                            <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">
                                {scanResult.message}
                            </p>

                            <button
                                type="button"
                                onClick={handleScanNext}
                                className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 font-semibold text-black transition hover:bg-gray-200 sm:max-w-sm"
                            >
                                <ScanLine size={19} />
                                Scan Next
                            </button>
                        </div>
                    )}
                </section>
            )}
        </main>
    )
}
