import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export interface Role {
  id: string;
  name: string;
  description: string;
}

export const getRoles = () => apiGet<Role[]>('/api/roles');
export const getRole = (id: string) => apiGet<Role>(`/api/roles/${id}`);
export const createRole = (input: { name: string; description: string }) =>
  apiPost<Role>('/api/roles', input);
export const updateRole = (id: string, input: Partial<Role>) =>
  apiPatch<Role>(`/api/roles/${id}`, input);
export const deleteRole = (id: string) => apiDelete<void>(`/api/roles/${id}`);
