import { createFileRoute } from '@tanstack/react-router'
import { WeeklyPlanningPage } from '@/features/weekly-planning/pages/WeeklyPlanningPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/weekly-planning')({
  component: WeeklyPlanningPage,
  errorComponent: RouteError,
})
