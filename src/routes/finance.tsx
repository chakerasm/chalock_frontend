import { createFileRoute } from '@tanstack/react-router'
import { FinancePage } from '@/features/finance/pages/FinancePage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/finance')({
  component: FinancePage,
  errorComponent: RouteError,
})
