import type { FinanceSnapshot } from '@/features/finance/types/finance.types'
import type { FocusTimerSnapshot } from '@/features/focus/types/focus.types'
import type { Goal } from '@/features/goals/types/goals.types'
import type { Habit, HabitLog } from '@/features/habits/types/habits.types'
import type { Note } from '@/features/notes/types/notes.types'
import type { TimeBlock } from '@/features/planner/types/planner.types'
import type { Subscription } from '@/features/subscriptions/types/subscriptions.types'
import type { Task } from '@/features/tasks/types/tasks.types'
import type { Activity, ActivityGroup } from '@/features/activity/types/activity.types'
import { APP_ROUTES } from '@/lib/routes'

type ActivitySources = {
  finance: FinanceSnapshot
  focusSnapshot: FocusTimerSnapshot
  goals: Goal[]
  habitLogs: HabitLog[]
  habits: Habit[]
  notes: Note[]
  plannerBlocks: TimeBlock[]
  subscriptions: Subscription[]
  tasks: Task[]
}

function isValidTimestamp(value: string | undefined): value is string {
  return Boolean(value && !Number.isNaN(Date.parse(value)))
}

export function createActivities({
  finance,
  focusSnapshot,
  goals,
  habitLogs,
  habits,
  notes,
  plannerBlocks,
  subscriptions,
  tasks,
}: ActivitySources): Activity[] {
  const habitNames = new Map(habits.map((habit) => [habit.id, habit.name]))
  const focusSessions: Array<{
    durationSeconds: number
    endedAt: string
    id: string
  }> = [
    ...focusSnapshot.savedSessions
      .filter(
        (session) =>
          session.status === 'completed' && isValidTimestamp(session.endedAt),
      )
      .map((session) => ({
        durationSeconds: session.durationSeconds,
        endedAt: session.endedAt!,
        id: session.id,
      })),
    ...focusSnapshot.pomodoroHistory
      .filter((session) => session.completionState === 'completed')
      .map((session) => ({
        durationSeconds: session.durationSeconds,
        endedAt: session.endedAt!,
        id: session.id,
      })),
  ]

  return [
    ...tasks
      .filter(
        (task) =>
          task.status === 'completed' && isValidTimestamp(task.completedAt),
      )
      .map((task) => ({
        category: 'productivity' as const,
        entityId: task.id,
        entityType: 'task',
        href: APP_ROUTES.tasks,
        id: `task-completed:${task.id}`,
        occurredAt: task.completedAt!,
        title: task.title,
        type: 'task_completed' as const,
      })),
    ...focusSessions.map((session) => ({
      category: 'productivity' as const,
      durationSeconds: session.durationSeconds,
      entityId: session.id,
      entityType: 'focus_session',
      href: APP_ROUTES.focus,
      id: `focus-completed:${session.id}`,
      occurredAt: session.endedAt,
      title: 'Focus session',
      type: 'focus_session_completed' as const,
    })),
    ...habitLogs
      .filter(
        (log) => log.completed && isValidTimestamp(log.updatedAt) && habitNames.has(log.habitId),
      )
      .map((log) => ({
        category: 'personal' as const,
        entityId: log.habitId,
        entityType: 'habit',
        href: APP_ROUTES.habits,
        id: `habit-completed:${log.habitId}:${log.date}`,
        occurredAt: log.updatedAt,
        title: habitNames.get(log.habitId)!,
        type: 'habit_completed' as const,
      })),
    ...goals
      .filter(
        (goal) =>
          goal.status === 'completed' && isValidTimestamp(goal.completedAt),
      )
      .map((goal) => ({
        category: 'productivity' as const,
        entityId: goal.id,
        entityType: 'goal',
        href: APP_ROUTES.goals,
        id: `goal-completed:${goal.id}`,
        occurredAt: goal.completedAt!,
        title: goal.title,
        type: 'goal_completed' as const,
      })),
    ...notes
      .filter((note) => isValidTimestamp(note.createdAt))
      .map((note) => ({
        category: 'personal' as const,
        entityId: note.id,
        entityType: 'note',
        href: APP_ROUTES.notes,
        id: `note-created:${note.id}`,
        occurredAt: note.createdAt,
        title: note.title?.trim() || note.content.slice(0, 80) || 'Untitled note',
        type: 'note_created' as const,
      })),
    ...subscriptions
      .filter((subscription) => isValidTimestamp(subscription.createdAt))
      .flatMap((subscription) => {
        const added: Activity = {
          category: 'finance',
          entityId: subscription.id,
          entityType: 'subscription',
          href: APP_ROUTES.subscriptions,
          id: `subscription-added:${subscription.id}`,
          occurredAt: subscription.createdAt,
          title: subscription.name,
          type: 'subscription_added',
        }
        if (subscription.status !== 'cancelled') return [added]
        return [
          added,
          {
            category: 'finance',
            entityId: subscription.id,
            entityType: 'subscription',
            href: APP_ROUTES.subscriptions,
            id: `subscription-cancelled:${subscription.id}`,
            occurredAt: subscription.cancellationDate ?? subscription.updatedAt,
            title: subscription.name,
            type: 'subscription_cancelled',
          },
        ]
      }),
    ...finance.transactions
      .filter(
        (transaction) =>
          transaction.type === 'expense' && isValidTimestamp(transaction.createdAt),
      )
      .map((transaction) => ({
        amount: transaction.amount,
        category: 'finance' as const,
        currency: transaction.currency,
        entityId: transaction.id,
        entityType: 'transaction',
        href: APP_ROUTES.finance,
        id: `expense-recorded:${transaction.id}`,
        occurredAt: transaction.createdAt,
        title: transaction.title,
        type: 'expense_recorded' as const,
      })),
    ...plannerBlocks
      .filter(
        (block) => block.status === 'completed' && isValidTimestamp(block.updatedAt),
      )
      .map((block) => ({
        category: 'productivity' as const,
        entityId: block.id,
        entityType: 'time_block',
        href: APP_ROUTES.planner,
        id: `planner-block-completed:${block.id}`,
        occurredAt: block.updatedAt,
        title: block.title,
        type: 'planner_block_completed' as const,
      })),
  ].sort(
    (left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
  )
}

export function getLocalActivityDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function groupActivitiesByDate(activities: Activity[]): ActivityGroup[] {
  const groups = new Map<string, Activity[]>()
  for (const activity of activities) {
    const date = getLocalActivityDate(activity.occurredAt)
    groups.set(date, [...(groups.get(date) ?? []), activity])
  }
  return [...groups.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, items]) => ({ date, items }))
}
