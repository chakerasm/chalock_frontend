const en = {
  globalSearch: {
    commands: 'Quick navigation',
    empty: 'No results for “{{query}}”.',
    error: 'Some search sources could not be loaded.',
    groups: {
      goal: 'Goals',
      habit: 'Habits',
      note: 'Notes',
      planner: 'Planner blocks',
      reminder: 'Reminders',
      subscription: 'Subscriptions',
      task: 'Tasks',
      transaction: 'Transactions',
    },
    loading: 'Searching…',
    minimumQuery: 'Type at least 2 characters to search.',
    open: 'Open global search',
    placeholder: 'Search tasks, notes, subscriptions…',
    title: 'Search',
  },
}

const fr: typeof en = {
  globalSearch: {
    ...en.globalSearch,
    commands: 'Navigation rapide',
    title: 'Rechercher',
  },
}

export const globalSearchResources = {
  en: { translation: en },
  fr: { translation: fr },
} as const
