import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import {
  summarizeText,
  createVisit,
  upsertVisitSummary,
  addVisitDiagnosis,
  getVisit,
  VisitSummaryObject,
} from '../api/visits';
import { loadSession } from '../api/auth';
import { useCurrentDoctor } from '../hooks/useCurrentDoctor';
import styles from './VisitPage.module.css';

const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const SUMMARY_SECTIONS: {
  key: keyof VisitSummaryObject;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}[] = [
  {
    key: 'patientComplaints',
    label: 'Patient Complaints',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    color: '#e64980',
    bg: '#fff0f6',
  },
  {
    key: 'diagnosis',
    label: 'Diagnosis',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    color: '#7048e8',
    bg: '#f3f0ff',
  },
  {
    key: 'doctorsRecommendations',
    label: "Doctor's Recommendations",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    color: '#2f9e44',
    bg: '#ebfbee',
  },
];

export default function VisitPage() {
  const navigate = useNavigate();
  const { id: patientId, visitId } = useParams<{ id: string; visitId: string }>();
  const session = loadSession();
  const doctor = useCurrentDoctor();
  const { status, transcript, summary, timer, start, stop } = useAudioRecorder();

  const [subjective, setSubjective] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  const [saving, setSaving] = useState(false);
  // Read-only when a patient (not a caregiver) opens a past visit.
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [visitDate, setVisitDate] = useState<string | null>(null);
  const [toast, setToast] = useState<
    { severity: 'success' | 'error' | 'warning'; message: string } | null
  >(null);

  // Live AI summary object from the server.
  const [liveSummary, setLiveSummary] = useState<VisitSummaryObject | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const lastSummarizedRef = useRef<string>('');

  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';

  // Load existing visit when visitId is in the URL.
  useEffect(() => {
    if (!visitId) return;
    let active = true;
    getVisit(visitId).then(v => {
      if (!active) return;
      // Only patients get a read-only view; doctors can edit past visits.
      setIsReadOnly(!!session?.patientId && !session?.caregiverId);
      setVisitDate(v.visitDate ? new Date(v.visitDate).toLocaleDateString() : null);
      const text = v.summary?.summaryText ?? '';
      // Parse the structured summary text back into fields.
      const extract = (label: string) => {
        const re = new RegExp(`${label}:\\n([\\s\\S]*?)(?=\\n\\n[A-Z][^\\n]+:\\n|$)`);
        return re.exec(text)?.[1]?.trim() ?? '';
      };
      setSubjective(extract('Subjective'));
      setDiagnosis(v.diagnoses?.[0]?.diagnosisDescription ?? extract('Diagnosis'));
      setPlan(extract('Plan'));
      // Reconstruct a summary object from the saved text for display
      setLiveSummary({
        patientComplaints: extract('Subjective') || 'Not documented.',
        diagnosis: (v.diagnoses?.[0]?.diagnosisDescription ?? extract('Diagnosis')) || 'Not documented.',
        doctorsRecommendations: extract('Plan') || 'Not documented.',
      });
    }).catch(() => {/* ignore — visit may have no summary */});
    return () => { active = false; };
  }, [visitId]);

  const handleRecord = () => {
    if (isRecording) {
      stop();
    } else {
      start();
    }
  };

  const handleSave = async () => {
    if (saving) return;
    if (!patientId) {
      setToast({
        severity: 'warning',
        message: 'Open a visit from a patient profile to save it.',
      });
      return;
    }
    if (!session?.caregiverId) {
      setToast({
        severity: 'error',
        message: 'Only signed-in doctors can save visits.',
      });
      return;
    }
    const hasAnyContent =
      subjective.trim() || diagnosis.trim() || plan.trim() || !!liveSummary;
    if (!hasAnyContent) {
      setToast({
        severity: 'warning',
        message: 'Add at least a subjective, diagnosis, or plan first.',
      });
      return;
    }

    setSaving(true);
    try {
      const visit = await createVisit({
        patientId,
        caregiverId: session.caregiverId,
        visitDate: new Date().toISOString(),
      });

      const parts: string[] = [];
      if (subjective.trim()) parts.push(`Subjective:\n${subjective.trim()}`);
      if (diagnosis.trim()) parts.push(`Diagnosis:\n${diagnosis.trim()}`);
      if (plan.trim()) parts.push(`Plan:\n${plan.trim()}`);
      // liveSummary is now a structured object — no need to persist separately (fields already in parts above)
      const summaryText = parts.join('\n\n');

      if (summaryText) {
        await upsertVisitSummary(visit.id, {
          summaryText,
          visitType: transcript ? 'RECORDING' : 'MANUAL_INPUT',
        });
      }

      if (diagnosis.trim()) {
        await addVisitDiagnosis(visit.id, {
          diagnosisCode: diagnosis.trim(),
          diagnosisDescription: diagnosis.trim(),
        });
      }

      setToast({ severity: 'success', message: 'Visit saved.' });
      window.setTimeout(() => {
        navigate(`/patients/${patientId}`);
      }, 700);
    } catch (err: any) {
      setToast({
        severity: 'error',
        message: err?.message || 'Failed to save visit.',
      });
    } finally {
      setSaving(false);
    }
  };

  // When the recorder summary arrives, use the structured object directly.
  useEffect(() => {
    if (!summary) return;
    setLiveSummary(summary);

    const { patientComplaints, diagnosis: diagText, doctorsRecommendations } = summary;

    const subjectiveText =
      (patientComplaints && patientComplaints !== 'Not documented.')
        ? patientComplaints
        : transcript;

    if (subjectiveText) {
      setSubjective(prev => prev || subjectiveText);
      // Mark this text as already summarised so the debounce doesn't re-fire.
      lastSummarizedRef.current = subjectiveText;
    }

    if (diagText && diagText !== 'Not documented.')
      setDiagnosis(prev => prev || diagText);

    if (doctorsRecommendations && doctorsRecommendations !== 'Not documented.')
      setPlan(prev => prev || doctorsRecommendations);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  // Fallback: if transcription succeeded but no summary, seed subjective from raw transcript.
  useEffect(() => {
    if (status === 'done' && transcript && !summary) {
      setSubjective(prev => prev || transcript);
    }
  }, [status, transcript, summary]);

  // Debounced re-summarization whenever the Subjective text changes.
  useEffect(() => {
    if (isReadOnly) return;
    const text = subjective.trim();
    if (!text || text === lastSummarizedRef.current) return;

    const handle = window.setTimeout(async () => {
      setIsSummarizing(true);
      try {
        const data = await summarizeText(text);
        setLiveSummary(data.summary);
        lastSummarizedRef.current = text;
      } catch {
        // Keep previous summary on failure.
      } finally {
        setIsSummarizing(false);
      }
    }, 800);

    return () => window.clearTimeout(handle);
  }, [subjective, isReadOnly]);

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
              <div className={styles.encounterTitle}>
                {isReadOnly ? 'Past Encounter' : 'Active Encounter'}
              </div>
              <div className={styles.encounterSub}>
                {isReadOnly
                  ? visitDate ?? 'View only'
                  : isRecording ? 'Recording & Documenting...' : isProcessing ? 'Processing...' : 'Ready'}
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.doctorInfo}>
              <span className={styles.doctorName}>{doctor.fullName}</span>
              <span className={styles.doctorSpec}>{doctor.specialization}</span>
            </div>
            <div className={styles.avatar}>{doctor.initials}</div>
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
                {isProcessing && (
                  <span className={styles.transcribingBadge}>
                    <span className={`${styles.spinner} ${styles.spinnerSm}`} />
                    Transcribing...
                  </span>
                )}
                {!isReadOnly && <button className={styles.micBtn} onClick={handleRecord} title="Toggle recording">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Subjective</label>
                <div className={styles.fieldWrap}>
                  <textarea
                    className={styles.textarea}
                    placeholder="Patient complains of..."
                    value={subjective}
                    onChange={e => setSubjective(e.target.value)}
                    rows={4}
                    disabled={isProcessing || isReadOnly}
                    readOnly={isReadOnly}
                  />
                  {isProcessing && (
                    <div className={styles.transcribingOverlay}>
                      <span className={styles.spinner} />
                      Transcribing audio...
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Diagnosis</label>
                <input
                  className={styles.textInput}
                  type="text"
                  placeholder="ICD-10 Code..."
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
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
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            {!isReadOnly && (
              <div className={styles.saveBar}>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                  style={saving ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                >
                  {saving ? 'Saving…' : 'Save & Sign'}
                </button>
              </div>
            )}
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
                  <div className={styles.insightHeader}>
                    <div className={styles.insightIconWrap}>
                      {isSummarizing ? (
                        <span className={`${styles.spinner} ${styles.spinnerSm}`} />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      )}
                    </div>
                    <div className={styles.insightTitle}>
                      MedSync Insight
                      {isSummarizing && (
                        <span className={styles.insightUpdating}> · updating…</span>
                      )}
                    </div>
                  </div>

                  {liveSummary ? (
                    <div className={styles.summaryCards}>
                      {SUMMARY_SECTIONS.map(({ key, label, icon, color, bg }) => (
                        <div key={key} className={styles.summarySection}>
                          <div className={styles.summarySectionHeader}>
                            <span className={styles.summarySectionIcon} style={{ background: bg, color }}>
                              {icon}
                            </span>
                            <span className={styles.summarySectionLabel} style={{ color }}>{label}</span>
                          </div>
                          <p className={styles.summarySectionContent}>
                            {liveSummary[key] || 'Not documented.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.emptyInsight}>Type or record a visit to generate an AI summary.</p>
                  )}
                </div>
              )}
            </div>

            {!isReadOnly && (
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
            )}
          </aside>
        </div>

        <Snackbar
          open={!!toast}
          autoHideDuration={3500}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={toast?.severity}
            variant="filled"
            onClose={() => setToast(null)}
            sx={{ borderRadius: 2 }}
          >
            {toast?.message}
          </Alert>
        </Snackbar>
    </div>
  );
}
