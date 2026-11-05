import { AuthProvider } from '@/src/context/AuthProvider'
import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { toast } from 'sonner'
import './App.css'
import { router } from './router'

const queryClient = new QueryClient({
    // Catches all Query (GET) failures
    queryCache: new QueryCache({
        onError: (error) => {
            toast.error('Connection Error', {
                description:
                    error.message || 'Failed to fetch data from the server.',
            })
        },
    }),
    // Catches all Mutation (POST/PUT/DELETE) failures
    mutationCache: new MutationCache({
        onError: (error) => {
            toast.error('Action Failed', {
                description:
                    error.message || 'Something went wrong. Please try again.',
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

export default App;