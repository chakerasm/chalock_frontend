import type {
  ExampleFutureItem,
  ExampleFutureItemFromAPI,
} from '@/features/example-future/types/example-future.types'

export function mapExampleFutureItemFromAPI(
  item: ExampleFutureItemFromAPI,
): ExampleFutureItem {
  return { ...item }
}

export function mapExampleFutureItemToAPI(
  item: ExampleFutureItem,
): ExampleFutureItemFromAPI {
  return { ...item }
}
