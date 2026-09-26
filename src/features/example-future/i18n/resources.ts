const en = {
  exampleFuture: {
    backToList: 'Back to Example future',
    created: 'Created',
    detailEyebrow: 'Example future details',
    detailServiceNote:
      'This page uses a dedicated detail endpoint, service function, mapper, and query key rather than reusing the list response.',
    description:
      'A complete example of a feature-owned TanStack Query flow backed by MSW in development.',
    empty: 'No example items are available.',
    eyebrow: 'Reference feature',
    members: 'Members',
    mockingNote:
      'This list comes from an MSW browser handler. Replace the feature API client when a real backend is available; the service, mapper, and hook can stay in place.',
    name: 'Name',
    navigationLabel: 'Example future',
    owner: 'Owner',
    plan: 'Plan',
    status: 'Status',
    tableCaption: 'Example future items',
    title: 'Example future',
    updated: 'Updated',
  },
}

const fr: typeof en = {
  exampleFuture: {
    backToList: 'Retour aux exemples futurs',
    created: 'Cree le',
    detailEyebrow: 'Details de l exemple futur',
    detailServiceNote:
      'Cette page utilise un endpoint de detail, un service, un mapper et une cle de requete dedies au lieu de reutiliser la reponse de liste.',
    description:
      'Un exemple complet de flux TanStack Query appartenant a une fonctionnalite et alimente par MSW en developpement.',
    empty: 'Aucun element exemple n est disponible.',
    eyebrow: 'Fonctionnalite de reference',
    members: 'Membres',
    mockingNote:
      'Cette liste provient dun gestionnaire MSW dans le navigateur. Remplacez le client API de la fonctionnalite lorsquun vrai backend est disponible ; le service, le mapper et le hook peuvent rester en place.',
    name: 'Nom',
    navigationLabel: 'Exemple futur',
    owner: 'Proprietaire',
    plan: 'Forfait',
    status: 'Statut',
    tableCaption: 'Elements exemple futur',
    title: 'Exemple futur',
    updated: 'Mis a jour',
  },
}

export const exampleFutureResources = {
  en: { translation: en },
  fr: { translation: fr },
} as const
