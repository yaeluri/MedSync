import { apiRequest } from './client';

export function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('document', file);

  return apiRequest('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
}
