import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import {
  summarizeText,
  createVisit,
  upsertVisitSummary,
  addVisitDiagnosis,
  addVisitMedicine,
  updateVisit,
  getVisit,
  VisitSummaryObject,
} from '../api/visits';
import { loadSession } from '../api/auth';
import { getDiagnoses } from '../api/diagnoses';
import { getMedicines } from '../api/medicines';
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

  // Vitals
  const [bloodPressure, setBloodPressure] = useState('');
  const [pulse, setPulse] = useState('');
  const [bodyTemp, setBodyTemp] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [oxygenSat, setOxygenSat] = useState('');
  // Visit metadata
  const [visitType, setVisitType] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [referralNotes, setReferralNotes] = useState('');
  // Diagnoses list
  const [diagnosesList, setDiagnosesList] = useState<Array<{ code: string; description: string }>>([]);
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [diagnosisOptions, setDiagnosisOptions] = useState<Array<{ id: string; code: string; description: string }>>([]);
  const [diagnosisDropOpen, setDiagnosisDropOpen] = useState(false);
  // Medicines list
  const [medicinesList, setMedicinesList] = useState<Array<{ name: string; dosage: string; frequency: string; duration: string; instructions?: string }>>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineOptions, setMedicineOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [medicineDrop0pen, setMedicineDrop0pen] = useState(false);
  const [selectedMedicineName, setSelectedMedicineName] = useState('');
  const [medicineDosage, setMedicineDosage] = useState('');
  const [medicineFrequency, setMedicineFrequency] = useState('');
  const [medicineDuration, setMedicineDuration] = useState('');

  // Debounced diagnosis search
  useEffect(() => {
    if (!diagnosisSearch.trim()) { setDiagnosisOptions([]); setDiagnosisDropOpen(false); return; }
    const t = window.setTimeout(() => {
      getDiagnoses(diagnosisSearch).then(res => {
        setDiagnosisOptions(res.slice(0, 10));
        setDiagnosisDropOpen(res.length > 0);
      }).catch(() => {});
    }, 250);
    return () => window.clearTimeout(t);
  }, [diagnosisSearch]);

  // Debounced medicine search
  useEffect(() => {
    if (!medicineSearch.trim()) { setMedicineOptions([]); setMedicineDrop0pen(false); return; }
    const t = window.setTimeout(() => {
      getMedicines(medicineSearch).then(res => {
        setMedicineOptions(res.slice(0, 10));
        setMedicineDrop0pen(res.length > 0);
      }).catch(() => {});
    }, 250);
    return () => window.clearTimeout(t);
  }, [medicineSearch]);

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
      // Populate new vitals and metadata fields
      setBloodPressure(v.bloodPressure ?? '');
      setPulse(v.pulse ?? '');
      setBodyTemp(v.bodyTemp ?? '');
      setWeight(v.weight ?? '');
      setHeight(v.height ?? '');
      setOxygenSat(v.oxygenSat ?? '');
      setVisitType(v.visitType ?? '');
      setFollowUpDate(v.followUpDate ?? '');
      setReferralNotes(v.referralNotes ?? '');
      // Populate diagnoses list from existing visit_diagnoses
      if (v.diagnoses && v.diagnoses.length > 0) {
        setDiagnosesList(v.diagnoses.map((d: any) => ({
          code: d.diagnosis?.code ?? '',
          description: d.diagnosis?.description ?? '',
        })));
      }
      // Populate medicines list from existing visit_medicines
      if (v.medicines && v.medicines.length > 0) {
        setMedicinesList(v.medicines.map((m: any) => ({
          name: m.medicine?.name ?? '',
          dosage: m.dosage ?? '',
          frequency: m.frequency ?? '',
          duration: m.duration ?? '',
          instructions: m.instructions,
        })));
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
      const vitalsAndMeta = {
        bloodPressure: bloodPressure.trim() || undefined,
        pulse: pulse.trim() || undefined,
        bodyTemp: bodyTemp.trim() || undefined,
        weight: weight.trim() || undefined,
        height: height.trim() || undefined,
        oxygenSat: oxygenSat.trim() || undefined,
        visitType: visitType || undefined,
        followUpDate: followUpDate || undefined,
        referralNotes: referralNotes.trim() || undefined,
      };

      const targetId = visitId ?? (await createVisit({
        patientId,
        caregiverId: session.caregiverId,
        visitDate: new Date().toISOString(),
        ...vitalsAndMeta,
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

      // If editing an existing visit, persist vitals/metadata via updateVisit
      if (visitId) {
        await updateVisit(targetId, vitalsAndMeta);
      }

      // Save diagnoses list
      for (const item of diagnosesList) {
        await addVisitDiagnosis(targetId, {
          diagnosisCode: item.code,
          diagnosisDescription: item.description,
        });
      }

      // Save medicines list
      for (const item of medicinesList) {
        await addVisitMedicine(targetId, {
          medicineName: item.name,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions,
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

              {/* Visit Details */}
              <div className={styles.formSectionHeader}>
                <span className={styles.formSectionIcon} style={{ background: '#eef2ff', color: '#3b5bdb' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </span>
                <span className={styles.formSectionLabel} style={{ color: '#3b5bdb' }}>פרטי ביקור</span>
              </div>

              {/* Visit Metadata — top of form */}
              <div className={styles.visitMetaGrid}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>סוג ביקור</label>
                  <select
                    className={styles.selectInput}
                    value={visitType}
                    onChange={e => setVisitType(e.target.value)}
                    disabled={isReadOnly}
                  >
                    <option value="">בחר סוג...</option>
                    <option value="REGULAR">רגיל</option>
                    <option value="EMERGENCY">חירום</option>
                    <option value="FOLLOW_UP">מעקב</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>תאריך מעקב</label>
                  <input
                    className={styles.textInput}
                    type="date"
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>הערות הפניה</label>
                <textarea
                  className={styles.textarea}
                  placeholder="הערות הפניה..."
                  value={referralNotes}
                  onChange={e => setReferralNotes(e.target.value)}
                  rows={2}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>

              <div className={styles.formSectionHeader}>
                <span className={styles.formSectionIcon} style={{ background: '#fff0f6', color: '#e64980' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </span>
                <span className={styles.formSectionLabel} style={{ color: '#e64980' }}>תלונות המטופל</span>
              </div>
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

              <div className={styles.formSectionHeader}>
                <span className={styles.formSectionIcon} style={{ background: '#ebfbee', color: '#2f9e44' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </span>
                <span className={styles.formSectionLabel} style={{ color: '#2f9e44' }}>המלצות הרופא</span>
              </div>
              <textarea
                className={styles.textarea}
                placeholder="טיפול, תרופות, מעקב..."
                value={plan}
                onChange={e => setPlan(e.target.value)}
                rows={4}
                disabled={isReadOnly}
                readOnly={isReadOnly}
              />

              {/* Vitals */}
              <div className={styles.formSectionHeader}>
                <span className={styles.formSectionIcon} style={{ background: '#e3fafc', color: '#0c8599' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </span>
                <span className={styles.formSectionLabel} style={{ color: '#0c8599' }}>מדדים</span>
              </div>
              <div className={styles.vitalsGrid}>
                <div className={styles.vitalField}>
                  <label className={styles.fieldLabel}>לחץ דם</label>
                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="120/80"
                    value={bloodPressure}
                    onChange={e => setBloodPressure(e.target.value)}
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                </div>
                <div className={styles.vitalField}>
                  <label className={styles.fieldLabel}>דופק</label>
                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="72 bpm"
                    value={pulse}
                    onChange={e => setPulse(e.target.value)}
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                </div>
                <div className={styles.vitalField}>
                  <label className={styles.fieldLabel}>חום</label>
                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="36.6°C"
                    value={bodyTemp}
                    onChange={e => setBodyTemp(e.target.value)}
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                </div>
                <div className={styles.vitalField}>
                  <label className={styles.fieldLabel}>משקל</label>
                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="70 kg"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                </div>
                <div className={styles.vitalField}>
                  <label className={styles.fieldLabel}>גובה</label>
                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="170 cm"
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                </div>
                <div className={styles.vitalField}>
                  <label className={styles.fieldLabel}>סטורציה</label>
                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="98%"
                    value={oxygenSat}
                    onChange={e => setOxygenSat(e.target.value)}
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                </div>
              </div>

              {/* Diagnoses */}
              <div className={styles.formSectionHeader}>
                <span className={styles.formSectionIcon} style={{ background: '#f3f0ff', color: '#7048e8' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </span>
                <span className={styles.formSectionLabel} style={{ color: '#7048e8' }}>אבחנות ICD-10</span>
              </div>
              {diagnosesList.map((d, i) => (
                <div key={i} className={styles.listItem}>
                  <span className={styles.listItemCode}>{d.code}</span>
                  <span className={styles.listItemDesc}>{d.description}</span>
                  {!isReadOnly && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => setDiagnosesList(prev => prev.filter((_, idx) => idx !== i))}
                      type="button"
                    >×</button>
                  )}
                </div>
              ))}
              {!isReadOnly && (
                <div className={styles.searchCombo}>
                  <input
                    className={styles.textInput}
                    type="text"
                    placeholder="חפש קוד או תיאור ICD-10..."
                    value={diagnosisSearch}
                    onChange={e => setDiagnosisSearch(e.target.value)}
                    onFocus={() => {
                      if (diagnosisOptions.length > 0) {
                        setDiagnosisDropOpen(true);
                      } else {
                        getDiagnoses().then(res => {
                          setDiagnosisOptions(res.slice(0, 20));
                          setDiagnosisDropOpen(res.length > 0);
                        }).catch((err: any) => {
                          setToast({ severity: 'error', message: 'שגיאה בטעינת אבחנות: ' + (err?.message || 'בעיית רשת') });
                        });
                      }
                    }}
                    onBlur={() => window.setTimeout(() => setDiagnosisDropOpen(false), 150)}
                    autoComplete="off"
                  />
                  {diagnosisDropOpen && (
                    <ul className={styles.searchDropdown}>
                      {diagnosisOptions.map(opt => (
                        <li
                          key={opt.id}
                          className={styles.searchDropdownItem}
                          onMouseDown={() => {
                            const already = diagnosesList.some(d => d.code === opt.code);
                            if (!already) setDiagnosesList(prev => [...prev, { code: opt.code, description: opt.description }]);
                            setDiagnosisSearch('');
                            setDiagnosisDropOpen(false);
                          }}
                        >
                          <span className={styles.dropCode}>{opt.code}</span>
                          <span className={styles.dropDesc}>{opt.description}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Medicines */}
              <div className={styles.formSectionHeader}>
                <span className={styles.formSectionIcon} style={{ background: '#fff3e6', color: '#e8590c' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>
                  </svg>
                </span>
                <span className={styles.formSectionLabel} style={{ color: '#e8590c' }}>תרופות</span>
              </div>
              {medicinesList.map((m, i) => (
                <div key={i} className={styles.listItem}>
                  <span className={styles.listItemCode}>{m.name}</span>
                  <span className={styles.listItemDesc}>{m.dosage} · {m.frequency} · {m.duration}</span>
                  {!isReadOnly && (
                    <button
                      className={styles.removeBtn}
                      onClick={() => setMedicinesList(prev => prev.filter((_, idx) => idx !== i))}
                      type="button"
                    >×</button>
                  )}
                </div>
              ))}
              {!isReadOnly && (
                <div className={styles.medicineAddForm}>
                  <div className={styles.searchCombo}>
                    <input
                      className={styles.textInput}
                      type="text"
                      placeholder="חפש שם תרופה..."
                      value={medicineSearch}
                      onChange={e => { setMedicineSearch(e.target.value); setSelectedMedicineName(''); }}
                      onFocus={() => {
                        if (medicineOptions.length > 0) {
                          setMedicineDrop0pen(true);
                        } else {
                          getMedicines().then(res => {
                            setMedicineOptions(res.slice(0, 20));
                            setMedicineDrop0pen(res.length > 0);
                          }).catch((err: any) => {
                            setToast({ severity: 'error', message: 'שגיאה בטעינת תרופות: ' + (err?.message || 'בעיית רשת') });
                          });
                        }
                      }}
                      onBlur={() => window.setTimeout(() => setMedicineDrop0pen(false), 150)}
                      autoComplete="off"
                    />
                    {medicineDrop0pen && (
                      <ul className={styles.searchDropdown}>
                        {medicineOptions.map(opt => (
                          <li
                            key={opt.id}
                            className={styles.searchDropdownItem}
                            onMouseDown={() => {
                              setSelectedMedicineName(opt.name);
                              setMedicineSearch(opt.name);
                              setMedicineDrop0pen(false);
                            }}
                          >
                            <span className={styles.dropDesc}>{opt.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className={styles.medicineMetaRow}>
                    <input
                      className={styles.textInput}
                      type="text"
                      placeholder="מינון (100mg)"
                      value={medicineDosage}
                      onChange={e => setMedicineDosage(e.target.value)}
                    />
                    <input
                      className={styles.textInput}
                      type="text"
                      placeholder="תדירות (פעם ביום)"
                      value={medicineFrequency}
                      onChange={e => setMedicineFrequency(e.target.value)}
                    />
                    <input
                      className={styles.textInput}
                      type="text"
                      placeholder="משך טיפול (7 ימים)"
                      value={medicineDuration}
                      onChange={e => setMedicineDuration(e.target.value)}
                    />
                  </div>
                  <button
                    className={styles.addBtn}
                    type="button"
                    onClick={() => {
                      const name = selectedMedicineName || medicineSearch.trim();
                      if (!name || !medicineDosage.trim() || !medicineFrequency.trim() || !medicineDuration.trim()) return;
                      setMedicinesList(prev => [...prev, {
                        name,
                        dosage: medicineDosage.trim(),
                        frequency: medicineFrequency.trim(),
                        duration: medicineDuration.trim(),
                      }]);
                      setMedicineSearch('');
                      setSelectedMedicineName('');
                      setMedicineDosage('');
                      setMedicineFrequency('');
                      setMedicineDuration('');
                    }}
                  >הוסף תרופה</button>
                </div>
              )}
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
