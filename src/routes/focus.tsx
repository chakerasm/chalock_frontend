import { createFileRoute, Outlet } from '@tanstack/react-router'
import { RouteError } from '@/routes/-route-error'

export const Route = createFileRoute('/focus')({
  component: FocusLayout,
  errorComponent: RouteError,
})

function FocusLayout() {
  return <Outlet />
}
