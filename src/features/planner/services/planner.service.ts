import {
  createTimeBlockFromAPI,
  deleteTimeBlockFromAPI,
  getTimeBlocksFromAPI,
  updateTimeBlockFromAPI,
} from '@/features/planner/api/planner.api'
import { mapTimeBlockFromAPI } from '@/features/planner/mappers/planner.mapper'
import { createTimeBlockInputSchema } from '@/features/planner/schemas/planner.schemas'
import { sortTimeBlocks } from '@/features/planner/services/planner-calculations'
import type {
  CreateTimeBlockInput,
  TimeBlock,
  UpdateTimeBlockInput,
} from '@/features/planner/types/planner.types'
const increment = 15
export async function getAllTimeBlocks(): Promise<TimeBlock[]> {
  return (await getTimeBlocksFromAPI())
    .map(mapTimeBlockFromAPI)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
    )
}
export async function getTimeBlocks(date: string): Promise<TimeBlock[]> {
  return sortTimeBlocks(
    (await getTimeBlocksFromAPI(`?date=${encodeURIComponent(date)}`)).map(
      mapTimeBlockFromAPI,
    ),
  )
}
export async function createTimeBlock(input: CreateTimeBlockInput) {
  return mapTimeBlockFromAPI(
    await createTimeBlockFromAPI(
      createTimeBlockInputSchema(increment).parse(input),
    ),
  )
}
export async function updateTimeBlock(input: UpdateTimeBlockInput) {
  return mapTimeBlockFromAPI(await updateTimeBlockFromAPI(input))
}
export function deleteTimeBlock(id: string) {
  return deleteTimeBlockFromAPI(id)
}
