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

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context, search }) => {
    if (context.auth.status === 'authenticated')
      throw redirect({ to: sanitizeRedirect(search.redirect) })
  },
  component: RegisterRoute,
  errorComponent: RouteError,
  validateSearch: z.object({ redirect: z.string().optional() }),
})

function RegisterRoute() {
  const navigate = useNavigate({ from: '/register' })
  const { redirect: returnTo } = Route.useSearch()

  return (
    <LoginPage
      mode="register"
      onSuccess={() =>
        navigate({ to: sanitizeRedirect(returnTo), replace: true })
      }
    />
  )
}
