import { useDocumentUpload } from '../hooks/useDocumentUpload';

export default function DocumentsPage() {
  const { file, status, summary, fileInputRef, selectFile, upload, reset } = useDocumentUpload();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Document Summary</h1>

      <div style={styles.card}>
        <label style={styles.label}>Upload a medical document (PDF or image)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          onChange={selectFile}
          style={styles.input}
        />
        {file && <p style={styles.fileName}>Selected: {file.name}</p>}

        <div style={styles.buttonRow}>
          <button
            style={file && status !== 'uploading' ? styles.btnPrimary : styles.btnDisabled}
            onClick={upload}
            disabled={!file || status === 'uploading'}
          >
            {status === 'uploading' ? 'Processing...' : 'Upload & Summarize'}
          </button>
          {(file || summary) && (
            <button style={styles.btnSecondary} onClick={reset}>Clear</button>
          )}
        </div>
      </div>

      {(status === 'done' || status === 'error') && (
        <div style={{ ...styles.card, borderColor: status === 'error' ? '#dc3545' : '#ddd' }}>
          <h2 style={styles.subtitle}>AI Summary</h2>
          <p style={styles.summary}>{summary}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 640, margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' },
  title: { fontSize: '1.5rem', marginBottom: '1.5rem' },
  subtitle: { fontSize: '1.1rem', marginBottom: '0.5rem' },
  card: { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.75rem', fontWeight: 500 },
  input: { display: 'block', marginBottom: '0.75rem' },
  fileName: { fontSize: '0.85rem', color: '#555', marginBottom: '0.75rem' },
  buttonRow: { display: 'flex', gap: '0.75rem' },
  btnPrimary: { padding: '0.5rem 1.25rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  btnDisabled: { padding: '0.5rem 1.25rem', background: '#aaa', color: '#fff', border: 'none', borderRadius: 6, cursor: 'not-allowed' },
  btnSecondary: { padding: '0.5rem 1.25rem', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  summary: { lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap' },
};
