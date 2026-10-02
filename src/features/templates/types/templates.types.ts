import type { HabitSchedule } from '@/features/habits/types/habits.types'
import type { TimeBlockCategory } from '@/features/planner/types/planner.types'
import type { TaskPriority } from '@/features/tasks/types/tasks.types'

export type TemplateType = 'task' | 'task_list' | 'planner_day' | 'note' | 'routine'
export type RelativeDateRule =
  | { type: 'today' }
  | { type: 'tomorrow' }
  | { type: 'days_after_apply'; days: number }
  | { type: 'weekday'; weekday: number }

type TemplateBase<TType extends TemplateType, TPayload> = {
  id: string
  name: string
  description?: string
  type: TType
  payload: TPayload
  isFavorite: boolean
  usageCount?: number
  lastUsedAt?: string
  createdAt: string
  updatedAt: string
}

export type TaskTemplatePayload = { title: string; description?: string; priority?: TaskPriority; estimatedMinutes?: number; relativeDueDate?: RelativeDateRule }
export type TaskListItem = TaskTemplatePayload & { id: string }
export type PlannerTemplateBlock = { id: string; title: string; description?: string; startTime: string; endTime: string; category?: TimeBlockCategory }
export type NoteTemplatePayload = { title?: string; content: string }
export type RoutineTemplatePayload = { name: string; description?: string; schedule: HabitSchedule; targetCount?: number; unit?: string }

export type TaskTemplate = TemplateBase<'task', TaskTemplatePayload>
export type TaskListTemplate = TemplateBase<'task_list', { tasks: TaskListItem[] }>
export type PlannerDayTemplate = TemplateBase<'planner_day', { blocks: PlannerTemplateBlock[] }>
export type NoteTemplate = TemplateBase<'note', NoteTemplatePayload>
export type RoutineTemplate = TemplateBase<'routine', RoutineTemplatePayload>
export type Template = TaskTemplate | TaskListTemplate | PlannerDayTemplate | NoteTemplate | RoutineTemplate
export type CreateTemplateInput = Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsedAt'>
export type UpdateTemplateInput = Partial<Omit<CreateTemplateInput, 'type'>> & { templateId: string }
export type TemplateFilters = { type?: TemplateType; favorite?: boolean; search?: string }
export type ApplyTemplateInput = { template: Template; targetDate?: string; selectedItemIds?: string[]; existingBlocks?: PlannerTemplateBlock[] }
export type TemplateApplicationPreview = { itemCount: number; conflicts: PlannerTemplateBlock[]; summary: string }
