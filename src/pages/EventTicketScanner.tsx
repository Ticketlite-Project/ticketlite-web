
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
import { Html5Qrcode } from 'html5-qrcode'
import { apiClient } from '@/src/api/axios'

type VerificationResult =
    | {
          type: 'valid'
          message: string
          ticketCode: string
          status: string
      }
    | {
          type: 'already_used'
          message: string
      }
    | {
          type: 'invalid'
          message: string
      }

type CameraStatus = 'loading' | 'ready' | 'error'

interface ScannerLocationState {
    eventTitle?: string
}

export default function EventTicketScanner() {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams()

    const locationState =
        location.state as ScannerLocationState | null

    const eventTitle =
        locationState?.eventTitle || 'Event ticket scanner'

    const scannerRef = useRef<Html5Qrcode | null>(null)
    const startingRef = useRef(false)
    const verifyingRef = useRef(false)
    const mountedRef = useRef(true)

    const [cameraStatus, setCameraStatus] =
        useState<CameraStatus>('loading')

    const [cameraError, setCameraError] = useState('')

    const [scanResult, setScanResult] =
        useState<VerificationResult | null>(null)

    const [isVerifying, setIsVerifying] = useState(false)
    const [scanCount, setScanCount] = useState(0)

    // Stop and clear the current camera scanner.
    const stopScanner = useCallback(async () => {
        const scanner = scannerRef.current

        if (!scanner) return

        try {
            if (scanner.isScanning) {
                await scanner.stop()
            }
        } catch (error) {
            console.error('Error stopping scanner:', error)
        }

        try {
            scanner.clear()
        } catch {
            // Scanner may already have been cleared.
        }

        if (scannerRef.current === scanner) {
            scannerRef.current = null
        }
    }, [])

    // Verify the decoded QR code with the backend.
    const verifyTicket = useCallback(
        async (ticketCode: string) => {
            if (verifyingRef.current) return

            verifyingRef.current = true

            if (mountedRef.current) {
                setIsVerifying(true)
            }

            await stopScanner()

            try {
                const response = await apiClient.post<{
                    message: string
                    ticket_code: string
                    status: string
                }>('/bookings/verify-ticket/', {
                    ticket_code: ticketCode,
                })

                if (!mountedRef.current) return

                setScanResult({
                    type: 'valid',
                    message:
                        response.data.message || 'Ticket verified successfully.',
                    ticketCode: response.data.ticket_code,
                    status: response.data.status,
                })
            } catch (error: unknown) {
                if (!mountedRef.current) return

                const apiError = error as {
                    response?: {
                        status?: number
                        data?: {
                            error?: string
                        }
                    }
                }

                const httpStatus = apiError.response?.status
                const backendMessage = apiError.response?.data?.error

                // HTTP 400: Ticket already used.
                if (httpStatus === 400) {
                    setScanResult({
                        type: 'already_used',
                        message:
                            backendMessage ||
                            'This ticket has already been used.',
                    })
                }
                // HTTP 403 or 404: Invalid ticket.
                else if (
                    httpStatus === 403 ||
                    httpStatus === 404
                ) {
                    setScanResult({
                        type: 'invalid',
                        message:
                            backendMessage ||
                            'This code is not a valid ticket for this event. It may be fake, edited, or for a different event.',
                    })
                }
                // Other errors.
                else {
                    setScanResult({
                        type: 'invalid',
                        message:
                            backendMessage ||
                            'Unable to verify this ticket. Please check your connection and try again.',
                    })
                }

                console.error(
                    'Ticket verification failed:',
                    error
                )
            } finally {
                verifyingRef.current = false

                if (mountedRef.current) {
                    setIsVerifying(false)
                }
            }
        },
        [stopScanner]
    )

    // Start the camera.
    const startScanner = useCallback(async () => {
        if (
            startingRef.current ||
            verifyingRef.current ||
            scannerRef.current
        ) {
            return
        }

        startingRef.current = true

        if (mountedRef.current) {
            setCameraStatus('loading')
            setCameraError('')
        }

        try {
            const scanner = new Html5Qrcode('ticket-qr-reader')
            scannerRef.current = scanner

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: {
                        width: 200,
                        height: 200,
                    },
                    aspectRatio: 1,
                },
                async (decodedText) => {
                    if (verifyingRef.current) return

                    setScanCount((count) => count + 1)

                    await verifyTicket(decodedText)
                },
                () => {
                    // Ignore frames without a detected QR code.
                }
            )

            if (mountedRef.current) {
                setCameraStatus('ready')
            }
        } catch (error) {
            console.error(
                'Camera initialization failed:',
                error
            )

            if (mountedRef.current) {
                setCameraStatus('error')
                setCameraError(
                    'Unable to access your camera. Please allow camera permission and try again.'
                )
            }

            await stopScanner()
        } finally {
            startingRef.current = false
        }
    }, [stopScanner, verifyTicket])

    // Start the camera when the scanner page loads.
    // It also restarts automatically when Scan Next is selected.
    useEffect(() => {
        mountedRef.current = true

        if (!scanResult) {
            const timer = window.setTimeout(() => {
                void startScanner()
            }, 150)

            return () => {
                window.clearTimeout(timer)
            }
        }

        return undefined
    }, [scanResult, startScanner])

    // Clean up camera when leaving the page.
    useEffect(() => {
        mountedRef.current = true

        return () => {
            mountedRef.current = false

            const scanner = scannerRef.current

            if (scanner) {
                if (scanner.isScanning) {
                    void scanner.stop().catch(() => undefined)
                }

                scannerRef.current = null
            }
        }
    }, [])

    const handleScanNext = async () => {
        if (verifyingRef.current) return

        await stopScanner()

        setScanResult(null)
        setCameraError('')
        setCameraStatus('loading')
    }

    const handleBack = () => {
        navigate(`/organisers/events/${id}/dashboard`)
    }

    const isValid = scanResult?.type === 'valid'
    const isAlreadyUsed = scanResult?.type === 'already_used'
    const isInvalid = scanResult?.type === 'invalid'

    return (
        <div className="min-h-screen bg-[#f3f4f6] text-black">
            <div className="mx-auto min-h-screen w-full max-w-md bg-white shadow-sm">

                {/* EVENT HEADER */}
                <header className="flex min-h-[51px] items-center justify-between border-b border-gray-200 px-4 py-2">
                    <div className="min-w-0">
                        <h1 className="truncate text-sm font-extrabold text-black">
                            {eventTitle}
                        </h1>

                        <button
                            type="button"
                            onClick={handleBack}
                            className="mt-0.5 flex cursor-pointer items-center gap-1 text-[10px] font-medium text-gray-500 hover:text-black"
                        >
                            <ArrowLeft size={11} />
                            Back to event dashboard
                        </button>
                    </div>

                    <div className="shrink-0 text-right">
                        <p className="text-sm font-extrabold text-emerald-700">
                            {scanCount}
                        </p>
                        <p className="text-[9px] text-gray-500">
                            scans this session
                        </p>
                    </div>
                </header>

                {/* CAMERA AREA */}
                <section className="relative h-[190px] overflow-hidden bg-[#1c1d20]">
                    <div
                        id="ticket-qr-reader"
                        className="h-full w-full overflow-hidden"
                    />

                    {/* SCANNER FRAME */}
                    {cameraStatus === 'ready' && !scanResult && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="relative h-[130px] w-[130px]">
                                <span className="absolute left-0 top-0 h-[30px] w-[30px] border-l-2 border-t-2 border-white/50" />
                                <span className="absolute right-0 top-0 h-[30px] w-[30px] border-r-2 border-t-2 border-white/50" />
                                <span className="absolute bottom-0 left-0 h-[30px] w-[30px] border-b-2 border-l-2 border-white/50" />
                                <span className="absolute bottom-0 right-0 h-[30px] w-[30px] border-b-2 border-r-2 border-white/50" />
                            </div>
                        </div>
                    )}

                    {/* CAMERA LOADING */}
                    {cameraStatus === 'loading' && !scanResult && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1c1d20]">
                            <RefreshCw
                                size={25}
                                className="animate-spin text-white"
                            />
                            <p className="text-xs text-gray-300">
                                Starting camera...
                            </p>
                        </div>
                    )}

                    {/* CAMERA ERROR */}
                    {cameraStatus === 'error' && !scanResult && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1c1d20] px-5 text-center">
                            <Camera
                                size={30}
                                className="text-red-400"
                            />

                            <p className="text-xs text-gray-300">
                                {cameraError}
                            </p>

                            <button
                                type="button"
                                onClick={() => void startScanner()}
                                className="cursor-pointer rounded-md bg-white px-5 py-2 text-xs font-bold text-black"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* VERIFYING */}
                    {isVerifying && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75">
                            <RefreshCw
                                size={30}
                                className="animate-spin text-white"
                            />
                            <p className="text-sm font-semibold text-white">
                                Verifying ticket...
                            </p>
                        </div>
                    )}
                </section>

                {/* VALID RESULT */}
                {isValid && (
                    <section className="flex min-h-[410px] flex-col bg-[#00865A] px-5 pb-5 pt-5 text-center text-white">
                        <div className="mx-auto flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full bg-white">
                            <Check
                                size={43}
                                strokeWidth={3.5}
                                className="text-[#00865A]"
                            />
                        </div>

                        <h2 className="mt-3 text-[40px] font-black leading-none tracking-tight">
                            VALID
                        </h2>

                        <p className="mt-2 text-sm font-semibold">
                            Let them in
                        </p>

                        <div className="mt-5 rounded-lg bg-[#006B48] px-3 py-3 text-left">
                            <p className="text-xs font-medium text-green-100">
                                Ticket code
                            </p>

                            <p className="mt-1 break-all text-xs font-bold text-white">
                                {scanResult.ticketCode}
                            </p>

                            <div className="mt-3 border-t border-white/20 pt-2">
                                <p className="text-xs font-medium text-green-100">
                                    Backend status
                                </p>

                                <p className="mt-1 text-sm font-bold text-white">
                                    {scanResult.status}
                                </p>
                            </div>
                        </div>

                        <p className="mt-3 text-xs text-white/90">
                            {scanResult.message}
                        </p>

                        <button
                            type="button"
                            onClick={() => void handleScanNext()}
                            className="mt-auto flex min-h-[43px] w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-white px-4 py-3 text-xs font-extrabold text-[#00865A] transition hover:bg-gray-100"
                        >
                            <ScanLine size={16} />
                            SCAN NEXT
                        </button>
                    </section>
                )}

                {/* ALREADY USED RESULT */}
                {isAlreadyUsed && (
                    <section className="flex min-h-[430px] flex-col bg-[#F8B900] px-5 pb-5 pt-5 text-center text-black">
                        <div className="mx-auto flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full bg-black">
                            <AlertTriangle
                                size={39}
                                strokeWidth={2.8}
                                className="text-[#F8B900]"
                            />
                        </div>

                        <h2 className="mt-3 text-[32px] font-black leading-[1.05] tracking-tight">
                            ALREADY
                            <br />
                            USED
                        </h2>

                        <p className="mt-2 text-sm font-bold">
                            Do not let in. Call a supervisor.
                        </p>

                        <div className="mt-4 rounded-lg bg-white px-3 py-3 text-left">
                            <p className="text-xs font-semibold text-gray-600">
                                Ticket verification
                            </p>

                            <p className="mt-1 text-sm font-bold text-black">
                                {scanResult.message}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleScanNext()}
                            className="mt-auto flex min-h-[43px] w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-black px-4 py-3 text-xs font-extrabold text-white transition hover:bg-gray-900"
                        >
                            <ScanLine size={16} />
                            SCAN NEXT
                        </button>
                    </section>
                )}

                {/* INVALID RESULT */}
                {isInvalid && (
                    <section className="flex min-h-[410px] flex-col bg-[#E92327] px-5 pb-5 pt-5 text-center text-white">
                        <div className="mx-auto flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full bg-white">
                            <X
                                size={44}
                                strokeWidth={3.5}
                                className="text-[#E92327]"
                            />
                        </div>

                        <h2 className="mt-3 text-[40px] font-black leading-none tracking-tight">
                            INVALID
                        </h2>

                        <p className="mt-2 text-sm font-bold">
                            Do not let in
                        </p>

                        <div className="mt-3 rounded-lg bg-white px-3 py-3 text-left">
                            <p className="text-xs leading-relaxed text-black">
                                {scanResult.message}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleScanNext()}
                            className="mt-auto flex min-h-[43px] w-full cursor-pointer items-center justify-center gap-2 rounded-sm bg-white px-4 py-3 text-xs font-extrabold text-[#E92327] transition hover:bg-gray-100"
                        >
                            <ScanLine size={16} />
                            SCAN NEXT
                        </button>
                    </section>
                )}

                {/* SCANNER INSTRUCTIONS */}
                {!scanResult && (
                    <div className="bg-white px-5 py-5 text-center">
                        <p className="text-xs font-medium text-gray-500">
                            Position the attendee's QR code inside the
                            scanning area to verify their ticket.
                        </p>

                        <p className="mt-2 text-[10px] text-gray-400">
                            Scans completed this session: {scanCount}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
