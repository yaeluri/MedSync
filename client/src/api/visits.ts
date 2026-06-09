import { apiRequest } from './client';

export function transcribeAudio(audioBlob: Blob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  return apiRequest('/api/visits/transcribe', {
    method: 'POST',
    body: formData,
  });
}

export function summarizeText(text: string): Promise<{ summary: string }> {
  return apiRequest('/api/visits/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}
