import type {
  FinanceSnapshot,
  Transaction,
} from '@/features/finance/types/finance.types'
import type { Goal } from '@/features/goals/types/goals.types'
import type { Habit } from '@/features/habits/types/habits.types'
import type { Note } from '@/features/notes/types/notes.types'
import type { TimeBlock } from '@/features/planner/types/planner.types'
import type { Reminder } from '@/features/reminders/types/reminders.types'
import type { Subscription } from '@/features/subscriptions/types/subscriptions.types'
import type { Task } from '@/features/tasks/types/tasks.types'
import { APP_ROUTES } from '@/lib/routes'
import type {
  SearchResult,
  SearchResultGroup,
  SearchResultType,
} from '@/features/global-search/types/global-search.types'

export type SearchSources = {
  finance?: FinanceSnapshot
  goals?: Goal[]
  habits?: Habit[]
  notes?: Note[]
  plannerBlocks?: TimeBlock[]
  reminders?: Reminder[]
  subscriptions?: Subscription[]
  tasks?: Task[]
}

const searchTypeOrder: SearchResultType[] = [
  'task',
  'note',
  'goal',
  'habit',
  'planner',
  'reminder',
  'subscription',
  'transaction',
]

function compactText(value?: string) {
  return value?.replace(/\s+/g, ' ').trim()
}

function matches(result: SearchResult, query: string) {
  const haystack = [result.title, result.subtitle, result.metadata]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()
  return haystack.includes(query.toLocaleLowerCase())
}

function rank(result: SearchResult, query: string) {
  const title = result.title.toLocaleLowerCase()
  const normalized = query.toLocaleLowerCase()
  if (title === normalized) return 0
  if (title.startsWith(normalized)) return 1
  return 2
}

function toTransactionResult(transaction: Transaction): SearchResult {
  return {
    href: APP_ROUTES.finance,
    id: transaction.id,
    metadata: `${transaction.amount} ${transaction.currency}`,
    subtitle: transaction.description,
    title: transaction.title,
    type: 'transaction',
  }
}

export function createSearchResults(sources: SearchSources): SearchResult[] {
  return [
    ...(sources.tasks ?? []).map<SearchResult>((task) => ({
      href: APP_ROUTES.tasks,
      id: task.id,
      metadata: task.dueDate ? `Due ${task.dueDate}` : undefined,
      subtitle: compactText(task.description),
      title: task.title,
      type: 'task',
    })),
    ...(sources.notes ?? []).map<SearchResult>((note) => ({
      href: APP_ROUTES.notes,
      id: note.id,
      subtitle: compactText(note.content),
      title:
        note.title ||
        compactText(note.content)?.slice(0, 80) ||
        'Untitled note',
      type: 'note',
    })),
    ...(sources.goals ?? []).map<SearchResult>((goal) => ({
      href: APP_ROUTES.goals,
      id: goal.id,
      metadata: `${goal.progress}% complete`,
      subtitle: compactText(goal.description),
      title: goal.title,
      type: 'goal',
    })),
    ...(sources.habits ?? []).map<SearchResult>((habit) => ({
      href: APP_ROUTES.habits,
      id: habit.id,
      subtitle: compactText(habit.description),
      title: habit.name,
      type: 'habit',
    })),
    ...(sources.plannerBlocks ?? []).map<SearchResult>((block) => ({
      href: APP_ROUTES.planner,
      id: block.id,
      metadata: `${block.date} · ${block.startTime}–${block.endTime}`,
      subtitle: compactText(block.description),
      title: block.title,
      type: 'planner',
    })),
    ...(sources.reminders ?? []).map<SearchResult>((reminder) => ({
      href: APP_ROUTES.reminders,
      id: reminder.id,
      metadata: reminder.triggerAt,
      subtitle: compactText(reminder.note),
      title: reminder.title,
      type: 'reminder',
    })),
    ...(sources.subscriptions ?? []).map<SearchResult>((subscription) => ({
      href: APP_ROUTES.subscriptions,
      id: subscription.id,
      metadata: `${subscription.amount} ${subscription.currency}`,
      subtitle: `Renews ${subscription.nextBillingDate}`,
      title: subscription.name,
      type: 'subscription',
    })),
    ...(sources.finance?.transactions ?? []).map(toTransactionResult),
  ]
}

export function searchResults(
  results: SearchResult[],
  query: string,
  maximumPerType = 4,
): SearchResultGroup[] {
  const normalized = query.trim()
  if (normalized.length < 2) return []

  return searchTypeOrder.flatMap((type) => {
    const matchesForType = results
      .filter((result) => result.type === type && matches(result, normalized))
      .sort(
        (left, right) =>
          rank(left, normalized) - rank(right, normalized) ||
          left.title.localeCompare(right.title),
      )
      .slice(0, maximumPerType)
    return matchesForType.length ? [{ results: matchesForType, type }] : []
  })
}
