import { Suspense, type ReactNode } from 'react'

export function Page({ children }: Readonly<{ children: ReactNode }>) {
    return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
}
