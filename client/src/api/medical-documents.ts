import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from './client';

export type SummaryStatus = 'SUCCESS' | 'FAILED';
export type DocumentTypeEnum =
  | 'LAB_RESULT'
  | 'REFERRAL'
  | 'DISCHARGE_SUMMARY'
  | 'IMAGING'
  | 'PRESCRIPTION'
  | 'OTHER';

export interface DocumentSummary {
  id: string;
  documentId: string;
  summaryText: string;
  extractedText: string;
  createdAt: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  uploadedByUserId: string;
  summaryStatus: SummaryStatus;
  documentType?: DocumentTypeEnum;
  fileName: string;
  fileUrl: string;
  fileFormat?: string;
  uploadedAt: string;
  updatedAt: string;
  processingCount: number;
  summary?: DocumentSummary;
}

export interface CreateMedicalDocumentInput {
  patientId: string;
  uploadedByUserId: string;
  summaryStatus?: SummaryStatus;
  documentType?: DocumentTypeEnum;
  fileName: string;
  fileUrl: string;
  fileFormat?: string;
}

export const getMedicalDocuments = (patientId?: string) =>
  apiGet<MedicalDocument[]>(
    `/api/medical-documents${patientId ? `?patientId=${patientId}` : ''}`,
  );
export const getMedicalDocument = (id: string) =>
  apiGet<MedicalDocument>(`/api/medical-documents/${id}`);
export const createMedicalDocument = (input: CreateMedicalDocumentInput) =>
  apiPost<MedicalDocument>('/api/medical-documents', input);
export const updateMedicalDocument = (
  id: string,
  input: Partial<CreateMedicalDocumentInput>,
) => apiPatch<MedicalDocument>(`/api/medical-documents/${id}`, input);
export const upsertDocumentSummary = (
  id: string,
  input: { summaryText: string; extractedText: string },
) => apiPut<DocumentSummary>(`/api/medical-documents/${id}/summary`, input);
export const deleteMedicalDocument = (id: string) =>
  apiDelete<void>(`/api/medical-documents/${id}`);
