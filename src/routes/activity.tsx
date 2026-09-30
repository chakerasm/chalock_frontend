import { createFileRoute } from '@tanstack/react-router'
import { ActivityPage } from '@/features/activity/pages/ActivityPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/activity')({
  component: ActivityPage,
  errorComponent: RouteError,
})
