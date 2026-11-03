import { CustomButton } from '../Button/custom-button'

export function OrganiserCallout() {
    return (
        <section className="bg-[#E8F7EE] dark:bg-emerald-950/20 py-12 px-6 md:py-16 md:px-12 rounded-3xl max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left Column: Copy & CTAs */}
                <div className="max-w-xl">
                    <p className="text-sm font-bold tracking-widest text-[#4B5E54] dark:text-emerald-400/80 uppercase mb-4">
                        For Organisers
                    </p>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-black dark:text-white leading-[1.15] mb-6 tracking-tight">
                        Stop selling paper tickets over WhatsApp
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                        Create an event, set Regular and VIP prices, and watch
                        sales and check-ins come in live. Organiser accounts are
                        reviewed before they can publish.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <CustomButton
                            variant="primary"
                            to="/organisers/start"
                            rounded
                            className="flex px-6 py-6 w-full sm:w-auto items-center"
                        >
                            Start Selling
                        </CustomButton>
                        <CustomButton
                            variant="secondary"
                            rounded
                            to="/organisers/dashboard"
                            className="flex px-6 py-6 w-full sm:w-auto border-none shadow-sm items-center"
                        >
                            See the Dashboard
                        </CustomButton>
                    </div>
                </div>

                {/* Right Column: Numbered Steps */}
                <div className="flex flex-col gap-4">
                    <StepItem
                        number="1"
                        text="Create your event and ticket types"
                    />
                    <StepItem
                        number="2"
                        text="Attendees pay with mobile money"
                    />
                    <StepItem
                        number="3"
                        text="Your gate team scans QR codes at the door"
                    />
                </div>
            </div>
        </section>
    )
}

function StepItem({
    number,
    text,
}: Readonly<{ number: string; text: string }>) {
    return (
        <div className="bg-background rounded-2xl p-6 flex items-center gap-5 shadow-sm border border-transparent dark:border-gray-800 transition-colors hover:border-gray-100 dark:hover:border-gray-700">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#2C7A51] dark:bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                {number}
            </div>
            <p className="text-gray-900 dark:text-gray-100 font-medium text-lg leading-snug">
                {text}
            </p>
        </div>
    )
}
