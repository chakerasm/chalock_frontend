import type { TaskFromAPI } from '@/features/tasks/types/tasks.types'

function toLocalDate(offset: number) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

export const tasksMock: TaskFromAPI[] = [
  {
    createdAt: daysAgo(4),
    description: 'Check scope, decision owners, and the first delivery date.',
    dueDate: toLocalDate(0),
    dueTime: '09:30',
    estimatedMinutes: 45,
    id: 'task-1',
    priority: 'high',
    status: 'todo',
    title: 'Review project brief',
    updatedAt: daysAgo(1),
  },
  {
    createdAt: daysAgo(3),
    dueDate: toLocalDate(0),
    dueTime: '11:00',
    estimatedMinutes: 30,
    id: 'task-2',
    priority: 'medium',
    status: 'todo',
    title: 'Send the client update',
    updatedAt: daysAgo(1),
  },
  {
    createdAt: daysAgo(2),
    description: 'Turn the research notes into a one-page narrative.',
    dueDate: toLocalDate(0),
    estimatedMinutes: 60,
    id: 'task-3',
    priority: 'high',
    status: 'in_progress',
    title: 'Outline the project proposal',
    updatedAt: daysAgo(0),
  },
  {
    completedAt: daysAgo(0),
    createdAt: daysAgo(8),
    dueDate: toLocalDate(-2),
    id: 'task-4',
    priority: 'low',
    status: 'completed',
    title: 'Book dentist appointment',
    updatedAt: daysAgo(0),
  },
  {
    createdAt: daysAgo(1),
    dueDate: toLocalDate(1),
    dueTime: '10:00',
    estimatedMinutes: 50,
    id: 'task-5',
    priority: 'medium',
    status: 'todo',
    title: 'Prepare design review notes',
    updatedAt: daysAgo(0),
  },
  {
    createdAt: daysAgo(6),
    dueDate: toLocalDate(3),
    goalId: 'goal-3',
    id: 'task-6',
    priority: 'high',
    status: 'todo',
    title: 'Finish course module three',
    updatedAt: daysAgo(2),
  },
  {
    createdAt: daysAgo(10),
    dueDate: toLocalDate(-1),
    estimatedMinutes: 20,
    id: 'task-7',
    priority: 'medium',
    status: 'todo',
    title: 'Follow up on research interviews',
    updatedAt: daysAgo(3),
  },
  {
    createdAt: daysAgo(5),
    id: 'task-8',
    priority: 'low',
    status: 'cancelled',
    title: 'Compare alternative note-taking apps',
    updatedAt: daysAgo(1),
  },
  {
    createdAt: daysAgo(1),
    description: 'A task without a due date belongs in All, not Today.',
    id: 'task-9',
    priority: 'low',
    status: 'todo',
    title: 'Collect inspiration for the home office',
    updatedAt: daysAgo(1),
  },
]
