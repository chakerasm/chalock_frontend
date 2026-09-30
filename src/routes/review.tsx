import { createFileRoute } from '@tanstack/react-router'
import { WeeklyReviewPage } from '@/features/weekly-review/pages/WeeklyReviewPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/review')({
  component: WeeklyReviewPage,
  errorComponent: RouteError,
})
