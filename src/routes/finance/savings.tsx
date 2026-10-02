import { createFileRoute } from '@tanstack/react-router'
import { FinancePage } from '@/features/finance/pages/FinancePage'
import { RouteError } from '@/routes/-route-error'
export const Route = createFileRoute('/finance/savings')({ component: () => <FinancePage initialSection="savings" />, errorComponent: RouteError })
