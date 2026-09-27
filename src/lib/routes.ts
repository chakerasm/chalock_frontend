export const APP_ROUTES = {
  home: '/',
  tasks: '/tasks',
  habits: '/habits',
  goals: '/goals',
  notes: '/notes',
  focus: '/focus',
  pomodoro: '/focus/pomodoro',
  statistics: '/statistics',
} as const

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
