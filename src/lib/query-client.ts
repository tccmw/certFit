import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const queryKeys = {
  certificates: ['certificates'] as const,
  myCertificates: ['my-certificates'] as const,
  roadmaps: ['roadmaps'] as const,
  recommendationHistory: ['recommendation-history'] as const,
}
