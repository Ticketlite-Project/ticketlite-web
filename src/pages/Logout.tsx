import { CustomButton } from '../components/Button/custom-button'

export default function Logout() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-2xl font-bold tracking-tight mb-2">
                You have been logged out
            </h1>
            <p className="text-muted-foreground mb-6">
                Thank you for using TicketLite. You can return to the home page
                to browse events.
            </p>
            <CustomButton to="/" variant="primary" className="flex w-fit py-4">
                Return to Home
            </CustomButton>
        </div>
    )
}
