import { useQuery } from '@tanstack/react-query'
import { getCalendarItems } from '@/features/calendar/services/calendar.service'

export const calendarQueryKeys = {
  range: (from: string, to: string) => ['calendar', from, to] as const,
}

export function useCalendar(from: string, to: string) {
  const query = useQuery({
    queryFn: () => getCalendarItems({ from, to }),
    queryKey: calendarQueryKeys.range(from, to),
  })
  return {
    isError: query.isError,
    isPending: query.isPending,
    items: query.data ?? [],
    refetch: query.refetch,
  }
}
