import { createFileRoute } from '@tanstack/react-router'
import { ExampleFutureDetailPage } from '@/features/example-future/pages/ExampleFutureDetailPage'

export const Route = createFileRoute('/example-future/$itemId')({
  component: ExampleFutureDetailRoute,
})

function ExampleFutureDetailRoute() {
  const { itemId } = Route.useParams()

  return <ExampleFutureDetailPage itemId={itemId} />
}
