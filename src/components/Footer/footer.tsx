import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="flex flex-col sm:flex-row sm:items-center justify-between bg-card border-t px-4 sm:px-6 py-5 gap-4 text-sm text-muted-foreground">
            {/* Left Side */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                <span className="text-homeText font-bold">TicketLite</span>
                <span>·</span>
                <span>Prices in Ghana cedis (GHS)</span>
            </div>

            {/* Right Side (Links) */}
            <div className="flex items-center gap-4 sm:gap-6">
                <Link
                    to="/"
                    className="hover:text-foreground underline transition-colors"
                >
                    Help
                </Link>
                <Link
                    to="https://policies.google.com/terms?hl=en&client_theme=dark"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground underline transition-colors"
                >
                    Terms
                </Link>
                <Link
                    to="https://policies.google.com/privacy?hl=en&client_theme=dark"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground underline transition-colors"
                >
                    Privacy
                </Link>
                <Link
                    to="/"
                    className="hover:text-foreground underline transition-colors"
                >
                    Admin
                </Link>
            </div>
        </footer>
    )
}
