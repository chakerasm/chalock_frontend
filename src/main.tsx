import { RouterProvider } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/app/providers'
import { LoadingState } from '@/components/shared/LoadingState/LoadingState'
import { AuthProvider, useAuth } from '@/features/auth/components/AuthProvider'
import { getRouter } from './router'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('The application root element is missing.')
}

const routerPromise = initializeRouter()

function AuthenticatedRouter({
  router,
}: {
  router: ReturnType<typeof getRouter>
}) {
  const auth = useAuth()

  useEffect(() => {
    if (auth.status !== 'loading') void router.invalidate()
  }, [auth.status, router])

  if (auth.status === 'loading') return <LoadingState fullScreen />
  return <RouterProvider context={{ auth }} router={router} />
}

function Application() {
  const [router, setRouter] = useState<ReturnType<typeof getRouter> | null>(
    null,
  )

  useEffect(() => {
    let isMounted = true
    void routerPromise.then((initializedRouter) => {
      if (isMounted) setRouter(initializedRouter)
    })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <AppProviders>
      <Analytics />
      {router ? (
        <AuthProvider>
          <AuthenticatedRouter router={router} />
        </AuthProvider>
      ) : (
        <LoadingState fullScreen />
      )}
    </AppProviders>
  )
}

async function initializeRouter() {
  return getRouter()
}

createRoot(rootElement).render(
  <StrictMode>
    <Application />
  </StrictMode>,
)
