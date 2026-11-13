import { Link } from 'react-router'

interface FooterLinkItem {
    label: string
    to: string
    external?: boolean
}

const defaultLinks: FooterLinkItem[] = [
    {
        label: 'Help',
        to: 'https://policies.google.com/terms?hl=en&client_theme=dark',
        external: true,
    },
    {
        label: 'Terms',
        to: 'https://policies.google.com/terms?hl=en&client_theme=dark',
        external: true,
    },
    {
        label: 'Privacy',
        to: 'https://policies.google.com/privacy?hl=en&client_theme=dark',
        external: true,
    },
    {
        label: 'Admin',
        to: '/admin',
        external: false,
    },
]

interface FooterLinksProps {
    links?: FooterLinkItem[]
    className?: string
}

export function FooterLinks({
    links = defaultLinks,
    className = 'flex items-center gap-4 sm:gap-6',
}: Readonly<FooterLinksProps>) {
    return (
        <div className={className}>
            {links.map((link) => {
                if (link.external) {
                    return (
                        <a
                            key={link.label}
                            href={link.to}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground underline transition-colors"
                        >
                            {link.label}
                        </a>
                    )
                }

                return (
                    <Link
                        key={link.label}
                        to={link.to}
                        className="hover:text-foreground underline transition-colors"
                    >
                        {link.label}
                    </Link>
                )
            })}
        </div>
    )
}

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
            <FooterLinks />
        </footer>
    )
}
