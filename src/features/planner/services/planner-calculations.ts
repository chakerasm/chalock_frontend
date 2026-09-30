import type { StartFocusTimerInput } from '@/features/focus/types/focus.types'
import type { TimeBlock } from '@/features/planner/types/planner.types'

export const plannerDayStartHour = 6
export const plannerDayEndHour = 23
export const plannerSlotMinutes = 15

export function getLocalDate(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function getTimeBlockDurationMinutes(
  block: Pick<TimeBlock, 'endTime' | 'startTime'>,
) {
  return timeToMinutes(block.endTime) - timeToMinutes(block.startTime)
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (!hours) return `${remainingMinutes}m`
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

export function isTimeBlockCurrent(block: TimeBlock, now = new Date()) {
  return (
    block.date === getLocalDate(now) &&
    timeToMinutes(block.startTime) <= now.getHours() * 60 + now.getMinutes() &&
    now.getHours() * 60 + now.getMinutes() < timeToMinutes(block.endTime) &&
    block.status !== 'cancelled' &&
    block.status !== 'completed'
  )
}

export function findTimeBlockOverlaps(
  blocks: TimeBlock[],
  candidate: Pick<TimeBlock, 'date' | 'endTime' | 'startTime'>,
  excludedId?: string,
) {
  const start = timeToMinutes(candidate.startTime)
  const end = timeToMinutes(candidate.endTime)
  return blocks.filter(
    (block) =>
      block.id !== excludedId &&
      block.date === candidate.date &&
      block.status !== 'cancelled' &&
      start < timeToMinutes(block.endTime) &&
      end > timeToMinutes(block.startTime),
  )
}

export function getFocusTimerInputForTimeBlock(
  block: TimeBlock,
  now = new Date(),
): StartFocusTimerInput & { plannedDurationSeconds: number; type: 'timer' } {
  const remainingMinutes = Math.max(
    1,
    Math.round(
      (new Date(`${block.date}T${block.endTime}`).getTime() - now.getTime()) /
        60_000,
    ),
  )
  const minutes = isTimeBlockCurrent(block, now)
    ? remainingMinutes
    : getTimeBlockDurationMinutes(block)

  return {
    goalId: block.goalId,
    plannedDurationSeconds: minutes * 60,
    taskId: block.taskId,
    type: 'timer',
  }
}
export function sortTimeBlocks(blocks: TimeBlock[]) {
  return [...blocks].sort(
    (left, right) =>
      timeToMinutes(left.startTime) - timeToMinutes(right.startTime) ||
      left.title.localeCompare(right.title),
  )
}
