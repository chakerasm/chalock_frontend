import { useQuery } from '@tanstack/react-query'
import {
  getExampleFutureDetailFromAPI,
  getExampleFutureItemsFromAPI,
} from '@/features/example-future/api/example-future.api'
import { mapExampleFutureItemFromAPI } from '@/features/example-future/mappers/example-future.mapper'
import { mapExampleFutureDetailFromAPI } from '@/features/example-future/mappers/example-future-detail.mapper'
import type {
  ExampleFutureDetail,
  ExampleFutureItem,
} from '@/features/example-future/types/example-future.types'

export const exampleFutureQueryKeys = {
  all: ['example-future'] as const,
  detail: (itemId: string) =>
    [...exampleFutureQueryKeys.all, 'detail', itemId] as const,
  items: () => [...exampleFutureQueryKeys.all, 'items'] as const,
}

export async function getExampleFutureItems(): Promise<ExampleFutureItem[]> {
  const items = await getExampleFutureItemsFromAPI()

  return items.map(mapExampleFutureItemFromAPI)
}

export async function getExampleFutureDetail(
  itemId: string,
): Promise<ExampleFutureDetail> {
  const detail = await getExampleFutureDetailFromAPI(itemId)

  return mapExampleFutureDetailFromAPI(detail)
}

export function useExampleFutureItems() {
  return useQuery({
    queryFn: getExampleFutureItems,
    queryKey: exampleFutureQueryKeys.items(),
  })
}

export function useExampleFutureDetail(itemId: string) {
  return useQuery({
    queryFn: () => getExampleFutureDetail(itemId),
    queryKey: exampleFutureQueryKeys.detail(itemId),
  })
}
