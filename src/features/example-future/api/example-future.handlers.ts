import { HttpResponse, http } from 'msw'
import {
  exampleFutureDetailsMock,
  exampleFutureItemsMock,
} from '@/features/example-future/api/example-future.mock'

export const exampleFutureHandlers = [
  http.get('/api/example-future/items', () =>
    HttpResponse.json(exampleFutureItemsMock),
  ),
  http.get('/api/example-future/items/:itemId', ({ params }) => {
    const item = exampleFutureDetailsMock.find(
      (detail) => detail.id === params.itemId,
    )

    if (!item) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return HttpResponse.json(item)
  }),
]
