export const APP_ROUTES = {
  home: '/',
  tasks: '/tasks',
  habits: '/habits',
  goals: '/goals',
  notes: '/notes',
  focus: '/focus',
  planner: '/planner',
  reminders: '/reminders',
  settings: '/settings',
  pomodoro: '/focus/pomodoro',
  statistics: '/statistics',
  subscriptions: '/subscriptions',
  finance: '/finance',
} as const

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
