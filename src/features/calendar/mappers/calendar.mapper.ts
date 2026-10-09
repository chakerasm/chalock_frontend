import type {
  CalendarItem,
  CalendarItemFromAPI,
} from '@/features/calendar/types/calendar.types'

export function mapCalendarItemFromAPI(
  item: CalendarItemFromAPI,
): CalendarItem {
  return { ...item }
}

export function mapCalendarItemToAPI(item: CalendarItem): CalendarItemFromAPI {
  return { ...item }
}
