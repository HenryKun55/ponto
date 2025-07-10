'use client'

import { Toaster } from 'sonner'
import { TanStackQueryClientProvider } from './query-client.provider'
import { ReactNode } from 'react'
import { ThemeProvider } from './theme.provider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TanStackQueryClientProvider>
        {children}
        <Toaster richColors position="top-right" />
      </TanStackQueryClientProvider>
    </ThemeProvider>
  )
}
