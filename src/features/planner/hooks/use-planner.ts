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
  DeleteTimeBlockInput,
  UpdateTimeBlockInput,
} from '@/features/planner/types/planner.types'

export const plannerQueryKeys = {
  all: ['planner'] as const,
  allBlocks: (from: string, to: string, timezone: string) =>
    ['planner', 'all-blocks', from, to, timezone] as const,
  day: (date: string, timezone: string) =>
    [...plannerQueryKeys.all, 'day', date, timezone] as const,
}

function detectedTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function useAllTimeBlocks(
  from: string,
  to: string,
  timezone = detectedTimezone(),
) {
  return useQuery({
    queryFn: () => getAllTimeBlocks(from, to),
    queryKey: plannerQueryKeys.allBlocks(from, to, timezone),
  })
}

export function useTimeBlocks(
  date: string,
  enabled = true,
  timezone = detectedTimezone(),
) {
  return useQuery({
    enabled,
    queryFn: () => getTimeBlocks(date),
    queryKey: plannerQueryKeys.day(date, timezone),
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
  usePlannerMutation<DeleteTimeBlockInput>(deleteTimeBlock)
