import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ponto Fácil',
  description: 'Sistema de registro de ponto',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning lang="pt-BR">
      <body suppressHydrationWarning className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
