import {
  createRootRouteWithContext,
  Navigate,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { AppShell } from '@/components/shared/AppShell/AppShell'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import type { AuthContextValue } from '@/features/auth/components/AuthProvider'
import { NotFoundPage } from '@/components/shared/NotFoundPage/NotFoundPage'

export const Route = createRootRouteWithContext<{ auth: AuthContextValue }>()({
  beforeLoad: ({ context, location }) => {
    if (
      location.pathname !== '/login' &&
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

  if (location.pathname === '/login') return <Outlet />
  if (auth.status !== 'authenticated') {
    return <Navigate search={{ redirect: location.href }} to="/login" />
  }

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
