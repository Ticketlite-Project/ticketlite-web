
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
    ArrowLeft,
    Camera,
    CameraOff,
    CheckCircle2,
    RefreshCw,
    ScanLine,
    ShieldCheck,
    Ticket,
} from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'

export default function EventTicketScanner() {
    const navigate = useNavigate()
    const { id } = useParams()

    const scannerRef = useRef<Html5Qrcode | null>(null)
    const startingRef = useRef(false)
    const stoppedRef = useRef(false)

    const [cameraStatus, setCameraStatus] = useState<
        'loading' | 'ready' | 'error'
    >('loading')

    const [cameraError, setCameraError] = useState('')
    const [scannedCode, setScannedCode] = useState('')
    const [scanning, setScanning] = useState(true)
    const [scanCount, setScanCount] = useState(0)

    const stopScanner = useCallback(async () => {
        const scanner = scannerRef.current

        if (!scanner) return

        try {
            if (scanner.isScanning) {
                await scanner.stop()
            }
        } catch (error) {
            console.error('Unable to stop camera:', error)
        }
    }, [])

    const startScanner = useCallback(async () => {
        if (startingRef.current) return

        startingRef.current = true
        stoppedRef.current = false

        setCameraStatus('loading')
        setCameraError('')
        setScannedCode('')
        setScanning(true)

        try {
            const scanner = new Html5Qrcode('ticketlite-qr-reader')

            scannerRef.current = scanner

            await scanner.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250,
                    },
                    aspectRatio: 1,
                },
async (decodedText: string) => {
                        if (stoppedRef.current) return

                    stoppedRef.current = true

                    setScannedCode(decodedText)
                    setScanCount((count) => count + 1)
                    setScanning(false)

                    await stopScanner()
                },
                () => {
                    // Ignore continuous QR detection failures.
                }
            )

            if (stoppedRef.current) {
                await stopScanner()
                return
            }

            setCameraStatus('ready')
        } catch (error) {
            console.error('Camera error:', error)

            setCameraStatus('error')
            setScanning(false)

            setCameraError(
                error instanceof Error
                    ? error.message
                    : 'Unable to access your camera. Please check camera permissions.'
            )
        } finally {
            startingRef.current = false
        }
    }, [stopScanner])

   useEffect(() => {
    let cancelled = false

    void Promise.resolve().then(() => {
        if (!cancelled) {
            void startScanner()
        }
    })

    return () => {
        cancelled = true
        stoppedRef.current = true
        void stopScanner()
    }
}, [startScanner, stopScanner])

    const scanAgain = async () => {
        await stopScanner()

        scannerRef.current = null

        const reader = document.getElementById('ticketlite-qr-reader')

        if (reader) {
            reader.innerHTML = ''
        }

        stoppedRef.current = false
        void startScanner()
    }

    const goBack = () => {
        void stopScanner()
        navigate(`/organisers/events/${id}/dashboard`)
    }

    return (
        <div className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">

                {/* HEADER */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goBack}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition hover:bg-accent"
                            aria-label="Back to event dashboard"
                        >
                            <ArrowLeft size={19} />
                        </button>

                        <div>
                            <h1 className="text-xl font-extrabold sm:text-2xl">
                                Ticket Scanner
                            </h1>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Scan attendee tickets at the entrance
                            </p>
                        </div>
                    </div>

                    <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        Gate check-in
                    </span>
                </div>

                {/* SCANNER CONTENT */}
                <div className="grid gap-6 lg:grid-cols-5">

                    {/* CAMERA */}
                    <div className="lg:col-span-3">
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">

                            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <ScanLine size={19} className="text-emerald-600" />

                                    <h2 className="text-sm font-bold">
                                        QR Code Scanner
                                    </h2>
                                </div>

                                {cameraStatus === 'ready' && scanning && (
                                    <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                        Scanning
                                    </span>
                                )}
                            </div>

                            <div className="bg-black p-3 sm:p-5">
                                <div
                                    id="ticketlite-qr-reader"
                                    className="mx-auto min-h-[300px] w-full max-w-md overflow-hidden rounded-xl"
                                />

                                {cameraStatus === 'loading' && (
                                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center text-white">
                                        <RefreshCw
                                            size={32}
                                            className="animate-spin text-emerald-400"
                                        />

                                        <p className="mt-4 text-sm font-semibold">
                                            Starting camera...
                                        </p>

                                        <p className="mt-2 text-xs text-white/60">
                                            Please allow camera access when prompted.
                                        </p>
                                    </div>
                                )}

                                {cameraStatus === 'error' && (
                                    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 text-center text-white">
                                        <CameraOff
                                            size={36}
                                            className="text-red-400"
                                        />

                                        <h3 className="mt-4 text-base font-bold">
                                            Camera unavailable
                                        </h3>

                                        <p className="mt-2 max-w-sm text-xs leading-6 text-white/70">
                                            {cameraError}
                                        </p>

                                        <button
                                            onClick={scanAgain}
                                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-700"
                                        >
                                            <RefreshCw size={15} />
                                            TRY AGAIN
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <Camera
                                        size={18}
                                        className="text-muted-foreground"
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        Position the attendee's QR code inside
                                        the scanning frame.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SCAN RESULT */}
                        {scannedCode && (
                            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2
                                        size={22}
                                        className="shrink-0 text-amber-600"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-amber-800 dark:text-amber-300">
                                            QR code detected
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
                                            The QR code was successfully read.
                                            Backend verification is not yet connected.
                                        </p>

                                        <div className="mt-4 rounded-lg border border-amber-200 bg-white p-3 dark:border-amber-900 dark:bg-black/20">
                                            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                Decoded QR information
                                            </p>

                                            <p className="break-all text-xs font-medium text-foreground">
                                                {scannedCode}
                                            </p>
                                        </div>

                                        <button
                                            onClick={scanAgain}
                                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-800"
                                        >
                                            <ScanLine size={15} />
                                            SCAN ANOTHER TICKET
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR INFORMATION */}
                    <div className="space-y-5 lg:col-span-2">

                        <div className="rounded-xl border border-border bg-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    <Ticket size={21} />
                                </div>

                                <div>
                                    <h3 className="text-sm font-extrabold">
                                        Scanning session
                                    </h3>

                                    <p className="text-xs text-muted-foreground">
                                        Current event
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 border-t border-border pt-4">
                                <p className="text-xs text-muted-foreground">
                                    Event ID
                                </p>

                                <p className="mt-1 text-sm font-bold">
                                    {id}
                                </p>
                            </div>

                            <div className="mt-4 border-t border-border pt-4">
                                <p className="text-xs text-muted-foreground">
                                    QR codes detected
                                </p>

                                <p className="mt-1 text-2xl font-extrabold">
                                    {scanCount}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-5">
                            <div className="flex items-center gap-2">
                                <ShieldCheck
                                    size={19}
                                    className="text-emerald-600"
                                />

                                <h3 className="text-sm font-extrabold">
                                    Check-in instructions
                                </h3>
                            </div>

                            <div className="mt-4 space-y-4">
                                <div className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                        1
                                    </span>

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Ask the attendee to present their TicketLite QR code.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                        2
                                    </span>

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Position the QR code inside the camera frame.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                        3
                                    </span>

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Wait for the QR code to be detected.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                        4
                                    </span>

                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Verify the ticket with the backend once check-in integration is available.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={goBack}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-xs font-bold transition hover:bg-accent"
                        >
                            <ArrowLeft size={16} />
                            BACK TO EVENT DASHBOARD
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-muted-foreground">
                    TicketLite Gate Check-in · QR scanning mode
                </p>
            </div>
        </div>
    )
}
