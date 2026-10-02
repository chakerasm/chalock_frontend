import {
  createRootRouteWithContext,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { AppShell } from '@/components/shared/AppShell/AppShell'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { NotFoundPage } from '@/components/shared/NotFoundPage/NotFoundPage'
import type { AuthContextValue } from '@/features/auth/components/AuthProvider'

export const Route = createRootRouteWithContext<{ auth: AuthContextValue }>()({
  beforeLoad: ({ context, location }) => {
    if (
      location.pathname !== '/login' &&
      location.pathname !== '/register' &&
      context.auth.status !== 'authenticated'
    ) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: RootComponent,
  errorComponent: RootError,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  const { auth } = Route.useRouteContext()
  const location = useRouterState({ select: (state) => state.location })

  if (location.pathname === '/login' || location.pathname === '/register')
    return <Outlet />

  return (
    <AppShell onLogout={() => void auth.signOut()}>
      <Outlet />
    </AppShell>
  )
}

function RootError() {
  const router = useRouter()
  return <ErrorState onRetry={() => void router.invalidate()} />
}
