import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export interface Slot {
  id: string;
  patientId: string;
  caregiverId: string;
  slotTime: string;
  hasReferral: boolean;
  createdAt: string;
  patient?: { id: string; user?: { fullName: string } };
  caregiver?: { id: string; specialization?: string; user?: { fullName: string } };
}

export interface CreateSlotInput {
  patientId: string;
  caregiverId: string;
  slotTime: string;
  hasReferral?: boolean;
}

export interface SlotQuery {
  patientId?: string;
  caregiverId?: string;
  from?: string;
  to?: string;
}

export const getSlots = (q: SlotQuery = {}) => {
  const params = new URLSearchParams();
  if (q.patientId) params.set('patientId', q.patientId);
  if (q.caregiverId) params.set('caregiverId', q.caregiverId);
  if (q.from) params.set('from', q.from);
  if (q.to) params.set('to', q.to);
  const qs = params.toString();
  return apiGet<Slot[]>(`/api/slots${qs ? `?${qs}` : ''}`);
};
export const getSlot = (id: string) => apiGet<Slot>(`/api/slots/${id}`);
export const createSlot = (input: CreateSlotInput) =>
  apiPost<Slot>('/api/slots', input);
export const updateSlot = (id: string, input: Partial<CreateSlotInput>) =>
  apiPatch<Slot>(`/api/slots/${id}`, input);
export const deleteSlot = (id: string) => apiDelete<void>(`/api/slots/${id}`);
