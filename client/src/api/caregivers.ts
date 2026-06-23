import { apiDelete, apiGet, apiPatch, apiPost } from './client';
import { User } from './users';

export interface Caregiver {
  id: string;
  userId: string;
  licenseNumber: string;
  specialization: string;
  clinicName?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CreateCaregiverInput {
  userId: string;
  licenseNumber: string;
  specialization: string;
  clinicName?: string;
}

export const getCaregivers = () => apiGet<Caregiver[]>('/api/caregivers');
export const getCaregiver = (id: string) =>
  apiGet<Caregiver>(`/api/caregivers/${id}`);
export const createCaregiver = (input: CreateCaregiverInput) =>
  apiPost<Caregiver>('/api/caregivers', input);
export const updateCaregiver = (id: string, input: Partial<CreateCaregiverInput>) =>
  apiPatch<Caregiver>(`/api/caregivers/${id}`, input);
export const deleteCaregiver = (id: string) =>
  apiDelete<void>(`/api/caregivers/${id}`);
