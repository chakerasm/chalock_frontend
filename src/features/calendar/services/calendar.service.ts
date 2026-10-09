import { getCalendarItemsFromAPI } from '@/features/calendar/api/calendar.api'
import { mapCalendarItemFromAPI } from '@/features/calendar/mappers/calendar.mapper'
import type { CalendarQuery } from '@/features/calendar/types/calendar.types'
const localDate = (value: string) => value.slice(0, 10)

export function getCalendarRange(anchor: Date, view: 'month' | 'week') {
  const start = new Date(anchor)
  if (view === 'month') {
    start.setDate(1)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(end.getDate() + 41)
    return {
      from: localDate(start.toISOString()),
      to: localDate(end.toISOString()),
    }
  }
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return {
    from: localDate(start.toISOString()),
    to: localDate(end.toISOString()),
  }
}

export async function getCalendarItems(query: CalendarQuery) {
  return (await getCalendarItemsFromAPI(query))
    .map(mapCalendarItemFromAPI)
    .sort(
      (a, b) =>
        a.start.localeCompare(b.start) || a.title.localeCompare(b.title),
    )
}
