import {
  getTimeBlocksFromStorage,
  saveTimeBlocksToStorage,
} from '@/features/planner/api/planner.local-storage'
import {
  mapTimeBlockFromAPI,
  mapTimeBlockToAPI,
} from '@/features/planner/mappers/planner.mapper'
import { createTimeBlockInputSchema } from '@/features/planner/schemas/planner.schemas'
import { getSettingsSnapshotSync } from '@/features/settings/services/settings.service'
import { sortTimeBlocks } from '@/features/planner/services/planner-calculations'
import type {
  CreateTimeBlockInput,
  TimeBlock,
  UpdateTimeBlockInput,
} from '@/features/planner/types/planner.types'

function createId() {
  return `time-block-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`
}

function now() {
  return new Date().toISOString()
}

function save(blocks: TimeBlock[]) {
  saveTimeBlocksToStorage(blocks.map(mapTimeBlockToAPI))
}

export async function getTimeBlocks(date: string): Promise<TimeBlock[]> {
  return sortTimeBlocks(
    getTimeBlocksFromStorage()
      .map(mapTimeBlockFromAPI)
      .filter((block) => block.date === date),
  )
}

export async function createTimeBlock(input: CreateTimeBlockInput) {
  const request = createTimeBlockInputSchema(
    getSettingsSnapshotSync().settings.planning.timeIncrementMinutes,
  ).parse(input)
  const timestamp = now()
  const block: TimeBlock = {
    ...request,
    createdAt: timestamp,
    id: createId(),
    status: 'planned',
    updatedAt: timestamp,
  }
  const blocks = getTimeBlocksFromStorage().map(mapTimeBlockFromAPI)
  save([...blocks, block])
  return block
}

export async function updateTimeBlock({
  timeBlockId,
  ...input
}: UpdateTimeBlockInput) {
  const blocks = getTimeBlocksFromStorage().map(mapTimeBlockFromAPI)
  const current = blocks.find((block) => block.id === timeBlockId)
  if (!current) throw new Error('Time block not found.')

  const request = createTimeBlockInputSchema(
    getSettingsSnapshotSync().settings.planning.timeIncrementMinutes,
  ).parse({ ...current, ...input })
  const block: TimeBlock = {
    ...current,
    ...request,
    focusSessionId: input.focusSessionId ?? current.focusSessionId,
    status: input.status ?? current.status,
    updatedAt: now(),
  }
  save(blocks.map((item) => (item.id === timeBlockId ? block : item)))
  return block
}

export async function deleteTimeBlock(timeBlockId: string) {
  const blocks = getTimeBlocksFromStorage().map(mapTimeBlockFromAPI)
  if (!blocks.some((block) => block.id === timeBlockId))
    throw new Error('Time block not found.')
  save(blocks.filter((block) => block.id !== timeBlockId))
}
