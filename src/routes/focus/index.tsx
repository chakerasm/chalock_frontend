import { createFileRoute } from '@tanstack/react-router'
import { FocusPage } from '@/features/focus/pages/FocusPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/focus/')({
  component: FocusPage,
  errorComponent: RouteError,
})
