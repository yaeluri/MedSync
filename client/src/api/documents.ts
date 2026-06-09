import { apiRequest } from './client';

export function uploadDocument(file: File, patientId?: string) {
  const formData = new FormData();
  formData.append('document', file);
  if (patientId) {
    formData.append('patientId', patientId);
  }

  return apiRequest('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}
