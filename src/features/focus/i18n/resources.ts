const en = {
  focus: {
    active: 'Active',
    cancel: 'Cancel timer',
    completed: 'Completed',
    completionOptions: 'When the timer finishes',
    customDuration: 'Custom duration (minutes)',
    customDurationPlaceholder: 'e.g. 20',
    description:
      'Use a simple stopwatch or a time-boxed countdown without losing your active session.',
    elapsed: 'Elapsed time',
    eyebrow: 'Focus tools',
    finishAndSave: 'Finish & save',
    goalLabel: 'Goal',
    invalidDuration: 'Enter a whole number from 1 to 1,440 minutes.',
    minutes: '{{minutes}} min',
    noGoal: 'No goal',
    noTask: 'No task',
    notificationPermissionHint:
      'Browser notifications are used only when permission has already been granted.',
    notifyWhenAllowed: 'Notify me when allowed',
    optionalAssociation: 'Optional session details',
    optionalAssociationDescription:
      'Attach the next session to a task or goal when that context is useful.',
    originalDuration: 'Original: {{duration}}',
    pause: 'Pause',
    paused: 'Paused',
    playCompletionSound: 'Play a completion sound',
    remaining: 'Remaining time',
    reset: 'Reset',
    restart: 'Restart',
    resume: 'Resume',
    saveSession: 'Save session',
    savedSessionsDescription: 'Your most recently recorded focus time.',
    savedSessionsEmptyDescription:
      'Finish a stopwatch or countdown to add your first session.',
    savedSessionsEmptyTitle: 'No saved focus sessions',
    savedSessionsTitle: 'Saved sessions',
    sessionSaved: 'Focus session saved',
    startStopwatch: 'Start stopwatch',
    startTimer: 'Start timer',
    stopwatchDescription:
      'Track open-ended work with an accurate elapsed time.',
    stopwatchTitle: 'Stopwatch',
    taskLabel: 'Task',
    timerDescription: 'Protect a defined block of time and see what remains.',
    timerFinished: 'Timer finished',
    timerTitle: 'Countdown timer',
    title: 'Focus',
  },
}

const fr: typeof en = {
  focus: {
    active: 'Active',
    cancel: 'Annuler le minuteur',
    completed: 'Termine',
    completionOptions: 'A la fin du minuteur',
    customDuration: 'Duree personnalisee (minutes)',
    customDurationPlaceholder: 'ex. 20',
    description:
      'Utilisez un chronometre ou un compte a rebours sans perdre votre session active.',
    elapsed: 'Temps ecoule',
    eyebrow: 'Outils de concentration',
    finishAndSave: 'Terminer et enregistrer',
    goalLabel: 'Objectif',
    invalidDuration: 'Saisissez un nombre entier de 1 a 1 440 minutes.',
    minutes: '{{minutes}} min',
    noGoal: 'Aucun objectif',
    noTask: 'Aucune tache',
    notificationPermissionHint:
      'Les notifications sont utilisees seulement si vous avez deja accorde la permission.',
    notifyWhenAllowed: 'Notifier si autorise',
    optionalAssociation: 'Details facultatifs de la session',
    optionalAssociationDescription:
      'Associez la prochaine session a une tache ou un objectif lorsque ce contexte est utile.',
    originalDuration: 'Duree initiale : {{duration}}',
    pause: 'Mettre en pause',
    paused: 'En pause',
    playCompletionSound: 'Jouer un son a la fin',
    remaining: 'Temps restant',
    reset: 'Reinitialiser',
    restart: 'Recommencer',
    resume: 'Reprendre',
    saveSession: 'Enregistrer la session',
    savedSessionsDescription:
      'Vos temps de concentration enregistres les plus recents.',
    savedSessionsEmptyDescription:
      'Terminez un chronometre ou un compte a rebours pour ajouter votre premiere session.',
    savedSessionsEmptyTitle: 'Aucune session enregistree',
    savedSessionsTitle: 'Sessions enregistrees',
    sessionSaved: 'Session de concentration enregistree',
    startStopwatch: 'Demarrer le chronometre',
    startTimer: 'Demarrer le minuteur',
    stopwatchDescription:
      'Suivez un travail sans limite avec un temps ecoule precis.',
    stopwatchTitle: 'Chronometre',
    taskLabel: 'Tache',
    timerDescription: 'Protegez un temps defini et visualisez ce qu il reste.',
    timerFinished: 'Minuteur termine',
    timerTitle: 'Compte a rebours',
    title: 'Concentration',
  },
}

export const focusResources = {
  en: { translation: en },
  fr: { translation: fr },
} as const
