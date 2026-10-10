import type {
  Task,
  TaskPriority,
  TaskStatus,
  TaskView,
} from '@/features/tasks/types/tasks.types'

export function getLocalDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

export function isTaskCompleted(task: Task) {
  return task.status === 'completed'
}

export function isTaskOverdue(task: Task, today = getLocalDate()) {
  return Boolean(
    task.dueDate &&
      task.dueDate < today &&
      task.status !== 'completed' &&
      task.status !== 'cancelled',
  )
}

function sortByDueDate(tasks: Task[]) {
  return [...tasks].sort((first, second) => {
    if (!first.dueDate && !second.dueDate)
      return first.title.localeCompare(second.title)
    if (!first.dueDate) return 1
    if (!second.dueDate) return -1
    return `${first.dueDate}${first.dueTime ?? ''}`.localeCompare(
      `${second.dueDate}${second.dueTime ?? ''}`,
    )
  })
}

export function getTasksForView(tasks: Task[], view: TaskView) {
  const today = getLocalDate()
  const uniqueTasks = Array.from(
    new Map(
      tasks.map((task) => [
        task.seriesId && task.occurrenceDate
          ? `${task.seriesId}:${task.occurrenceDate}`
          : task.id,
        task,
      ]),
    ).values(),
  )
  const filteredTasks = uniqueTasks.filter((task) => {
    if (view === 'completed') return isTaskCompleted(task)
    if (view === 'today') {
      return (
        task.status !== 'completed' &&
        task.status !== 'cancelled' &&
        task.dueDate === today
      )
    }
    if (view === 'upcoming') {
      return (
        task.status !== 'completed' &&
        task.status !== 'cancelled' &&
        Boolean(task.dueDate && task.dueDate > today)
      )
    }
    return true
  })

  return sortByDueDate(filteredTasks)
}

export function applyTaskFilters(
  tasks: Task[],
  filters: {
    priority?: TaskPriority
    search: string
    status?: TaskStatus
  },
) {
  const normalizedSearch = filters.search.trim().toLocaleLowerCase()
  return tasks.filter((task) => {
    if (filters.status && task.status !== filters.status) return false
    if (filters.priority && task.priority !== filters.priority) return false
    if (
      normalizedSearch &&
      !`${task.title} ${task.description ?? ''}`
        .toLocaleLowerCase()
        .includes(normalizedSearch)
    ) {
      return false
    }
    return true
  })
}

export function groupTasksByDueDate(tasks: Task[]) {
  return tasks.reduce<Record<string, Task[]>>((groups, task) => {
    const key = task.dueDate ?? 'no-date'
    groups[key] ??= []
    groups[key].push(task)
    return groups
  }, {})
}
