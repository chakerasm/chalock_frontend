import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/focus')({
  component: FocusLayout,
})

function FocusLayout() {
  return <Outlet />
}
