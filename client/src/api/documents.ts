import { apiRequest } from './client';

export interface DocumentUploadResult {
  filename: string;
  extractedText: string;
  summary: string;
  patientId: string | null;
}

export function uploadDocument(
  file: File,
  patientId?: string,
): Promise<DocumentUploadResult> {
  const formData = new FormData();
  formData.append('document', file);
  if (patientId) {
    formData.append('patientId', patientId);
  }

  return apiRequest<DocumentUploadResult>('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}
