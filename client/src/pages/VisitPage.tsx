import React from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'done';

const formatTime = (s: number): string =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const STATUS_LABELS: Record<RecordingStatus, string | ((timer: number) => string)> = {
  idle:       'Ready to record',
  recording:  (timer: number) => `Recording... ${formatTime(timer)}`,
  processing: 'Processing transcript...',
  done:       'Transcript ready',
};

interface ButtonConfig {
  label: string;
  action: string;
  style: string;
}

const BUTTONS: Partial<Record<RecordingStatus, ButtonConfig[]>> = {
  idle:      [{ label: 'Start Recording', action: 'start', style: 'btnPrimary' }],
  recording: [{ label: 'Stop',        action: 'stop',   style: 'btnDanger' },
              { label: 'Cancel',      action: 'cancel', style: 'btnSecondary' }],
  done:      [{ label: 'Record Again', action: 'cancel', style: 'btnSecondary' }],
};

const RecordingStatusDisplay = ({ status, timer }: { status: RecordingStatus; timer: number }) => {
  const label = typeof STATUS_LABELS[status] === 'function'
    ? STATUS_LABELS[status](timer)
    : STATUS_LABELS[status];

  return (
    <div style={styles.statusRow}>
      {status === 'recording' && <span style={styles.dot} />}
      <span style={styles.statusText}>{label}</span>
    </div>
  );
};

const RecordingControls = ({ status, handlers }: { status: RecordingStatus; handlers: Record<string, () => void> }) => (
  <div style={styles.buttonRow}>
    {(BUTTONS[status] || []).map(({ label, action, style }) => (
      <button key={action} style={styles[style as keyof typeof styles] as React.CSSProperties} onClick={handlers[action]}>
        {label}
      </button>
    ))}
  </div>
);

const TranscriptPanel = ({ status, transcript }: { status: RecordingStatus; transcript: string }) => {
  if (status !== 'processing' && status !== 'done') return null;
  return (
    <div style={styles.card}>
      <h2 style={styles.subtitle}>Transcript</h2>
      <p style={styles.transcript}>
        {status === 'processing' ? 'Transcribing...' : transcript || 'No transcript available.'}
      </p>
    </div>
  );
};

const SummaryPanel = ({ status, summary }: { status: RecordingStatus; summary: string }) => {
  if (status !== 'done' || !summary) return null;
  return (
    <div style={styles.card}>
      <h2 style={styles.subtitle}>Summary</h2>
      <p style={styles.transcript}>{summary}</p>
    </div>
  );
};

const VisitPage = () => {
  const { status, transcript, summary, timer, start, stop, cancel } = useAudioRecorder();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Visit Recording</h1>
      <div style={styles.card}>
        <RecordingStatusDisplay status={status as RecordingStatus} timer={timer} />
        <RecordingControls status={status as RecordingStatus} handlers={{ start, stop, cancel }} />
      </div>
      <TranscriptPanel status={status as RecordingStatus} transcript={transcript} />
      <SummaryPanel status={status as RecordingStatus} summary={summary} />
    </div>
  );
};

export default VisitPage;

const styles = {
  container:    { maxWidth: 640, margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' },
  title:        { fontSize: '1.5rem', marginBottom: '1.5rem' },
  subtitle:     { fontSize: '1.1rem', marginBottom: '0.5rem' },
  card:         { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: 8, padding: '1.5rem', marginBottom: '1rem' },
  statusRow:    { display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' },
  dot:          { width: 10, height: 10, borderRadius: '50%', background: 'red' },
  statusText:   { fontSize: '0.95rem', color: '#555' },
  buttonRow:    { display: 'flex', gap: '0.75rem' },
  btnPrimary:   { padding: '0.5rem 1.25rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  btnDanger:    { padding: '0.5rem 1.25rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  btnSecondary: { padding: '0.5rem 1.25rem', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' },
  transcript:   { lineHeight: 1.6, color: '#333', whiteSpace: 'pre-wrap' },
};
