import { calendarItemsFromAPISchema } from '@/features/calendar/schemas/calendar.schemas'
import type {
  CalendarItemFromAPI,
  CalendarQuery,
} from '@/features/calendar/types/calendar.types'
import { apiFetch } from '@/lib/api/client'
import { parseApiJson } from '@/lib/api/response'

export function getCalendarItemsFromAPI({
  from,
  to,
}: CalendarQuery): Promise<CalendarItemFromAPI[]> {
  const query = new URLSearchParams({ from, to })
  return parseApiJson(
    apiFetch(`/api/v1/calendar?${query}`),
    calendarItemsFromAPISchema,
  )
}
