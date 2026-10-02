import { useQuery } from '@tanstack/react-query'
import { searchFromAPI } from '@/features/global-search/api/global-search.api'

export function useGlobalSearch(query: string) {
  const normalizedQuery = query.trim()
  return useQuery({
    enabled: normalizedQuery.length >= 2,
    queryKey: ['global-search', normalizedQuery],
    queryFn: () => searchFromAPI(normalizedQuery),
    placeholderData: (previous) => previous,
  })
}
