
export type ScanResult = {
    status: 'valid' | 'already_used' | 'invalid'
    ticketType?: string
    holder?: string
    firstScanned?: string
    scannedBy?: string
    message?: string
}

export const mockVerifyTicket = async (
    qrCode: string
): Promise<ScanResult> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    switch (qrCode.trim()) {
        case 'TICKETLITE-VALID-001':
            return {
                status: 'valid',
                ticketType: 'Regular',
                holder: 'Ama Mensah',
            }

        case 'TICKETLITE-USED-001':
            return {
                status: 'already_used',
                firstScanned: '7:42 PM',
                scannedBy: 'Efua · Gate B',
            }

        default:
            return {
                status: 'invalid',
                message:
                    "This code isn't a ticket for this event. It may be fake, edited, or for a different event.",
            }
    }
}
