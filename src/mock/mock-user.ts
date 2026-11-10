import type { User } from '../types/auth'

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
