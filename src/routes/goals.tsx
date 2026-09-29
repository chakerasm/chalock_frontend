import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { GoalsPage } from '@/features/goals/pages/GoalsPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/goals')({
  validateSearch: z.object({ goalId: z.string().optional() }),
  component: GoalsPage,
  errorComponent: RouteError,
})
