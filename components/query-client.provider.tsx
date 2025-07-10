import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Retry customizado baseado no tipo de erro
        if (error instanceof Error && error.message.includes('Network')) {
          return failureCount < 3
        }
        return failureCount < 1
      },
    },
    mutations: {
      retry: 1,
    },
  },
})

export const TanStackQueryClientProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
