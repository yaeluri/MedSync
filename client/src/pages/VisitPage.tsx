import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import styles from './VisitPage.module.css';

const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function VisitPage() {
  const navigate = useNavigate();
  const { status, transcript, summary, timer, start, stop } = useAudioRecorder();

  const [subjective, setSubjective] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');

  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';

  const handleRecord = () => {
    if (isRecording) {
      stop();
    } else {
      start();
    }
  };

  // Auto-fill subjective when transcript arrives
  const displaySubjective = subjective || (status === 'done' && transcript ? transcript : subjective);

  return (
    <div className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div>
              <div className={styles.encounterTitle}>Active Encounter</div>
              <div className={styles.encounterSub}>
                {isRecording ? 'Recording & Documenting...' : isProcessing ? 'Processing...' : 'Ready'}
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.doctorInfo}>
              <span className={styles.doctorName}>Dr. Rotem Philipp</span>
              <span className={styles.doctorSpec}>Cardiology</span>
            </div>
            <div className={styles.avatar}>DR</div>
          </div>
        </header>

        {/* Body */}
        <div className={styles.body}>
          {/* ── Left: Visit Note ── */}
          <div className={styles.leftColumn}>
            <div className={styles.noteForm}>
              <div className={styles.noteTitleRow}>
                <span className={styles.noteLabel}>VISIT NOTE</span>
                <span className={styles.draftBadge}>Draft</span>
                <button className={styles.micBtn} onClick={handleRecord} title="Toggle recording">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Subjective</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Patient complains of..."
                  value={displaySubjective}
                  onChange={e => setSubjective(e.target.value)}
                  rows={4}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Diagnosis</label>
                <input
                  className={styles.textInput}
                  type="text"
                  placeholder="ICD-10 Code..."
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Plan</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Treatment plan..."
                  value={plan}
                  onChange={e => setPlan(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <div className={styles.saveBar}>
              <button className={styles.saveBtn}>Save &amp; Sign</button>
            </div>
          </div>

          {/* ── Right: AI Summary ── */}
          <aside className={styles.aiPanel}>
            <div className={styles.aiTabBar}>
              <span className={styles.aiTab}>AI Summary</span>
            </div>

            <div className={styles.aiContent}>
              {isProcessing ? (
                <p className={styles.processingText}>Analyzing visit...</p>
              ) : (
                <div className={styles.insightCard}>
                  <div className={styles.insightIconWrap}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.insightTitle}>MedSync Insight</div>
                    <div className={styles.insightText}>
                      {summary || 'Cholesterol up 15% since last year.'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.recordBar}>
              <button
                className={`${styles.recordBtn} ${isRecording ? styles.recordBtnActive : ''}`}
                onClick={handleRecord}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                {isRecording ? `Stop Recording  ${formatTime(timer)}` : 'Record Visit Audio'}
              </button>
            </div>
          </aside>
        </div>
    </div>
  );
}
