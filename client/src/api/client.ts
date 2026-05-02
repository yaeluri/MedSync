const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiRequest(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}
