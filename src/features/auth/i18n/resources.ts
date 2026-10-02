const en = {
  auth: {
    createAccount: 'Create account',
    description: 'Sign in to continue to your workspace.',
    email: 'Email address',
    haveAccount: 'Already have an account? Sign in',
    loginError:
      'We could not sign you in. Check your credentials and try again.',
    needAccount: 'Need an account? Create one',
    password: 'Password',
    registerDescription: 'Create an account to get started.',
    registerTitle: 'Create your account',
    sessionExpired: 'Your session has expired. Please sign in again.',
    signIn: 'Sign in',
    title: 'Welcome back',
  },
}

const fr: typeof en = {
  auth: {
    ...en.auth,
    createAccount: 'Creer un compte',
    haveAccount: 'Vous avez deja un compte ? Se connecter',
    needAccount: 'Besoin d’un compte ? Creez-en un',
    registerDescription: 'Creez un compte pour commencer.',
    registerTitle: 'Creer votre compte',
    signIn: 'Se connecter',
    title: 'Bon retour',
  },
}

export const authResources = {
  en: { translation: en },
  fr: { translation: fr },
} as const
