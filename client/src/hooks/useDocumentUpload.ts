import { useState, useRef, ChangeEvent } from 'react';
import { uploadDocument } from '../api/documents';

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export function useDocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [summary, setSummary] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('idle');
      setSummary('');
    }
  };

  const upload = async () => {
    if (!file) return;
    setStatus('uploading');
    setSummary('');
    try {
      const data = await uploadDocument(file);
      setSummary(data.summary || 'No summary returned.');
      setStatus('done');
    } catch {
      setSummary('Failed to process document. Please try again.');
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setSummary('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return { file, status, summary, fileInputRef, selectFile, upload, reset };
}
