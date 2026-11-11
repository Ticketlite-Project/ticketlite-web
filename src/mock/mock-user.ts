import type { User } from '../types/auth'

export type OrganiserStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface OrganiserRequest {
    id: string
    name: string
    category: string
    contactName: string
    email: string
    appliedDate: string
    drafts: string
    status: OrganiserStatus
}

// Mock or API-driven initial users list (matches your User type)
export const initialUsers: User[] = [
    {
        id: 1,
        first_name: 'Alice',
        last_name: 'Johnson',
        username: 'alicej',
        email: 'alice@example.com',
        role: 'ADMIN',
    },
    {
        id: 2,
        first_name: 'Bob',
        last_name: 'Smith',
        username: 'bobsmith',
        email: 'bob@example.com',
        role: 'ORGANIZER',
    },
    {
        id: 3,
        first_name: 'Charlie',
        last_name: 'Brown',
        username: 'charlieb',
        email: 'charlie@example.com',
        role: 'GATE_STAFF',
    },
    {
        id: 4,
        first_name: 'Diana',
        last_name: 'Prince',
        username: 'dianap',
        email: 'diana@example.com',
        role: 'ATTENDEE',
    },
]

export const mockOrganisers: OrganiserRequest[] = [
    {
        id: '1',
        name: 'KNUST Music Society',
        category: 'Campus group',
        contactName: 'Yaw Boateng',
        email: 'yaw.b@example.com',
        appliedDate: '26 Oct 2026',
        drafts: '1 draft',
        status: 'PENDING',
    },
    {
        id: '2',
        name: 'Calvary Methodist Youth',
        category: 'Church',
        contactName: 'Akosua Owusu',
        email: 'akosua.o@example.com',
        appliedDate: '25 Oct 2026',
        drafts: '2 drafts',
        status: 'PENDING',
    },
    {
        id: '3',
        name: 'Accra Tech Meetup',
        category: 'Meetup',
        contactName: 'Selorm Dzokoto',
        email: 'selorm@example.com',
        appliedDate: '24 Oct 2026',
        drafts: '1 draft',
        status: 'PENDING',
    },
    {
        id: '4',
        name: 'Big Events GH',
        category: 'Promoter',
        contactName: 'Unverified',
        email: 'bigevents.gh@example.com',
        appliedDate: '24 Oct 2026',
        drafts: 'None',
        status: 'PENDING',
    },
]
