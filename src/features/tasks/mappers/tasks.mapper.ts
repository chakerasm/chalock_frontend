import type {
  CreateTaskInput,
  Task,
  TaskFromAPI,
  UpdateTaskInput,
} from '@/features/tasks/types/tasks.types'

export function mapTaskFromAPI(task: TaskFromAPI): Task {
  return { ...task }
}

export function mapTaskToAPI(task: Task): TaskFromAPI {
  return { ...task }
}

export function mapCreateTaskToAPI(input: CreateTaskInput): CreateTaskInput {
  return { ...input }
}

export function mapUpdateTaskToAPI(input: UpdateTaskInput): UpdateTaskInput {
  return { ...input }
}
