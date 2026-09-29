import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SubscriptionsPage } from '@/features/subscriptions/pages/SubscriptionsPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/subscriptions')({
  validateSearch: z.object({ subscriptionId: z.string().optional() }),
  component: SubscriptionsPage,
  errorComponent: RouteError,
})
