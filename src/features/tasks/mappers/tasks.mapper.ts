import type { Task, TaskFromAPI } from '@/features/tasks/types/tasks.types'

export function mapTaskFromAPI(task: TaskFromAPI): Task {
  return { ...task }
}

export function mapTaskToAPI(task: Task): TaskFromAPI {
  return { ...task }
}
