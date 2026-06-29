const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem('medsync.session');
    if (!raw) return {};
    const session = JSON.parse(raw);
    if (session?.userId) return { 'x-user-id': session.userId };
  } catch { /* noop */ }
  return {};
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
): Promise<T> {
  const authHeaders = getAuthHeaders();
  const mergedHeaders = { ...authHeaders, ...(options.headers || {}) };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: mergedHeaders });
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('medsync.session');
      localStorage.removeItem('role');
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
