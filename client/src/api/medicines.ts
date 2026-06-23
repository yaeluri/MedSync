import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export interface Medicine {
  id: string;
  name: string;
}

export const getMedicines = (search?: string) =>
  apiGet<Medicine[]>(
    `/api/medicines${search ? `?search=${encodeURIComponent(search)}` : ''}`,
  );
export const getMedicine = (id: string) =>
  apiGet<Medicine>(`/api/medicines/${id}`);
export const createMedicine = (input: { name: string }) =>
  apiPost<Medicine>('/api/medicines', input);
export const updateMedicine = (id: string, input: { name?: string }) =>
  apiPatch<Medicine>(`/api/medicines/${id}`, input);
export const deleteMedicine = (id: string) =>
  apiDelete<void>(`/api/medicines/${id}`);
