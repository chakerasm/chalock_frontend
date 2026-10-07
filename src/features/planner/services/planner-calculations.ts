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
  const duration = timeToMinutes(block.endTime) - timeToMinutes(block.startTime)
  return duration > 0 ? duration : duration + 24 * 60
}

export type TimeBlockTimelineLayout = {
  lane: number
  laneCount: number
}

export function getTimeBlockTimelineLayout(blocks: TimeBlock[]) {
  const layouts = new Map<string, TimeBlockTimelineLayout>()
  const sortedBlocks = sortTimeBlocks(blocks).filter(
    (block) => block.status !== 'cancelled',
  )

  let group: TimeBlock[] = []
  let groupEnd = -1
  const assignGroup = () => {
    const laneEnds: number[] = []
    const lanes = group.map((block) => {
      const start = timeToMinutes(block.startTime)
      const lane = laneEnds.findIndex((end) => end <= start)
      const laneIndex = lane === -1 ? laneEnds.length : lane
      laneEnds[laneIndex] =
        timeToMinutes(block.startTime) + getTimeBlockDurationMinutes(block)
      return [block.id, laneIndex] as const
    })
    lanes.forEach(([id, lane]) =>
      layouts.set(id, { lane, laneCount: laneEnds.length }),
    )
  }

  sortedBlocks.forEach((block) => {
    const start = timeToMinutes(block.startTime)
    const end = start + getTimeBlockDurationMinutes(block)
    if (group.length && start >= groupEnd) {
      assignGroup()
      group = []
      groupEnd = -1
    }
    group.push(block)
    groupEnd = Math.max(groupEnd, end)
  })
  if (group.length) assignGroup()

  return layouts
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

export function isTimeBlockPassed(block: TimeBlock, now = new Date()) {
  if (block.status === 'completed' || block.status === 'cancelled') return false
  return new Date(`${block.date}T${block.endTime}`).getTime() < now.getTime()
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
