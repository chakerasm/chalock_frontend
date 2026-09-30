import type { AppRoute } from '@/lib/routes'

export type SearchResultType =
  | 'task'
  | 'note'
  | 'goal'
  | 'habit'
  | 'planner'
  | 'reminder'
  | 'subscription'
  | 'transaction'

export type SearchResult = {
  href: AppRoute
  id: string
  metadata?: string
  subtitle?: string
  title: string
  type: SearchResultType
}

export type SearchResultGroup = {
  results: SearchResult[]
  type: SearchResultType
}
