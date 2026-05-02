import { useAudioRecorder } from '../hooks/useAudioRecorder';

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function VisitPage() {
  const { status, transcript, timer, start, stop, cancel } = useAudioRecorder();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Visit Recording</h1>

      <div style={styles.card}>
        <div style={styles.statusRow}>
          {status === 'recording' && <span style={styles.dot} />}
          <span style={styles.statusText}>
            {status === 'idle' && 'Ready to record'}
            {status === 'recording' && `Recording... ${formatTime(timer)}`}
            {status === 'processing' && 'Processing transcript...'}
            {status === 'done' && 'Transcript ready'}
          </span>
        </div>

        <div style={styles.buttonRow}>
          {status === 'idle' && (
            <button style={styles.btnPrimary} onClick={start}>Start Recording</button>
          )}
          {status === 'recording' && (
            <>
              <button style={styles.btnDanger} onClick={stop}>Stop</button>
              <button style={styles.btnSecondary} onClick={cancel}>Cancel</button>
            </>
          )}
          {status === 'done' && (
            <button style={styles.btnSecondary} onClick={cancel}>Record Again</button>
          )}
        </div>
      </div>

      {(status === 'processing' || status === 'done') && (
        <div style={styles.card}>
          <h2 style={styles.subtitle}>Transcript</h2>
          <p style={styles.transcript}>
            {status === 'processing' ? 'Transcribing...' : transcript || 'No transcript available.'}
          </p>
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
  statusRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' },
  dot: { width: 10, height: 10, borderRadius: '50%', background: 'red' },
  statusText: { fontSize: '0.95rem', color: '#555' },
  buttonRow: { display: 'flex', gap: '0.75rem' },
  btnPrimary: { padding: '0.5rem 1.25rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  btnDanger: { padding: '0.5rem 1.25rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  btnSecondary: { padding: '0.5rem 1.25rem', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  transcript: { lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap' },
};
