import { createFileRoute } from '@tanstack/react-router'
import { TodayDashboardPage } from '@/features/today/pages/TodayDashboardPage'

export const Route = createFileRoute('/')({ component: TodayDashboardPage })
