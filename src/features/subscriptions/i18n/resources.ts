const en = {
  subscriptions: {
    add: 'Add subscription',
    active: 'Active subscriptions',
    all: 'All',
    amount: 'Amount',
    annualCost: 'Estimated annual cost',
    autoRenew: 'Auto-renews',
    back: 'All subscriptions',
    billingCycle: 'Billing cycle',
    cancel: 'Mark as cancelled',
    created: 'Subscription created',
    createError: 'Could not create the subscription.',
    createTitle: 'New subscription',
    currency: 'Currency',
    cycles: {
      annual: 'year',
      custom: 'custom interval',
      monthly: 'month',
      quarterly: '3 months',
      semiannual: '6 months',
      weekly: 'week',
    },
    description:
      'Keep recurring expenses and renewals in one calm, useful view.',
    descriptionPage:
      'See what renews next, what it costs, and what can be paused.',
    editTitle: 'Edit subscription',
    emptyDescription:
      'Add your first subscription to see upcoming renewals and recurring costs.',
    emptyTitle: 'No subscriptions in this view',
    formError: 'Check the required fields and subscription dates.',
    intervalUnit: 'Unit',
    intervalValue: 'Every',
    manualRenewal: 'Manual renewal',
    monthlyCost: 'Estimated monthly cost',
    name: 'Name',
    nextBillingDate: 'Next billing date',
    noSearchResults: 'No subscriptions match your search.',
    pause: 'Pause',
    renewal: {
      later: 'Renews {{date}}',
      month: 'Renews {{date}}',
      today: 'Renews today',
      tomorrow: 'Renews tomorrow',
      week: 'Renews {{date}}',
    },
    renewingSoon: 'Renewing soon',
    renewsOn: 'Next renewal: {{date}}',
    resume: 'Resume',
    search: 'Search subscriptions',
    searchPlaceholder: 'Search by name',
    status: 'Status',
    statusFilter: 'Filter subscriptions by status',
    statuses: {
      active: 'Active',
      cancelled: 'Cancelled',
      expired: 'Expired',
      paused: 'Paused',
      trial: 'Trial',
    },
    title: 'Subscriptions',
    trialEndDate: 'Trial ends',
  },
}

const fr: typeof en = {
  subscriptions: {
    ...en.subscriptions,
    add: 'Ajouter un abonnement',
    all: 'Tous',
    annualCost: 'Cout annuel estime',
    createTitle: 'Nouvel abonnement',
    description: 'Gardez vos depenses recurrentes et renouvellements en vue.',
    editTitle: 'Modifier l abonnement',
    monthlyCost: 'Cout mensuel estime',
    title: 'Abonnements',
  },
}

export const subscriptionsResources = {
  en: { translation: en },
  fr: { translation: fr },
} as const
