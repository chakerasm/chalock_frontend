export type AuthUserFromAPI = {
  email: string
  id: string
  createdAt: string
}

export type AuthUser = AuthUserFromAPI

export type AuthenticationResponseFromAPI = {
  accessToken: string
  expiresIn: string
  tokenType: 'Bearer'
  user: AuthUserFromAPI
}

export type AuthenticationResponse = {
  accessToken: string
  expiresIn: string
  tokenType: 'Bearer'
  user: AuthUser
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = LoginInput

export type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'unauthenticated' }
