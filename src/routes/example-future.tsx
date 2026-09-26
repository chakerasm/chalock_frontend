import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/example-future')({
  component: Outlet,
})
