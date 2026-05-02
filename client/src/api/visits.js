import { apiRequest } from './client';

export function transcribeAudio(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  return apiRequest('/api/visits/transcribe', {
    method: 'POST',
    body: formData,
  });
}
