import type {
  ExampleFutureDetail,
  ExampleFutureDetailFromAPI,
} from '@/features/example-future/types/example-future.types'
import { mapDateToUI } from '@/lib/mappers/date.mapper'

export function mapExampleFutureDetailFromAPI(
  detail: ExampleFutureDetailFromAPI,
): ExampleFutureDetail {
  return mapExampleFutureDetailToUI(detail)
}

export function mapExampleFutureDetailToUI(
  detail: ExampleFutureDetailFromAPI,
): ExampleFutureDetail {
  return {
    ...detail,
    createdAt: mapDateToUI(detail.createdAt),
    updatedAt: mapDateToUI(detail.updatedAt),
  }
}
