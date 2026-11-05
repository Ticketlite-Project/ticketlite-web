import { z } from 'zod'

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const signUpSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1, 'Full name is required')
        .refine(
            (value) => value.split(/\s+/).length >= 2,
            'Please enter your first name and last name'
        ),
    email: z
        .string()
        .trim()
        .min(1, 'Email is required')
        .email('Enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters'),
    accountType: z.enum(['attendee', 'organizer']),
})

export type SignUpFormValues = z.infer<typeof signUpSchema>
