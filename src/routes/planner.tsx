import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { PlannerPage } from '@/features/planner/pages/PlannerPage'
import { getLocalDate } from '@/features/planner/services/planner-calculations'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/planner')({
  component: PlannerRoute,
  errorComponent: RouteError,
  validateSearch: z.object({ date: z.string().date().optional() }),
})

function PlannerRoute() {
  const { date } = Route.useSearch()
  const navigate = useNavigate({ from: '/planner' })
  return (
    <PlannerPage
      onSelectedDateChange={(nextDate) =>
        navigate({ search: (previous) => ({ ...previous, date: nextDate }) })
      }
      selectedDate={date ?? getLocalDate()}
    />
  )
}
