const en = {
  weeklyPlanning: {
    title: 'Weekly Planning',
    nextWeek: 'Next week',
    makeRoom: 'Make room for what matters.',
    available: 'Available planning time',
    scheduled: 'Already scheduled',
    unscheduled: 'Unscheduled priority work',
    carryOver: 'Carry-over',
    carryOverDescription:
      'Decide what unfinished work should receive attention next week.',
    goals: 'Active goals',
    planGoal: 'Plan goal',
    remaining: '{{count}} tasks remaining',
    priority: 'Important tasks',
    priorityDescription:
      'High-priority work and deadlines that need a place on the calendar.',
    schedule: 'Schedule',
    routines: 'Habits and routines',
    routinesDescription:
      'Expected commitments stay routines, not duplicate tasks.',
    weeklyTarget: '{{count}} times this week',
    planner: 'Planner overview',
    plannerDescription: 'A compact view of capacity, busy days, and conflicts.',
    busy: 'busy',
    open: 'open',
    conflict: 'conflict',
    reminders: 'Deadlines and reminders',
    noReminders: 'Nothing else is due next week.',
    finalReview: 'Final weekly plan',
    tasksScheduled: '{{count}} tasks scheduled',
    habitsCount: '{{count}} habits',
    remindersCount: '{{count}} reminders',
    finish: 'Finish planning',
    finished: 'Your plan is ready for the week ahead.',
    review: 'Weekly Review',
  },
}
const fr: typeof en = {
  weeklyPlanning: {
    ...en.weeklyPlanning,
    title: 'Planification hebdomadaire',
    nextWeek: 'Semaine prochaine',
    carryOver: 'A reporter',
    goals: 'Objectifs actifs',
    priority: 'Taches importantes',
    routines: 'Habitudes et routines',
    planner: 'Vue du planificateur',
    reminders: 'Echeances et rappels',
    finalReview: 'Plan hebdomadaire final',
    finish: 'Terminer la planification',
  },
}
export const weeklyPlanningResources = {
  en: { translation: en },
  fr: { translation: fr },
} as const
