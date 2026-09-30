export type AuthUserFromAPI = {
  displayName: string
  email: string
  id: string
}

export type AuthUser = AuthUserFromAPI

export type AuthSessionFromAPI = {
  expiresAt: string
  user: AuthUserFromAPI
}

export type AuthSession = {
  expiresAt: string
  user: AuthUser
}

export type LoginInput = {
  email: string
  password: string
}

export type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' }
