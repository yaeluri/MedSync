import { useState, useRef, ChangeEvent } from 'react';
import { uploadDocument } from '../api/documents';
import { loadSession } from '../api/auth';

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export function useDocumentUpload(patientId?: string) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [summary, setSummary] = useState('');
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setStatus('idle');
      setSummary('');
      setUploadedId(null);
      setUploadedFileName(null);
    }
  };

  const upload = async () => {
    if (!file) return;
    const session = loadSession();
    setStatus('uploading');
    setSummary('');
    setUploadedId(null);
    setUploadedFileName(null);
    try {
      const data = await uploadDocument(file, patientId, session?.userId);
      setSummary(data.summary || 'No summary returned.');
      setUploadedId(data.id || null);
      setUploadedFileName(data.filename || file.name);
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
    setUploadedId(null);
    setUploadedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return { file, status, summary, uploadedId, uploadedFileName, fileInputRef, selectFile, upload, reset };
}
