import { createFileRoute } from '@tanstack/react-router'
import { TemplatesPage } from '@/features/templates/pages/TemplatesPage'
import { RouteError } from '@/routes/-route-error'
export const Route = createFileRoute('/templates')({ component: TemplatesPage, errorComponent: RouteError })
