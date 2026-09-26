export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'

export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskFromAPI = {
  completedAt?: string
  createdAt: string
  description?: string
  dueDate?: string
  dueTime?: string
  estimatedMinutes?: number
  goalId?: string
  id: string
  priority: TaskPriority
  status: TaskStatus
  title: string
  updatedAt: string
}

export type Task = TaskFromAPI

export type TaskListResponseFromAPI = {
  data: TaskFromAPI[]
  nextCursor: string | null
}

export type CreateTaskInput = {
  description?: string
  dueDate?: string
  dueTime?: string
  estimatedMinutes?: number
  goalId?: string
  priority?: TaskPriority
  title: string
}

export type UpdateTaskInput = {
  completedAt?: string
  description?: string
  dueDate?: string
  dueTime?: string
  estimatedMinutes?: number
  goalId?: string
  priority?: TaskPriority
  status?: TaskStatus
  taskId: string
  title?: string
}

export type TaskListFilters = {
  dueFrom?: string
  dueTo?: string
  goalId?: string
  priority?: TaskPriority
  search?: string
  status?: TaskStatus
}

export type TaskView = 'today' | 'upcoming' | 'all' | 'completed'
