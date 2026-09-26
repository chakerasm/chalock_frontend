import { exampleFutureResources } from '@/features/example-future/i18n/resources'

export const fallbackLanguage = 'en'

export const supportedLanguages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Francais' },
] as const

export type SupportedLanguage = (typeof supportedLanguages)[number]['code']

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return supportedLanguages.some((language) => language.code === value)
}

const en = {
  appInfo: {
    environment: 'Environment',
    menuLabel: 'Application information',
    version: 'Version',
    versionDescription: 'Information about the current application build.',
    versionTitle: 'Application version',
  },
  appShell: {
    fieldShowcase: 'Form fields',
    logout: 'Log out',
    noSearchResults: 'No matching pages found.',
    openNavigation: 'Open navigation',
    openSearch: 'Open global search',
    primaryNavigation: 'Primary navigation',
    profileEmail: 'alex@example.com',
    profileMenu: 'Profile menu',
    profileName: 'Alex Morgan',
    search: 'Search',
    searchPlaceholder: 'Start typing to search pages...',
    settings: 'Settings',
    sidebarFooter: 'SaaS application starter',
    workspace: 'Workspace',
  },
  app: {
    name: 'Starter',
    home: 'Home',
    language: 'Language',
    colorMode: {
      switchToDark: 'Switch to dark theme',
      switchToLight: 'Switch to light theme',
    },
  },
  common: {
    close: 'Close',
    notAvailable: 'Not available',
  },
  confirmDialog: {
    confirm: 'Confirm',
  },
  copyButton: {
    action: 'Copy',
    error: 'Could not copy to the clipboard.',
    success: 'Copied to the clipboard.',
  },
  dateFields: {
    end: 'End date',
    invalidInterval: 'End date must not be before start date.',
    required: 'Choose a date.',
    start: 'Start date',
  },
  filterPopover: {
    apply: 'Apply',
    clear: 'Clear',
    open: 'Filters',
  },
  error: {
    title: 'Something went wrong',
    description: 'Please try again.',
    retry: 'Try again',
  },
  fieldControls: {
    decrease: 'Decrease {{label}}',
    hide: 'Hide {{label}}',
    increase: 'Increase {{label}}',
    show: 'Show {{label}}',
  },
  fields: {
    description:
      'Browser coverage for the reusable React Hook Form and Chakra field components.',
    title: 'Form field test harness',
  },
  form: {
    cancel: 'Cancel',
    save: 'Save',
  },
  home: {
    eyebrow: 'React application foundation',
    heading: 'A focused starting point for production applications.',
    description:
      'Build product features in isolated modules while the app shell, routing, server-state, forms, validation, and testing foundations remain consistent.',
    guidance:
      'Add your first product capability under src/features. Keep API access, domain types, schemas, mappers, services, hooks, and components owned by that feature.',
  },
  loading: 'Loading...',
  notFound: {
    description: 'The page you requested does not exist.',
    returnHome: 'Return home',
    title: 'Page not found',
  },
  pagination: {
    goToPage: 'Go to page {{page}}',
    next: 'Next page',
    previous: 'Previous page',
    summary: 'Page {{page}} of {{totalPages}}',
  },
}

const fr: typeof en = {
  appInfo: {
    environment: 'Environnement',
    menuLabel: 'Informations sur l application',
    version: 'Version',
    versionDescription:
      'Informations sur la version actuelle de l application.',
    versionTitle: 'Version de l application',
  },
  appShell: {
    fieldShowcase: 'Champs de formulaire',
    logout: 'Se deconnecter',
    noSearchResults: 'Aucune page correspondante.',
    openNavigation: 'Ouvrir la navigation',
    openSearch: 'Ouvrir la recherche globale',
    primaryNavigation: 'Navigation principale',
    profileEmail: 'alex@example.com',
    profileMenu: 'Menu du profil',
    profileName: 'Alex Morgan',
    search: 'Rechercher',
    searchPlaceholder: 'Commencez a taper pour rechercher des pages...',
    settings: 'Parametres',
    sidebarFooter: 'Base d application SaaS',
    workspace: 'Espace de travail',
  },
  app: {
    name: 'Starter',
    home: 'Accueil',
    language: 'Langue',
    colorMode: {
      switchToDark: 'Passer au theme sombre',
      switchToLight: 'Passer au theme clair',
    },
  },
  common: {
    close: 'Fermer',
    notAvailable: 'Non disponible',
  },
  confirmDialog: {
    confirm: 'Confirmer',
  },
  copyButton: {
    action: 'Copier',
    error: 'Impossible de copier dans le presse-papiers.',
    success: 'Copie dans le presse-papiers.',
  },
  dateFields: {
    end: 'Date de fin',
    invalidInterval:
      'La date de fin ne peut pas etre anterieure a la date de debut.',
    required: 'Choisissez une date.',
    start: 'Date de debut',
  },
  filterPopover: {
    apply: 'Appliquer',
    clear: 'Effacer',
    open: 'Filtres',
  },
  error: {
    title: 'Un probleme est survenu',
    description: 'Veuillez reessayer.',
    retry: 'Reessayer',
  },
  fieldControls: {
    decrease: 'Diminuer {{label}}',
    hide: 'Masquer {{label}}',
    increase: 'Augmenter {{label}}',
    show: 'Afficher {{label}}',
  },
  fields: {
    description:
      'Couverture navigateur pour les composants de champ reutilisables React Hook Form et Chakra.',
    title: 'Environnement de test des champs',
  },
  form: {
    cancel: 'Annuler',
    save: 'Enregistrer',
  },
  home: {
    eyebrow: 'Fondation d application React',
    heading: 'Un point de depart cible pour les applications de production.',
    description:
      'Developpez les fonctionnalites produit dans des modules isoles, tout en conservant une base coherente pour l application, le routage, les donnees serveur, les formulaires, la validation et les tests.',
    guidance:
      'Ajoutez votre premiere fonctionnalite produit dans src/features. Gardez les appels API, les types metier, les schemas, les mappers, les services, les hooks et les composants dans cette fonctionnalite.',
  },
  loading: 'Chargement...',
  notFound: {
    description: 'La page demandee n existe pas.',
    returnHome: 'Retour a l accueil',
    title: 'Page introuvable',
  },
  pagination: {
    goToPage: 'Aller a la page {{page}}',
    next: 'Page suivante',
    previous: 'Page precedente',
    summary: 'Page {{page}} sur {{totalPages}}',
  },
}

export const resources = {
  en: {
    translation: { ...en, ...exampleFutureResources.en.translation },
  },
  fr: {
    translation: { ...fr, ...exampleFutureResources.fr.translation },
  },
} as const
