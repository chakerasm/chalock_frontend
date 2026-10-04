import { createFileRoute } from '@tanstack/react-router'
import { LandingPage } from '@/features/landing/pages/LandingPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/')({
  component: LandingPage,
  errorComponent: RouteError,
})
