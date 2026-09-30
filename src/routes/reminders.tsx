import { createFileRoute } from '@tanstack/react-router'
import { RemindersPage } from '@/features/reminders/pages/RemindersPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/reminders')({
  component: RemindersPage,
  errorComponent: RouteError,
})
