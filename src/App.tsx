import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { toast } from 'sonner'
import './App.css'
import { AuthProvider } from './context/AuthProvider'
import { router } from './router'

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            toast.error('Connection Error', {
                description:
                    error.message || 'Failed to fetch data from the server.',
            })
        },
    }),

    mutationCache: new MutationCache({
        onError: (error) => {
            toast.error('Action Failed', {
                description:
                    error.message || 'Something went wrong. Please try again.',
                duration: 3500,
            })
        },
    }),

    defaultOptions: {
        queries: {
            retry: 1,
            retryDelay: 5000,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 0,
        },
    },
})

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    )
}

export default App
