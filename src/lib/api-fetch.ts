import { useAuthStore } from '@/lib/auth-store'

/**
 * Authenticated fetch wrapper.
 * Automatically adds X-User-Id, X-User-Role, X-User-Npsn, X-User-Name, X-User-Email headers
 * from the Zustand auth store to every API request.
 */
export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const state = useAuthStore.getState()
  const user = state.user

  const headers = new Headers(init?.headers)

  if (user) {
    headers.set('X-User-Id', user.id)
    headers.set('X-User-Role', user.role)
    headers.set('X-User-Npsn', user.npsn || '')
    headers.set('X-User-Name', user.name || '')
    headers.set('X-User-Email', user.email || '')
  }

  // Set Content-Type for JSON bodies if not already set
  if (init?.body && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, {
    ...init,
    headers,
  })
}

/**
 * Convenience: GET with auth
 */
export async function apiGet(url: string): Promise<Response> {
  return apiFetch(url)
}

/**
 * Convenience: POST with auth and JSON body
 */
export async function apiPost(url: string, body?: unknown): Promise<Response> {
  return apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Convenience: PUT with auth and JSON body
 */
export async function apiPut(url: string, body?: unknown): Promise<Response> {
  return apiFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Convenience: DELETE with auth
 */
export async function apiDelete(url: string): Promise<Response> {
  return apiFetch(url, { method: 'DELETE' })
}
