import { Suspense, type ReactNode } from 'react'
import RippleLoader from './SuspenseLoader/suspense-loader'

export function Page({ children }: Readonly<{ children: ReactNode }>) {
    return <Suspense fallback={<RippleLoader />}>{children}</Suspense>
}
