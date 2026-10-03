const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')
const apiVersionPrefix = '/api/v1'

let accessToken: string | undefined

const unauthorizedListeners = new Set<() => void>()

export function subscribeToUnauthorized(listener: () => void) {
  unauthorizedListeners.add(listener)
  return () => {
    unauthorizedListeners.delete(listener)
  }
}

/** Sets the bearer token used for subsequent authenticated API requests. */
export function setApiAccessToken(token: string | undefined) {
  accessToken = token?.trim() || undefined
}

function notifyUnauthorized() {
  unauthorizedListeners.forEach((listener) => {
    listener()
  })
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export type ApiFetchInit = RequestInit & {
  /** Auth endpoints handle their own 401 responses and must not end a session. */
  skipUnauthorizedHandler?: boolean
}

function getApiPath(path: string) {
  if (path === '/api') return apiVersionPrefix
  if (path.startsWith('/api/v1/')) return path
  if (path.startsWith('/api/')) return `${apiVersionPrefix}${path.slice(4)}`
  return `${apiVersionPrefix}${path.startsWith('/') ? path : `/${path}`}`
}

export function apiFetch(path: string, init?: ApiFetchInit) {
  const { skipUnauthorizedHandler = false, ...requestInit } = init ?? {}
  const headers = new Headers(requestInit.headers)
  headers.set('Accept', 'application/json')
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const apiPath = getApiPath(path)
  const requestPath = apiBaseUrl.endsWith(apiVersionPrefix)
    ? apiPath.slice(apiVersionPrefix.length)
    : apiPath

  return fetch(`${apiBaseUrl}${requestPath}`, {
    ...requestInit,
    headers,
  }).then(async (response) => {
    if (response.ok) return response
    if (response.status === 401 && !skipUnauthorizedHandler)
      notifyUnauthorized()

    let message = `Request failed with status ${response.status}.`
    let body: unknown
    try {
      body = await response.clone().json()
      if (
        typeof body === 'object' &&
        body !== null &&
        'message' in body &&
        typeof body.message === 'string'
      ) {
        message = body.message
      }
    } catch {
      // Keep the status-based message when the response has no JSON body.
    }
    throw new ApiError(message, response.status, body)
  })
}
