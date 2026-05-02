import { useState, useRef } from 'react';
import { uploadDocument } from '../api/documents';

export function useDocumentUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | done | error
  const [summary, setSummary] = useState('');
  const fileInputRef = useRef(null);

  const selectFile = (e) => {
    const selected = e.target.files[0];
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
