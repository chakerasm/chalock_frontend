import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getWeeklyReflection,
  saveWeeklyReflection,
} from '@/features/weekly-review/services/weekly-reflections.service'
import type { WeeklyReflection } from '@/features/weekly-review/types/weekly-review.types'

export const weeklyReflectionQueryKeys = {
  detail: (weekStart: string) => ['weekly-reflections', weekStart] as const,
}

export function useWeeklyReflection(weekStart: string) {
  return useQuery({
    queryFn: () => getWeeklyReflection(weekStart),
    queryKey: weeklyReflectionQueryKeys.detail(weekStart),
  })
}

export function useSaveWeeklyReflection() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (reflection: Omit<WeeklyReflection, 'updatedAt'>) =>
      saveWeeklyReflection(reflection),
    onSuccess: (reflection) =>
      client.setQueryData(
        weeklyReflectionQueryKeys.detail(reflection.weekStart),
        reflection,
      ),
  })
}
