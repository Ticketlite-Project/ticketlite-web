
import { apiClient } from './axios'

export interface VerifyTicketResponse {
    message: string
    [key: string]: unknown
}

export interface VerifyTicketRequest {
    ticket_code: string
}

export async function verifyTicket(
    ticketCode: string
): Promise<VerifyTicketResponse> {
    const response = await apiClient.post<VerifyTicketResponse>(
        '/bookings/verify-ticket/',
        {
            ticket_code: ticketCode,
        }
    )

    return response.data
}
