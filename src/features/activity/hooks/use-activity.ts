import { useQuery } from '@tanstack/react-query'
import { getActivityFromAPI } from '@/features/activity/api/activity.api'

export const activityQueryKeys = { all: ['activity'] as const }

export function useActivity() {
  return useQuery({
    queryKey: activityQueryKeys.all,
    queryFn: getActivityFromAPI,
  })
}
