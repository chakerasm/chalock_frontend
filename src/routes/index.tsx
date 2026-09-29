import { createFileRoute } from '@tanstack/react-router'
import { TodayDashboardPage } from '@/features/today/pages/TodayDashboardPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/')({
  component: TodayDashboardPage,
  errorComponent: RouteError,
})
