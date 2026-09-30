import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTimeBlock,
  deleteTimeBlock,
  getTimeBlocks,
  updateTimeBlock,
} from '@/features/planner/services/planner.service'
import type {
  CreateTimeBlockInput,
  UpdateTimeBlockInput,
} from '@/features/planner/types/planner.types'

export const plannerQueryKeys = {
  all: ['planner'] as const,
  day: (date: string) => [...plannerQueryKeys.all, 'day', date] as const,
}

export function useTimeBlocks(date: string) {
  return useQuery({
    queryFn: () => getTimeBlocks(date),
    queryKey: plannerQueryKeys.day(date),
  })
}

function usePlannerMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: plannerQueryKeys.all }),
  })
}

export const useCreateTimeBlock = () =>
  usePlannerMutation<CreateTimeBlockInput>(createTimeBlock)
export const useUpdateTimeBlock = () =>
  usePlannerMutation<UpdateTimeBlockInput>(updateTimeBlock)
export const useDeleteTimeBlock = () =>
  usePlannerMutation<string>(deleteTimeBlock)
