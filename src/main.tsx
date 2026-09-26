import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getRouter } from './router'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('The application root element is missing.')
}

const applicationRoot = rootElement

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import('@/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const router = getRouter()

  createRoot(applicationRoot).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

void bootstrap()
