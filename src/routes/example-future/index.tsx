import { createFileRoute } from '@tanstack/react-router'
import { ExampleFuturePage } from '@/features/example-future/pages/ExampleFuturePage'

export const Route = createFileRoute('/example-future/')({
  component: ExampleFuturePage,
})
