import type {
  TimeBlock,
  TimeBlockFromAPI,
} from '@/features/planner/types/planner.types'

export const mapTimeBlockFromAPI = (block: TimeBlockFromAPI): TimeBlock => ({
  ...block,
})

export const mapTimeBlockToAPI = (block: TimeBlock): TimeBlockFromAPI => ({
  ...block,
})
