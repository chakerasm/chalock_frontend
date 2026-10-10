import {
  plannerDayEndHour,
  plannerDayStartHour,
  plannerSlotMinutes,
  timeToMinutes,
} from '@/features/planner/services/planner-calculations'
import type { TimeBlock } from '@/features/planner/types/planner.types'

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function getPlanningWeekDates(now = new Date()) {
  const firstDay = new Date(now)
  firstDay.setHours(12, 0, 0, 0)
  const daysSinceMonday = (firstDay.getDay() + 6) % 7
  firstDay.setDate(firstDay.getDate() - daysSinceMonday)

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(firstDay)
    day.setDate(firstDay.getDate() + index)
    return toDateKey(day)
  })
}

export function minutesToTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export function getEndTime(startTime: string, durationMinutes: number) {
  return minutesToTime(timeToMinutes(startTime) + durationMinutes)
}

export function getSuggestedStartTime(
  blocks: Pick<TimeBlock, 'date' | 'endTime' | 'startTime' | 'status'>[],
  date: string,
  durationMinutes: number,
) {
  const dayBlocks = blocks.filter(
    (block) => block.date === date && block.status !== 'cancelled',
  )
  const firstMinute = plannerDayStartHour * 60
  const lastMinute = plannerDayEndHour * 60

  for (
    let start = firstMinute;
    start + durationMinutes <= lastMinute;
    start += plannerSlotMinutes
  ) {
    const end = start + durationMinutes
    const overlaps = dayBlocks.some(
      (block) =>
        start < timeToMinutes(block.endTime) &&
        end > timeToMinutes(block.startTime),
    )
    if (!overlaps) return minutesToTime(start)
  }

  return undefined
}
