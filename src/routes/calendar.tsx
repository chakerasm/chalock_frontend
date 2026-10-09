import { createFileRoute } from '@tanstack/react-router'
import { CalendarPageDesign } from '@/features/calendar/pages/CalendarPageDesign'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/calendar')({
  component: CalendarPageDesign,
  errorComponent: RouteError,
})
