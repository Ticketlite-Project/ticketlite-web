
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
    ArrowLeft,
    Check,
    AlertTriangle,
    X,
    RefreshCw,
} from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { mockVerifyTicket, type ScanResult } from '@/src/mock/ticketScannerMock'

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
    const [scanResult, setScanResult] = useState<ScanResult | null>(null)
    const [scanning, setScanning] = useState(true)
const [scanCount, setScanCount] = useState<number>(0)

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
        setScanResult(null)
        setScanning(true)

        try {
            const scanner = new Html5Qrcode('ticketlite-qr-reader')
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
                async (decodedText: string) => {
                    if (stoppedRef.current) return

                    // Prevent the same QR code from being processed repeatedly.
                    stoppedRef.current = true
                    setScanning(false)
                    setScanCount((count) => count + 1)

                    try {
                        const result = await mockVerifyTicket(decodedText)
                        setScanResult(result)
                    } catch (error) {
                        console.error('Ticket verification failed:', error)
                        setScanResult({
                            status: 'invalid',
                            message: 'Unable to verify this ticket.',
                        })
                    }

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
        if (reader) reader.innerHTML = ''

        stoppedRef.current = false
        void startScanner()
    }

    const goBack = () => {
        stoppedRef.current = true
        void stopScanner()
        navigate(`/organisers/events/${id}/dashboard`)
    }

    return (
        <div className="min-h-screen bg-[#f3f3f3] px-2 py-4 text-black">
            <div className="mx-auto w-full max-w-[420px] overflow-hidden bg-white shadow-sm">

                {/* EVENT HEADER */}
                <div className="flex h-[49px] items-center justify-between border-b border-gray-200 px-3">
                    <div className="min-w-0">
                        <h1 className="truncate text-[13px] font-extrabold">
                            Campus Jazz Night
                        </h1>

                        <p className="text-[10px] text-gray-500">
                            Gate A · Kofi (staff)
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-[13px] font-extrabold text-emerald-700">
                            313 <span className="font-normal text-gray-500">/ 480</span>
                        </p>

                        <p className="text-[9px] text-gray-500">
                            checked in
                        </p>
                    </div>
                </div>

                {/* CAMERA SCANNER */}
                <div className="relative h-[192px] overflow-hidden bg-[#1c1d1f]">
                    <div
                        id="ticketlite-qr-reader"
                        className="h-full w-full overflow-hidden"
                    />

                    {/* SCANNER FRAME */}
                    {cameraStatus === 'ready' && scanning && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="relative h-[132px] w-[132px]">
                                <span className="absolute left-0 top-0 h-[30px] w-[30px] border-l-2 border-t-2 border-white/50" />
                                <span className="absolute right-0 top-0 h-[30px] w-[30px] border-r-2 border-t-2 border-white/50" />
                                <span className="absolute bottom-0 left-0 h-[30px] w-[30px] border-b-2 border-l-2 border-white/50" />
                                <span className="absolute bottom-0 right-0 h-[30px] w-[30px] border-b-2 border-r-2 border-white/50" />
                            </div>
                        </div>
                    )}

                    {cameraStatus === 'loading' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c1d1f] text-white">
                            <RefreshCw size={25} className="animate-spin" />
                            <p className="mt-3 text-xs font-semibold">
                                Starting camera...
                            </p>
                        </div>
                    )}

                    {cameraStatus === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c1d1f] px-5 text-center text-white">
                            <p className="text-sm font-bold">
                                Camera unavailable
                            </p>

                            <p className="mt-2 text-xs text-white/70">
                                {cameraError}
                            </p>

                            <button
                                onClick={scanAgain}
                                className="mt-4 bg-white px-5 py-2.5 text-xs font-bold text-black"
                            >
                                TRY AGAIN
                            </button>
                        </div>
                    )}
                </div>

                {/* RESULT AREA */}
                {scanResult ? (
                    <div
                        className={`relative flex min-h-[412px] flex-col items-center px-[18px] pb-[19px] pt-[22px] ${
                            scanResult.status === 'valid'
                                ? 'bg-[#008657] text-white'
                                : scanResult.status === 'already_used'
                                  ? 'bg-[#ffb900] text-black'
                                  : 'bg-[#e92127] text-white'
                        }`}
                    >
                        {/* VALID */}
                        {scanResult.status === 'valid' && (
                            <>
                                <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-white text-[#008657]">
                                    <Check size={43} strokeWidth={3.5} />
                                </div>

                                <h2 className="mt-2 text-[40px] font-black leading-tight">
                                    VALID
                                </h2>

                                <p className="mt-1 text-sm font-semibold">
                                    Let them in
                                </p>

                                <div className="mt-3 grid w-full grid-cols-2 rounded-md bg-[#006c48] px-3 py-2.5">
                                    <div>
                                        <p className="text-[9px] font-semibold text-white/70">
                                            Ticket
                                        </p>
                                        <p className="text-xs font-extrabold">
                                            {scanResult.ticketType}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-semibold text-white/70">
                                            Holder
                                        </p>
                                        <p className="text-xs font-extrabold">
                                            {scanResult.holder}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* ALREADY USED */}
                        {scanResult.status === 'already_used' && (
                            <>
                                <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-black text-[#ffb900]">
                                    <AlertTriangle size={39} strokeWidth={2.5} />
                                </div>

                                <h2 className="mt-2 text-center text-[31px] font-black leading-[1.05]">
                                    ALREADY
                                    <br />
                                    USED
                                </h2>

                                <p className="mt-2 text-center text-sm font-semibold">
                                    Do not let in. Call a supervisor.
                                </p>

                                <div className="mt-3 grid w-full grid-cols-2 rounded-md bg-white px-3 py-2.5 text-black">
                                    <div>
                                        <p className="text-[9px] text-gray-500">
                                            First scanned
                                        </p>
                                        <p className="text-xs font-extrabold">
                                            {scanResult.firstScanned}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[9px] text-gray-500">
                                            By
                                        </p>
                                        <p className="text-xs font-extrabold">
                                            {scanResult.scannedBy}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* INVALID */}
                        {scanResult.status === 'invalid' && (
                            <>
                                <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-white text-[#e92127]">
                                    <X size={43} strokeWidth={3.5} />
                                </div>

                                <h2 className="mt-2 text-[40px] font-black leading-tight">
                                    INVALID
                                </h2>

                                <p className="mt-1 text-sm font-semibold">
                                    Do not let in
                                </p>

                                <div className="mt-3 w-full rounded-md bg-white px-3 py-2.5 text-black">
                                    <p className="text-[11px] leading-[18px]">
                                        {scanResult.message}
                                    </p>
                                </div>
                            </>
                        )}

                        {/* SCAN NEXT */}
                        <button
                            onClick={scanAgain}
                            className={`mt-auto flex min-h-[43px] w-full items-center justify-center text-xs font-extrabold ${
                                scanResult.status === 'already_used'
                                    ? 'bg-black text-white'
                                    : 'bg-white text-[#006c48]'
                            } ${
                                scanResult.status === 'invalid'
                                    ? 'text-[#e92127]'
                                    : ''
                            }`}
                        >
                            SCAN NEXT
                        </button>
                    </div>
                ) : (
                    <div className="flex min-h-[412px] flex-col items-center justify-center bg-[#008657] px-5 py-8 text-center text-white">
                        {cameraStatus === 'ready' ? (
                            <>
                                <p className="text-xl font-black">
                                    READY TO SCAN
                                </p>
                                <p className="mt-2 text-xs">
                                    Position the attendee's QR code inside the camera frame.
                                </p>
                            </>
                        ) : (
                            <p className="text-sm font-semibold">
                                Waiting for camera...
                            </p>
                        )}
                    </div>
                )}

                {/* BACK BUTTON */}
                <button
                    onClick={goBack}
                    className="flex w-full items-center justify-center gap-2 border-t border-gray-200 bg-white py-3 text-xs font-bold text-gray-600"
                >
                    <ArrowLeft size={15} />
                    BACK TO EVENT DASHBOARD
                </button>

                <p className="bg-white pb-3 text-center text-[9px] text-gray-400">
                    TicketLite Gate Check-in
                </p>
            </div>
<p className="text-sm text-muted-foreground">
    Total scans: {scanCount}
</p>
            <style>{`
                #ticketlite-qr-reader video {
                    width: 100% !important;
                    height: 192px !important;
                    object-fit: cover !important;
                }

                #ticketlite-qr-reader__dashboard,
                #ticketlite-qr-reader__header_message {
                    display: none !important;
                }

                #ticketlite-qr-reader img {
                    display: none !important;
                }
            `}</style>
        </div>
    )
}
