import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { StatisticsPage } from '@/features/statistics/pages/StatisticsPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/statistics')({
  validateSearch: z.object({
    range: z
      .enum(['last-7-days', 'last-30-days', 'this-month'])
      .catch('last-7-days'),
  }),
  component: StatisticsPage,
  errorComponent: RouteError,
})
