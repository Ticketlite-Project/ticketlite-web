import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorFallback } from './error-fallback'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: (error: Error, reset: () => void) => ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
    showDetails?: boolean
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = {
        hasError: false,
        error: null,
        errorInfo: null,
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to your observability tool (Sentry, Datadog, etc.)
        console.error('[ErrorBoundary] Caught error:', error, errorInfo)
        this.props.onError?.(error, errorInfo)
        this.setState({ errorInfo })
    }

    reset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        const { hasError, error, errorInfo } = this.state
        const { children, fallback, showDetails } = this.props

        if (!hasError) return children

        if (fallback && error) return fallback(error, this.reset)

        return (
            <ErrorFallback
                error={error}
                errorInfo={errorInfo}
                onReset={this.reset}
                showDetails={showDetails}
            />
        )
    }
}
