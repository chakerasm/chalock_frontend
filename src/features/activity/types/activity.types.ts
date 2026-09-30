export type ActivityCategory = 'productivity' | 'finance' | 'personal'

export type ActivityType =
  | 'task_completed'
  | 'focus_session_completed'
  | 'habit_completed'
  | 'goal_completed'
  | 'note_created'
  | 'subscription_added'
  | 'subscription_cancelled'
  | 'expense_recorded'
  | 'planner_block_completed'

export type Activity = {
  id: string
  type: ActivityType
  category: ActivityCategory
  entityType: string
  entityId: string
  title: string
  description?: string
  occurredAt: string
  href?: string
  durationSeconds?: number
  amount?: number
  currency?: string
}

export type ActivityGroup = {
  date: string
  items: Activity[]
}
