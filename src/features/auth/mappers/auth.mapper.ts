import type {
  AuthSession,
  AuthSessionFromAPI,
  AuthUser,
  AuthUserFromAPI,
} from '@/features/auth/types/auth.types'

export function mapAuthUserFromAPI(user: AuthUserFromAPI): AuthUser {
  return { ...user }
}

export function mapAuthUserToAPI(user: AuthUser): AuthUserFromAPI {
  return { ...user }
}

export function mapAuthSessionFromAPI(
  session: AuthSessionFromAPI,
): AuthSession {
  return { ...session, user: mapAuthUserFromAPI(session.user) }
}

export function mapAuthSessionToAPI(session: AuthSession): AuthSessionFromAPI {
  return { ...session, user: mapAuthUserToAPI(session.user) }
}
