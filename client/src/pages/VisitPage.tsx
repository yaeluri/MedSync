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
import PageHeader from '../components/PageHeader';
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
    label: 'תלונות המטופל',
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
    label: 'אבחנה',
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
    label: 'המלצות הרופא',
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
  const [isLoadingVisit, setIsLoadingVisit] = useState(false);
  const lastSummarizedRef = useRef<string>('');
  const [patientInfo, setPatientInfo] = useState<{ name: string; phone?: string; idNumber?: string; dob?: string; hmo?: string; bloodType?: string } | null>(null);

  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';

  // Load existing visit when visitId is in the URL.
  useEffect(() => {
    if (!visitId) return;
    let active = true;
    setIsLoadingVisit(true);
    getVisit(visitId).then(v => {
      if (!active) return;
      // Only patients get a read-only view; doctors can edit past visits.
      setIsReadOnly(!!session?.patientId && !session?.caregiverId);
      setVisitDate(v.visitDate ? new Date(v.visitDate).toLocaleDateString() : null);
      const raw = v.summary?.summaryText ?? '';
      // Normalise CRLF → LF before parsing.
      const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      // Parse the structured summary text back into fields.
      const extract = (label: string) => {
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`${escaped}:\\n([\\s\\S]*?)(?=\\n\\n[^\\n]+:\\n|$)`);
        return re.exec(text)?.[1]?.trim() ?? '';
      };
      const complaints = extract('Patient Complaints');
      const diag = extract('Diagnosis');
      const recs = extract("Doctor's Recommendations");
      // Fallback: if nothing was extracted but summaryText exists, put it all in subjective.
      const fallbackSubjective = (!complaints && !diag && !recs && text) ? text : complaints;
      setSubjective(fallbackSubjective);
      setDiagnosis(diag);
      setPlan(recs);
      // Prevent the debounce from re-summarizing the loaded text and overwriting liveSummary.
      lastSummarizedRef.current = fallbackSubjective;
      // Reconstruct a summary object from the saved text for display
      setLiveSummary({
        patientComplaints: fallbackSubjective || 'Not documented.',
        diagnosis: diag || 'Not documented.',
        doctorsRecommendations: recs || 'Not documented.',
      });
      // Populate patient context bar
      if (v.patient?.user) {
        const u = v.patient.user;
        const dob = u.birthDate ? new Date(u.birthDate).toLocaleDateString('en-GB') : undefined;
        setPatientInfo({
          name: u.fullName,
          phone: u.phone,
          idNumber: v.patient.idNumber,
          dob,
          hmo: v.patient.hmo,
          bloodType: v.patient.bloodType,
        });
      }
    }).catch((err: any) => {
      if (!active) return;
      const msg = err?.message || 'Failed to load visit data.';
      setToast({ severity: 'error', message: `Load error: ${msg}` });
    }).finally(() => {
      if (active) setIsLoadingVisit(false);
    });
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
        message: 'פתח ביקור מפרופיל מטופל כדי לשמור.',
      });
      return;
    }
    if (!session?.caregiverId) {
      setToast({
        severity: 'error',
        message: 'רק רופאים מחוברים יכולים לשמור ביקור.',
      });
      return;
    }
    const hasAnyContent =
      subjective.trim() || diagnosis.trim() || plan.trim() || !!liveSummary;
    if (!hasAnyContent) {
      setToast({
        severity: 'warning',
        message: 'הוסף תלונה, אבחנה או המלצות לפני שמירה.',
      });
      return;
    }

    setSaving(true);
    try {
      // Re-use the existing visit if we opened one, otherwise create a new one.
      const targetId = visitId ?? (await createVisit({
        patientId,
        caregiverId: session.caregiverId,
        visitDate: new Date().toISOString(),
      })).id;

      const parts: string[] = [];
      if (subjective.trim()) parts.push(`Patient Complaints:\n${subjective.trim()}`);
      if (diagnosis.trim()) parts.push(`Diagnosis:\n${diagnosis.trim()}`);
      if (plan.trim()) parts.push(`Doctor's Recommendations:\n${plan.trim()}`);
      const summaryText = parts.join('\n\n');

      if (summaryText) {
        await upsertVisitSummary(targetId, {
          summaryText,
          visitType: transcript ? 'RECORDING' : 'MANUAL_INPUT',
        });
      }

      if (diagnosis.trim()) {
        await addVisitDiagnosis(targetId, {
          diagnosisCode: diagnosis.trim(),
          diagnosisDescription: diagnosis.trim(),
        });
      }

      setToast({ severity: 'success', message: 'ביקור נשמר.' });
      window.setTimeout(() => {
        navigate(`/patients/${patientId}`);
      }, 700);
    } catch (err: any) {
      setToast({
        severity: 'error',
        message: err?.message || 'שמירת ביקור נכשלה.',
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
    if (status !== 'done') return;
    if (!transcript && !summary) {
      setToast({ severity: 'error', message: 'תמלול נכשל. נסה שנית.' });
      return;
    }
    if (transcript && !summary) {
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
        <PageHeader
          title={isReadOnly ? 'ביקור קודם' : 'ביקור פעיל'}
          subtitle={
            isLoadingVisit ? 'טוען...'
            : isReadOnly ? visitDate ?? 'צפייה בלבד'
            : isRecording ? 'מקליט ומתעד...' : isProcessing ? 'מעבד...' : 'מוכן'
          }
          onBack={() => navigate(-1)}
        />

        {/* Patient context bar */}
        {patientInfo && (
          <div className={styles.patientBar}>
            <div className={styles.patientBarName}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {patientInfo.name}
            </div>
            {patientInfo.idNumber && <span className={styles.patientBarChip}>ID: {patientInfo.idNumber}</span>}
            {patientInfo.phone && (
              <span className={styles.patientBarChip}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.5 12.31 19.79 19.79 0 0 1 1.1 3.65 2 2 0 0 1 3.08 1.5h3a2 2 0 0 1 2 1.72c.13 1 .38 1.98.74 2.91a2 2 0 0 1-.45 2.11L7.09 9.5a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.93.36 1.91.61 2.91.74A2 2 0 0 1 22 16.92z"/>
                </svg>
                {patientInfo.phone}
              </span>
            )}
            {patientInfo.dob && <span className={styles.patientBarChip}>DOB: {patientInfo.dob}</span>}
            {patientInfo.hmo && <span className={styles.patientBarChip}>HMO: {patientInfo.hmo}</span>}
            {patientInfo.bloodType && <span className={styles.patientBarChip} style={{ background: '#fff5f5', color: '#e03131' }}>🩸 {patientInfo.bloodType}</span>}
          </div>
        )}

        {/* Body */}
        <div className={styles.body}>
          {/* ── Right: Visit Note ── */}
          <div className={styles.leftColumn}>
            <div className={`${styles.noteForm} ${isProcessing ? styles.noteFormProcessing : ''}`}>
              {isProcessing && (
                <div className={styles.formOverlay}>
                  <span className={styles.spinner} />
                  <span className={styles.formOverlayText}>מתמלל שמע...</span>
                </div>
              )}
              <div className={styles.noteTitleRow}>
                <span className={styles.noteLabel}>רשומת ביקור</span>
                <span className={styles.draftBadge}>טיוטא</span>
                {isProcessing && (
                  <span className={styles.transcribingBadge}>
                    <span className={`${styles.spinner} ${styles.spinnerSm}`} />
                    מתמלל...
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
                <label className={styles.fieldLabel}>תלונות המטופל</label>
                <div className={styles.fieldWrap}>
                  <textarea
                    className={styles.textarea}
                    placeholder="תלונות ותסמינים..."
                    value={subjective}
                    onChange={e => setSubjective(e.target.value)}
                    rows={4}
                    disabled={isProcessing || isReadOnly}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>אבחנה</label>
                <input
                  className={styles.textInput}
                  type="text"
                  placeholder="קוד ICD-10..."
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>המלצות הרופא</label>
                <textarea
                  className={styles.textarea}
                  placeholder="טיפול, תרופות, מעקב..."
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
                  {saving ? 'שומר…' : 'שמור ואשר'}
                </button>
              </div>
            )}
          </div>

          {/* ── Left: AI Summary ── */}
          <aside className={styles.aiPanel}>
            <div className={styles.aiTabBar}>
              <span className={styles.aiTab}>סיכום בינה מלאכותית</span>
            </div>

            <div className={styles.aiContent}>
              {isProcessing ? (
                <p className={styles.processingText}>מנתח ביקור...</p>
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
                      תובנה MedSync
                      {isSummarizing && (
                        <span className={styles.insightUpdating}> · מעדכן…</span>
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
                    <p className={styles.emptyInsight}>רשום או הקלט ביקור כדי לקבל סיכום.</p>
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
                  {isRecording ? `עצור הקלטה  ${formatTime(timer)}` : 'הקלט שמע לביקור'}
                </button>
              </div>
            )}          </aside>
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
