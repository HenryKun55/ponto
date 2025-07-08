'use client'

import { Toaster } from 'sonner'
import { TanStackQueryClientProvider } from './query-client.provider'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TanStackQueryClientProvider>
      {children}
      <Toaster richColors position="top-right" />
    </TanStackQueryClientProvider>
  )
}
