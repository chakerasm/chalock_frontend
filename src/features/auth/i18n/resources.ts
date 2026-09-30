const en = {
  auth: {
    description: 'Sign in to continue to your workspace.',
    email: 'Email address',
    loginError:
      'We could not sign you in. Check your credentials and try again.',
    password: 'Password',
    sessionExpired: 'Your session has expired. Please sign in again.',
    signIn: 'Sign in',
    title: 'Welcome back',
  },
}

const fr: typeof en = {
  auth: {
    ...en.auth,
    signIn: 'Se connecter',
    title: 'Bon retour',
  },
}

export const authResources = {
  en: { translation: en },
  fr: { translation: fr },
} as const
