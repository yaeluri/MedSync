const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SESSION_KEY = 'medsync.session';

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    const session = JSON.parse(raw);
    if (session?.accessToken) {
      return { Authorization: `Bearer ${session.accessToken}` };
    }
  } catch { /* noop */ }
  return {};
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('role');
  localStorage.removeItem('medsync.viewAs');
}

// Single-flight refresh: concurrent 401s share one refresh request.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      const refreshToken = session?.refreshToken;
      if (!refreshToken) return null;

      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return null;

      const data = await res.json();
      if (!data?.accessToken) return null;

      const updated = {
        ...session,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? refreshToken,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return data.accessToken as string;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export interface ApiError extends Error {
  status: number;
  body?: unknown;
}

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data === 'object') {
      const message = (data as any).message;
      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }
    return JSON.stringify(data);
  } catch {
    return res.statusText || `Request failed: ${res.status}`;
  }
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {},
  allowRefresh = true,
): Promise<T> {
  const authHeaders = getAuthHeaders();
  const mergedHeaders = { ...authHeaders, ...(options.headers || {}) };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: mergedHeaders });
  if (!res.ok) {
    if (res.status === 401) {
      // Try a one-time token refresh, then replay the original request.
      // Skip for the refresh endpoint itself to avoid recursion.
      if (allowRefresh && !path.startsWith('/api/auth/refresh')) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const retryHeaders = {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          return apiRequest<T>(path, { ...options, headers: retryHeaders }, false);
        }
      }
      clearStoredSession();
    }
    const detail = await readError(res);
    const err = new Error(detail) as ApiError;
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return undefined as T;
  return (await res.json()) as T;
}

export function apiJson<T = any>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const apiGet = <T = any>(path: string) => apiRequest<T>(path);
export const apiPost = <T = any>(path: string, body?: unknown) =>
  apiJson<T>(path, 'POST', body);
export const apiPatch = <T = any>(path: string, body?: unknown) =>
  apiJson<T>(path, 'PATCH', body);
export const apiPut = <T = any>(path: string, body?: unknown) =>
  apiJson<T>(path, 'PUT', body);
export const apiDelete = <T = any>(path: string) =>
  apiRequest<T>(path, { method: 'DELETE' });
