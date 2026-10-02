import { z } from 'zod'
import type {
  SearchResult,
  SearchResultType,
} from '@/features/global-search/types/global-search.types'
import { apiFetch } from '@/lib/api/client'

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
export async function searchFromAPI(query: string): Promise<SearchResult[]> {
  const response = responseSchema.parse(
    await (
      await apiFetch(`/api/search?${new URLSearchParams({ q: query })}`)
    ).json(),
  )
  return response.results.map((result) => ({
    ...result,
    type: result.type as SearchResultType,
    href: result.href as SearchResult['href'],
  }))
}
