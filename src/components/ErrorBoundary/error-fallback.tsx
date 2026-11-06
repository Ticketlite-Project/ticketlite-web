import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import {
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Home,
    RefreshCw,
} from 'lucide-react'
import { useState, type ErrorInfo } from 'react'

interface ErrorFallbackProps {
    error: Error | null
    errorInfo: ErrorInfo | null
    onReset: () => void
    showDetails?: boolean
}

export function ErrorFallback({
    error,
    errorInfo,
    onReset,
    showDetails,
}: Readonly<ErrorFallbackProps>) {
    const [expanded, setExpanded] = useState(false)
    const isDev = showDetails ?? import.meta.env.DEV

    const goHome = () => {
        window.location.href = '/' // full reload — clears broken state
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950/30 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 dark:bg-red-900/20 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 dark:bg-orange-900/20 rounded-full blur-3xl opacity-50" />
            </div>

            <Card className="relative w-full max-w-2xl border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                <CardContent className="p-8 md:p-12">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <AlertTriangle
                                className="w-24 h-24 text-red-500 dark:text-red-400"
                                strokeWidth={1.5}
                            />
                            <div className="absolute inset-0 bg-red-400/20 dark:bg-red-500/20 rounded-full blur-xl animate-pulse" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-5xl md:text-6xl font-black bg-linear-to-r from-red-600 via-orange-600 to-amber-600 dark:from-red-400 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                            Oops!
                        </h1>
                        <div className="h-1 w-24 mx-auto mt-4 bg-linear-to-r from-red-500 to-orange-500 rounded-full" />
                    </div>

                    <div className="text-center space-y-3 mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Something went wrong
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm md:text-base">
                            An unexpected error occurred while rendering this
                            page. You can try again or head back to safety.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
                        <Button
                            onClick={onReset}
                            variant="outline"
                            className="w-full sm:w-auto gap-2 h-11 px-6"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                        <Button
                            onClick={goHome}
                            className="w-full sm:w-auto gap-2 h-11 px-6 bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg shadow-red-500/25"
                        >
                            <Home className="h-4 w-4" />
                            Go Home
                        </Button>
                    </div>

                    {isDev && error && (
                        <div className="mt-6">
                            <button
                                onClick={() => setExpanded((v) => !v)}
                                className="flex items-center gap-2 mx-auto text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                {expanded ? (
                                    <ChevronUp className="h-3 w-3" />
                                ) : (
                                    <ChevronDown className="h-3 w-3" />
                                )}
                                {expanded ? 'Hide' : 'Show'} error details
                            </button>

                            {expanded && (
                                <div className="mt-3 rounded-lg bg-gray-950 text-red-400 p-4 text-xs font-mono overflow-auto max-h-64">
                                    <p className="text-red-300 font-semibold mb-2">
                                        {error.name}: {error.message}
                                    </p>
                                    {error.stack && (
                                        <pre className="whitespace-pre-wrap">
                                            {error.stack}
                                        </pre>
                                    )}
                                    {errorInfo?.componentStack && (
                                        <>
                                            <p className="text-amber-300 font-semibold mt-3 mb-1">
                                                Component stack:
                                            </p>
                                            <pre className="whitespace-pre-wrap text-gray-400">
                                                {errorInfo.componentStack}
                                            </pre>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8 font-mono">
                        Error ref:{' '}
                        {new Date()
                            .toISOString()
                            .slice(0, 19)
                            .replace('T', ' ')}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
