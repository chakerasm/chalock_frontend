import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createTimeBlock,
  deleteTimeBlock,
  getAllTimeBlocks,
  getTimeBlocks,
  updateTimeBlock,
} from '@/features/planner/services/planner.service'
import type {
  CreateTimeBlockInput,
  UpdateTimeBlockInput,
} from '@/features/planner/types/planner.types'

export const plannerQueryKeys = {
  all: ['planner'] as const,
  allBlocks: (from: string, to: string) =>
    ['planner', 'all-blocks', from, to] as const,
  day: (date: string) => [...plannerQueryKeys.all, 'day', date] as const,
}

export function useAllTimeBlocks(from: string, to: string) {
  return useQuery({
    queryFn: () => getAllTimeBlocks(from, to),
    queryKey: plannerQueryKeys.allBlocks(from, to),
  })
}

export function useTimeBlocks(date: string, enabled = true) {
  return useQuery({
    enabled,
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
