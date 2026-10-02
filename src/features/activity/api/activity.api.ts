import { z } from 'zod'
import type {
  Activity,
  ActivityCategory,
  ActivityType,
} from '@/features/activity/types/activity.types'
import { apiFetch } from '@/lib/api/client'

const activityTypeSchema = z.enum([
  'task_completed',
  'focus_session_completed',
  'habit_completed',
  'goal_completed',
  'note_created',
  'subscription_added',
  'subscription_cancelled',
  'expense_recorded',
  'planner_block_completed',
])

const activityFromAPISchema = z.object({
  id: z.string().min(1),
  type: activityTypeSchema,
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  title: z.string(),
  description: z.string().optional(),
  occurredAt: z.string().datetime(),
  href: z.string().startsWith('/').optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
  amount: z.number().optional(),
  currency: z.string().length(3).optional(),
})
const responseSchema = z.object({
  items: z.array(activityFromAPISchema),
  nextCursor: z.string().nullable(),
})

function categoryFor(type: ActivityType): ActivityCategory {
  if (type === 'expense_recorded' || type.startsWith('subscription_'))
    return 'finance'
  if (type === 'habit_completed' || type === 'note_created') return 'personal'
  return 'productivity'
}

export async function getActivityFromAPI(): Promise<Activity[]> {
  const response = responseSchema.parse(
    await (await apiFetch('/api/activity?limit=100')).json(),
  )
  return response.items.map((item) => ({
    ...item,
    category: categoryFor(item.type),
  }))
}
