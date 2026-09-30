# Authentication API contract

## Session model

Production authentication should use a server-managed session with a `Secure`, `HttpOnly`, `SameSite=Lax` cookie. The frontend must not persist access or refresh tokens in local storage. Its temporary local session is an MVP-only adapter and must be replaced when these endpoints are available.

Cookie-authenticated state-changing requests need CSRF protection, such as a synchronizer token or a double-submit token. Return `401` for missing, expired, or invalid sessions; the frontend clears its session state and returns to `/login` in one centralized path.

## Endpoints

### `POST /api/auth/login`

```json
{ "email": "user@example.com", "password": "password" }
```

On success, set the session cookie and return the authenticated user:

```json
{ "user": { "id": "usr_123", "email": "user@example.com", "displayName": "User" } }
```

Return `401 INVALID_CREDENTIALS` for invalid credentials. Do not reveal whether an email exists.

### `POST /api/auth/logout`

Invalidate the server session and expire the session cookie. It should be idempotent and return `204`.

### `GET /api/auth/me`

Return the authenticated user when the session is valid. Return `401 SESSION_EXPIRED` otherwise.

### `POST /api/auth/refresh` (future)

If refresh sessions are introduced, rotate the refresh token/session on every successful use, detect reuse, and issue a replacement access/session cookie. The frontend should not need access to the refresh secret.

## Validation and expiration

- Email is normalized and validated server-side.
- Password requirements and rate limits are enforced server-side.
- Session expiration and revocation are authoritative on the server.
- All authenticated API responses may return `401`; the frontend must treat that as a session expiration, clear sensitive cached data, and route to sign-in without feature-specific handling.
