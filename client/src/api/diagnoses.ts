import { apiDelete, apiGet, apiPatch, apiPost } from './client';

export interface Diagnosis {
  id: string;
  code: string;
  description: string;
}

export interface DiagnosisInput {
  code: string;
  description: string;
}

export const getDiagnoses = (search?: string) =>
  apiGet<Diagnosis[]>(
    `/api/diagnoses${search ? `?search=${encodeURIComponent(search)}` : ''}`,
  );
export const getDiagnosis = (id: string) =>
  apiGet<Diagnosis>(`/api/diagnoses/${id}`);
export const createDiagnosis = (input: DiagnosisInput) =>
  apiPost<Diagnosis>('/api/diagnoses', input);
export const updateDiagnosis = (id: string, input: Partial<DiagnosisInput>) =>
  apiPatch<Diagnosis>(`/api/diagnoses/${id}`, input);
export const deleteDiagnosis = (id: string) =>
  apiDelete<void>(`/api/diagnoses/${id}`);
