import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  errorComponent: RouteError,
})
