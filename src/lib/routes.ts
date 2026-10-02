export const APP_ROUTES = {
  home: '/',
  activity: '/activity',
  login: '/login',
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
  review: '/review',
  subscriptions: '/subscriptions',
  finance: '/finance',
  financeAccount: '/finance/account',
  templates: '/templates',
} as const

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
