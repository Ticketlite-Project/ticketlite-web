export const InfoCard = ({
    title,
    description,
    icon,
}: {
    title: string
    description: string
    icon: React.ReactNode
}) => {
    return (
        <output>
            <div className="flex items-center space-x-4">
                <div className="shrink-0">{icon}</div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
        </output>
    )
}
