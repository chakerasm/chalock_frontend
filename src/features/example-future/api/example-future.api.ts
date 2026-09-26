import {
  exampleFutureDetailFromAPISchema,
  exampleFutureItemsFromAPISchema,
} from '@/features/example-future/schemas/example-future.schemas'
import type {
  ExampleFutureDetailFromAPI,
  ExampleFutureItemFromAPI,
} from '@/features/example-future/types/example-future.types'

const exampleFutureItemsEndpoint = '/api/example-future/items'

export async function getExampleFutureItemsFromAPI(): Promise<
  ExampleFutureItemFromAPI[]
> {
  const response = await fetch(exampleFutureItemsEndpoint)

  if (!response.ok) {
    throw new Error('Unable to load example future items.')
  }

  return exampleFutureItemsFromAPISchema.parse(await response.json())
}

export async function getExampleFutureDetailFromAPI(
  itemId: string,
): Promise<ExampleFutureDetailFromAPI> {
  const response = await fetch(
    `${exampleFutureItemsEndpoint}/${encodeURIComponent(itemId)}`,
  )

  if (!response.ok) {
    throw new Error('Unable to load example future details.')
  }

  return exampleFutureDetailFromAPISchema.parse(await response.json())
}
