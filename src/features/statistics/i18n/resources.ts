const en = {
  statistics: {
    description: 'A clear view of the patterns your recent activity creates.',
    durationHoursMinutes: '{{hours}}h {{minutes}}m',
    durationMinutes: '{{minutes}} min',
    durationSeconds: '{{seconds}} sec',
    eyebrow: 'Your recent rhythm',
    focus: {
      averageSession: 'Average session',
      description: 'Time from completed timer and Pomodoro focus sessions.',
      durationPerDay: 'Focus duration per day',
      empty: 'Record a completed focus session to see focus time here.',
      mostProductiveDay: 'Most focus time was recorded on {{date}}.',
      title: 'Focus',
      totalTime: 'Total focus time',
      trendInsufficient:
        'Record focus time on at least two days to see a daily trend.',
    },
    goals: {
      activeCount: '{{count}} active goals',
      description:
        'A simple view of the goals you are currently moving toward.',
      empty: 'Create an active goal to see its progress here.',
      title: 'Current goals',
    },
    habits: {
      completionRate: 'Completion rate',
      consistency: 'Consistency over time',
      consistencyInsufficient:
        'Check in on at least two scheduled days to see a consistency view.',
      currentStreaks: 'Current streaks',
      description:
        'Completion is based on scheduled habit check-ins and completed full weekly targets.',
      empty: 'Add scheduled habit check-ins to see completion patterns here.',
      streakDays: '{{count}}-day streak',
      streakWeeks: '{{count}}-week streak',
      streaksEmpty:
        'Current streaks will appear after completed scheduled check-ins.',
      title: 'Habits',
    },
    notEnoughData: 'Not enough data',
    rangeLabel: 'Statistics date range',
    ranges: {
      'last-7-days': 'Last 7 days',
      'last-30-days': 'Last 30 days',
      'this-month': 'This month',
    },
    summary: {
      focusSessions: 'Focus sessions',
      habitCompletionRate: 'Habit completion rate',
      tasksCompleted: 'Tasks completed',
      totalFocusTime: 'Total focus time',
    },
    tasks: {
      completedCountValue: '{{count}} completed',
      completedPerDay: 'Tasks completed per day',
      completionCount: 'Completion count',
      description:
        'Completed tasks are grouped by the date they were finished.',
      empty: 'Complete a task in this range to see task activity here.',
      priorityBreakdown: 'Completed by priority',
      title: 'Tasks',
      trendInsufficient:
        'Complete tasks on at least two days to see a daily trend.',
    },
    title: 'Statistics',
  },
}

const fr: typeof en = {
  statistics: {
    description:
      'Une vue claire des tendances creees par votre activite recente.',
    durationHoursMinutes: '{{hours}} h {{minutes}} min',
    durationMinutes: '{{minutes}} min',
    durationSeconds: '{{seconds}} s',
    eyebrow: 'Votre rythme recent',
    focus: {
      averageSession: 'Session moyenne',
      description:
        'Temps des sessions terminees de minuteur et de concentration Pomodoro.',
      durationPerDay: 'Duree de concentration par jour',
      empty:
        'Enregistrez une session de concentration terminee pour voir le temps ici.',
      mostProductiveDay:
        'Le plus de temps de concentration a ete enregistre le {{date}}.',
      title: 'Concentration',
      totalTime: 'Temps total de concentration',
      trendInsufficient:
        'Enregistrez du temps de concentration sur au moins deux jours pour voir une tendance quotidienne.',
    },
    goals: {
      activeCount: '{{count}} objectifs actifs',
      description:
        'Une vue simple des objectifs vers lesquels vous avancez actuellement.',
      empty: 'Creez un objectif actif pour voir sa progression ici.',
      title: 'Objectifs actuels',
    },
    habits: {
      completionRate: 'Taux de realisation',
      consistency: 'Regularite dans le temps',
      consistencyInsufficient:
        'Effectuez un suivi sur au moins deux jours prevus pour voir la regularite.',
      currentStreaks: 'Series en cours',
      description:
        'La realisation repose sur les suivis prevus et les objectifs hebdomadaires termines.',
      empty:
        'Ajoutez des suivis d habitudes prevues pour voir les tendances ici.',
      streakDays: 'Serie de {{count}} jours',
      streakWeeks: 'Serie de {{count}} semaines',
      streaksEmpty:
        'Les series en cours apparaitront apres des suivis prevus termines.',
      title: 'Habitudes',
    },
    notEnoughData: 'Pas assez de donnees',
    rangeLabel: 'Periode des statistiques',
    ranges: {
      'last-7-days': '7 derniers jours',
      'last-30-days': '30 derniers jours',
      'this-month': 'Ce mois-ci',
    },
    summary: {
      focusSessions: 'Sessions de concentration',
      habitCompletionRate: 'Taux de realisation des habitudes',
      tasksCompleted: 'Taches terminees',
      totalFocusTime: 'Temps total de concentration',
    },
    tasks: {
      completedCountValue: '{{count}} terminees',
      completedPerDay: 'Taches terminees par jour',
      completionCount: 'Nombre de taches terminees',
      description: 'Les taches terminees sont regroupees par date de fin.',
      empty: 'Terminez une tache sur cette periode pour voir l activite ici.',
      priorityBreakdown: 'Terminees par priorite',
      title: 'Taches',
      trendInsufficient:
        'Terminez des taches sur au moins deux jours pour voir une tendance quotidienne.',
    },
    title: 'Statistiques',
  },
}

export const statisticsResources = {
  en: { translation: en },
  fr: { translation: fr },
} as const
