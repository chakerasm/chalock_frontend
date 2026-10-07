import { z } from 'zod'
import type {
  SearchResult,
  SearchResultType,
} from '@/features/global-search/types/global-search.types'
import { apiFetch } from '@/lib/api/client'
import { APP_ROUTES } from '@/lib/routes'

const typeSchema = z.enum([
  'task',
  'note',
  'goal',
  'habit',
  'planner',
  'reminder',
  'subscription',
  'transaction',
])
const responseSchema = z.object({
  results: z.array(
    z.object({
      id: z.string().min(1),
      type: typeSchema,
      title: z.string(),
      subtitle: z.string().optional(),
      metadata: z.string().optional(),
      href: z.string().startsWith('/'),
    }),
  ),
  nextCursor: z.string().nullable(),
})

const routesByType: Record<SearchResultType, SearchResult['href']> = {
  goal: APP_ROUTES.goals,
  habit: APP_ROUTES.habits,
  note: APP_ROUTES.notes,
  planner: APP_ROUTES.planner,
  reminder: APP_ROUTES.reminders,
  subscription: APP_ROUTES.subscriptions,
  task: APP_ROUTES.tasks,
  transaction: APP_ROUTES.financeTransactions,
}

export async function searchFromAPI(query: string): Promise<SearchResult[]> {
  const response = responseSchema.parse(
    await (
      await apiFetch(`/api/search?${new URLSearchParams({ q: query })}`)
    ).json(),
  )
  return response.results.map((result) => ({
    ...result,
    href: routesByType[result.type],
    type: result.type,
  }))
}
