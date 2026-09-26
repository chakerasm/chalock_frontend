import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router'
import { AppProviders } from '@/app/providers'
import { AppShell } from '@/components/shared/AppShell/AppShell'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { NotFoundPage } from '@/components/shared/NotFoundPage/NotFoundPage'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: RootError,
})

function RootComponent() {
  return (
    <AppProviders>
      <AppShell>
        <Outlet />
      </AppShell>
    </AppProviders>
  )
}

function RootError() {
  const router = useRouter()

  return <ErrorState onRetry={() => void router.invalidate()} />
}
