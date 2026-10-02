# Authentication API contract

All API routes are served beneath `/api/v1`. Authenticate requests with a signed JWT in the `Authorization: Bearer <accessToken>` header. Access tokens expire according to `JWT_EXPIRES_IN`; this MVP has no refresh-token or logout/revocation endpoint.

## Shared types

```ts
interface PublicUser {
  id: string
  email: string
  createdAt: string // UTC ISO-8601 instant
}

interface AuthenticationResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: string
  user: PublicUser
}
```

## Endpoints

- `POST /api/v1/auth/register` accepts `{ email, password }`, returns `201` with `AuthenticationResponse`, and returns `400` for invalid input or `409` for an existing email.
- `POST /api/v1/auth/login` accepts `{ email, password }`, returns `200` with `AuthenticationResponse`, and returns `400` for malformed input or `401` with a generic invalid-credentials message.
- `GET /api/v1/auth/me` requires the bearer token and returns `200` with `PublicUser`. It returns `401` for a missing, malformed, expired, or invalid token.

Emails are trimmed, normalized to lowercase, and limited to 320 characters. Passwords must be 8–128 characters. API errors use the repository-wide envelope; passwords and password hashes are never returned.
