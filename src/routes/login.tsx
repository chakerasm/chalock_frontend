import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { LoginPage } from '@/features/auth/components/LoginPage'
import { RouteError } from '@/routes/-route-error'

function sanitizeRedirect(value: unknown) {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//')
    ? value
    : '/today'
}

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context, search }) => {
    if (context.auth.status === 'authenticated')
      throw redirect({ to: sanitizeRedirect(search.redirect) })
  },
  component: LoginRoute,
  errorComponent: RouteError,
  validateSearch: z.object({ redirect: z.string().optional() }),
})

function LoginRoute() {
  const navigate = useNavigate({ from: '/login' })
  const { redirect: returnTo } = Route.useSearch()

  return (
    <LoginPage
      onSuccess={() =>
        navigate({ to: sanitizeRedirect(returnTo), replace: true })
      }
    />
  )
}
