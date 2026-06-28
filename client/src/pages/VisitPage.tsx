import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress,
  MenuItem, Paper, Snackbar, Stack, TextField, Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import StopIcon from '@mui/icons-material/Stop';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import {
  summarizeText, createVisit, upsertVisitSummary,
  addVisitDiagnosis, addVisitMedicine, updateVisit, getVisit,
  VisitSummaryObject,
} from '../api/visits';
import { loadSession } from '../api/auth';
import { getDiagnoses, Diagnosis } from '../api/diagnoses';
import { getMedicines, Medicine } from '../api/medicines';
import PageHeader from '../components/PageHeader';

// ── Types ───────────────────────────────────────────────────────────────────────────
type ToastState = { severity: 'success' | 'error' | 'warning'; message: string } | null;
type DiagnosisItem = { code: string; description: string };
type MedicineItem = { name: string; dosage: string; frequency: string; duration: string; instructions?: string };

// ── Styled layout components ─────────────────────────────────────────────────────────────────────
const PageRoot = styled(Box)({
  display: 'flex', flexDirection: 'column', flex: 1,
  overflow: 'hidden', background: '#f8f9fa', direction: 'rtl',
});

const PatientInfoBar = styled(Box)({
  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  padding: '8px 28px', background: '#f8f9fa',
  borderBottom: '1px solid #e9ecef', flexShrink: 0,
});

const FormColumn = styled(Box)({
  display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: 24, gap: 16,
});

const FormCard = styled(Paper)({
  borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column',
  gap: 14, position: 'relative', overflow: 'visible',
  border: '1px solid #e9ecef', boxShadow: 'none',
});

const AiPanel = styled(Box)({
  width: '25%', minWidth: 220, flexShrink: 0,
  borderRight: '1px solid #e9ecef', background: '#fff', display: 'flex', flexDirection: 'column',
});

const SummarySectionCard = styled(Box)({
  background: '#fff', border: '1px solid #e9ecef', borderRadius: 10,
  padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6,
});

// ── Reusable section header ─────────────────────────────────────────────────────────────────────
interface SectionHeaderProps { icon: React.ReactNode; label: string; color: string; bg: string; }
const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, label, color, bg }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, borderBottom: '1px solid #f1f3f5', pb: 1, mb: 0.5 }}>
    <Box sx={{ width: 30, height: 30, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color, flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>
      {label}
    </Typography>
  </Stack>
);

// ── Constants ──────────────────────────────────────────────────────────────────────────────
const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const SUMMARY_SECTIONS: Array<{ key: keyof VisitSummaryObject; label: string; icon: React.ReactNode; color: string; bg: string }> = [
  { key: 'patientComplaints',      label: 'תלונות המטופל', icon: <FavoriteIcon sx={{ fontSize: 14 }} />,            color: '#e64980', bg: '#fff0f6' },
  { key: 'diagnosis',              label: 'אבחנה',          icon: <MonitorHeartIcon sx={{ fontSize: 14 }} />,        color: '#7048e8', bg: '#f3f0ff' },
  { key: 'doctorsRecommendations', label: 'המלצות הרופא', icon: <TaskAltIcon sx={{ fontSize: 14 }} />, color: '#2f9e44', bg: '#ebfbee' },
];

const RTL_INPUT = { dir: 'rtl' as const, style: { textAlign: 'right' as const } };

// ── Main component ───────────────────────────────────────────────────────────────────────────
const VisitPage: React.FC = () => {
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
  const [toast, setToast] = useState<ToastState>(null);

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
  const [diagnosesList, setDiagnosesList] = useState<DiagnosisItem[]>([]);
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [diagnosisOptions, setDiagnosisOptions] = useState<Diagnosis[]>([]);
  // Medicines list
  const [medicinesList, setMedicinesList] = useState<MedicineItem[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [medicineOptions, setMedicineOptions] = useState<Medicine[]>([]);
  const [medicineDosage, setMedicineDosage] = useState('');
  const [medicineFrequency, setMedicineFrequency] = useState('');
  const [medicineDuration, setMedicineDuration] = useState('');

  // Pre-load options on first render so the dropdown is ready immediately on click
  useEffect(() => {
    getDiagnoses().then(res => setDiagnosisOptions(res.slice(0, 30))).catch(() => {});
    getMedicines().then(res => setMedicineOptions(res.slice(0, 30))).catch(() => {});
  }, []);

  // Debounced diagnosis search (runs when user types; keeps pre-loaded list when empty)
  useEffect(() => {
    if (!diagnosisSearch.trim()) return;
    const t = window.setTimeout(() => {
      getDiagnoses(diagnosisSearch).then(res => setDiagnosisOptions(res.slice(0, 10))).catch(() => {});
    }, 250);
    return () => window.clearTimeout(t);
  }, [diagnosisSearch]);

  // Debounced medicine search
  useEffect(() => {
    if (!medicineSearch.trim()) return;
    const t = window.setTimeout(() => {
      getMedicines(medicineSearch).then(res => setMedicineOptions(res.slice(0, 10))).catch(() => {});
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

  const handleRecord = () => isRecording ? stop() : start();

  const handleAddMedicine = () => {
    const name = medicineSearch.trim();
    if (!name || !medicineDosage.trim() || !medicineFrequency.trim() || !medicineDuration.trim()) return;
    setMedicinesList(prev => [...prev, {
      name, dosage: medicineDosage.trim(), frequency: medicineFrequency.trim(), duration: medicineDuration.trim(),
    }]);
    setMedicineSearch(''); setMedicineDosage(''); setMedicineFrequency(''); setMedicineDuration('');
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
    <PageRoot>
      <PageHeader
        title={isReadOnly ? 'ביקור קודם' : 'ביקור פעיל'}
        subtitle={
          isLoadingVisit ? 'טוען...'
          : isReadOnly ? visitDate ?? 'צפייה בלבד'
          : isRecording ? 'מקליט ומתעד...'
          : isProcessing ? 'מעבד...'
          : 'מוכן'
        }
        onBack={() => navigate(-1)}
      />

      {/* Patient info bar */}
      {patientInfo && (
        <PatientInfoBar>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
            <PersonIcon sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{patientInfo.name}</Typography>
          </Stack>
          {patientInfo.idNumber && <Chip label={`ID: ${patientInfo.idNumber}`} size="small" variant="outlined" sx={{ height: 24, fontSize: 12 }} />}
          {patientInfo.phone && <Chip icon={<PhoneIcon sx={{ fontSize: 12 }} />} label={patientInfo.phone} size="small" variant="outlined" sx={{ height: 24, fontSize: 12 }} />}
          {patientInfo.dob && <Chip label={`DOB: ${patientInfo.dob}`} size="small" variant="outlined" sx={{ height: 24, fontSize: 12 }} />}
          {patientInfo.hmo && <Chip label={`HMO: ${patientInfo.hmo}`} size="small" variant="outlined" sx={{ height: 24, fontSize: 12 }} />}
          {patientInfo.bloodType && <Chip label={`🩸 ${patientInfo.bloodType}`} size="small" sx={{ height: 24, fontSize: 12, background: '#fff5f5', color: '#e03131', border: '1px solid #ffc9c9' }} />}
        </PatientInfoBar>
      )}

      {/* Body layout */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Right: Visit form ── */}
        <FormColumn>
          <FormCard>
            {/* Processing overlay */}
            {isProcessing && (
              <Box sx={{ position: 'absolute', inset: 0, borderRadius: '14px', background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, zIndex: 10 }}>
                <CircularProgress size={24} />
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#3b5bdb' }}>מתמלל שמע...</Typography>
              </Box>
            )}

            {/* Form title row */}
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#868e96', letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1 }}>
                רשומת ביקור
              </Typography>
              <Chip label="טיוטא" size="small" sx={{ fontSize: 11, fontWeight: 600, color: '#e8590c', background: '#fff3e6', border: 'none', height: 22 }} />
              {isProcessing && (
                <Chip
                  icon={<CircularProgress size={10} sx={{ color: '#3b5bdb !important' }} />}
                  label="מתמלל..." size="small"
                  sx={{ fontSize: 11, fontWeight: 600, color: '#3b5bdb', background: '#eef2ff', height: 22 }}
                />
              )}
              {!isReadOnly && (
                <Button size="small" variant="outlined" onClick={handleRecord}
                  sx={{ minWidth: 36, width: 36, height: 36, p: 0, borderRadius: '8px', borderColor: '#e9ecef', color: '#3b5bdb', '&:hover': { background: '#eef2ff', borderColor: '#3b5bdb' } }}>
                  <KeyboardVoiceIcon sx={{ fontSize: 18 }} />
                </Button>
              )}
            </Stack>

            {/* ─ פרטי ביקור ─ */}
            <SectionHeader icon={<AssignmentIcon sx={{ fontSize: 16 }} />} label="פרטי ביקור" color="#3b5bdb" bg="#eef2ff" />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField select size="small" fullWidth label="סוג ביקור"
                value={visitType} onChange={e => setVisitType(e.target.value)}
                disabled={isReadOnly} slotProps={{ inputLabel: { shrink: true } }}>
                <MenuItem value="">בחר סוג...</MenuItem>
                <MenuItem value="REGULAR">רגיל</MenuItem>
                <MenuItem value="EMERGENCY">חירום</MenuItem>
                <MenuItem value="FOLLOW_UP">מעקב</MenuItem>
              </TextField>
              <TextField type="date" size="small" fullWidth label="תאריך מעקב"
                value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
                disabled={isReadOnly} slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            <TextField multiline rows={2} size="small" fullWidth label="הערות הפניה"
              placeholder="הערות הפניה..." value={referralNotes}
              onChange={e => setReferralNotes(e.target.value)} disabled={isReadOnly}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: RTL_INPUT }} />

            {/* ─ תלונות המטופל ─ */}
            <SectionHeader icon={<FavoriteIcon sx={{ fontSize: 16 }} />} label="תלונות המטופל" color="#e64980" bg="#fff0f6" />
            <TextField multiline rows={4} size="small" fullWidth placeholder="תלונות ותסמינים..."
              value={subjective} onChange={e => setSubjective(e.target.value)}
              disabled={isProcessing || isReadOnly} slotProps={{ htmlInput: RTL_INPUT }} />

            {/* ─ המלצות הרופא ─ */}
            <SectionHeader icon={<TaskAltIcon sx={{ fontSize: 16 }} />} label="המלצות הרופא" color="#2f9e44" bg="#ebfbee" />
            <TextField multiline rows={4} size="small" fullWidth placeholder="טיפול, תרופות, מעקב..."
              value={plan} onChange={e => setPlan(e.target.value)}
              disabled={isReadOnly} slotProps={{ htmlInput: RTL_INPUT }} />

            {/* ─ מדדים ─ */}
            <SectionHeader icon={<MonitorHeartIcon sx={{ fontSize: 16 }} />} label="מדדים" color="#0c8599" bg="#e3fafc" />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
              {([
                { label: 'לחץ דם',  placeholder: '120/80',  value: bloodPressure, onChange: setBloodPressure },
                { label: 'דופק',    placeholder: '72 bpm',  value: pulse,         onChange: setPulse },
                { label: 'חום',     placeholder: '36.6°C',  value: bodyTemp,      onChange: setBodyTemp },
                { label: 'משקל',    placeholder: '70 kg',   value: weight,        onChange: setWeight },
                { label: 'גובה',    placeholder: '170 cm',  value: height,        onChange: setHeight },
                { label: 'סטורציה', placeholder: '98%',     value: oxygenSat,     onChange: setOxygenSat },
              ] as const).map(({ label, placeholder, value, onChange }) => (
                <TextField key={label} size="small" fullWidth label={label} placeholder={placeholder}
                  value={value} onChange={e => onChange(e.target.value)}
                  disabled={isReadOnly} slotProps={{ inputLabel: { shrink: true }, htmlInput: RTL_INPUT }} />
              ))}
            </Box>


            {/* ─ אבחנות ICD-10 ─ */}
            <SectionHeader icon={<LocalHospitalIcon sx={{ fontSize: 16 }} />} label="אבחנות ICD-10" color="#7048e8" bg="#f3f0ff" />
            <Stack sx={{ gap: 0.5 }}>
              {diagnosesList.map((d, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75, background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                  <Typography sx={{ fontWeight: 700, color: '#7048e8', fontSize: 13, whiteSpace: 'nowrap' }}>{d.code}</Typography>
                  <Typography sx={{ flex: 1, color: '#495057', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description}</Typography>
                  {!isReadOnly && (
                    <Button size="small" onClick={() => setDiagnosesList(prev => prev.filter((_, idx) => idx !== i))}
                      sx={{ minWidth: 0, p: 0.25, color: '#adb5bd', '&:hover': { color: '#e03131' } }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
            {!isReadOnly && (
              <Autocomplete
                size="small"
                options={diagnosisOptions}
                getOptionLabel={opt => `${opt.code} — ${opt.description}`}
                filterOptions={x => x}
                inputValue={diagnosisSearch}
                onInputChange={(_, val, reason) => { if (reason !== 'reset') setDiagnosisSearch(val); }}
                onChange={(_, value) => {
                  if (!value) return;
                  const already = diagnosesList.some(d => d.code === value.code);
                  if (!already) setDiagnosesList(prev => [...prev, { code: value.code, description: value.description }]);
                  setTimeout(() => setDiagnosisSearch(''), 0);
                }}
                renderInput={params => (
                  <TextField {...params} placeholder="חפש קוד או תיאור ICD-10..."
                    slotProps={{ ...params.slotProps, htmlInput: { ...(params.slotProps?.htmlInput as object), ...RTL_INPUT } }} />
                )}
                renderOption={(props, opt) => (
                  <Box component="li" {...props} sx={{ direction: 'rtl' }}>
                    <Typography variant="body2"><strong style={{ color: '#7048e8' }}>{opt.code}</strong> — {opt.description}</Typography>
                  </Box>
                )}
                noOptionsText="לא נמצאו אבחנות"
                slotProps={{ popper: { placement: 'bottom-start', modifiers: [{ name: 'flip', enabled: false }] } }}
              />
            )}


            {/* ─ תרופות ─ */}
            <SectionHeader icon={<MedicationIcon sx={{ fontSize: 16 }} />} label="תרופות" color="#e8590c" bg="#fff3e6" />
            <Stack sx={{ gap: 0.5 }}>
              {medicinesList.map((m, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75, background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                  <Typography sx={{ fontWeight: 700, color: '#e8590c', fontSize: 13, whiteSpace: 'nowrap' }}>{m.name}</Typography>
                  <Typography sx={{ flex: 1, color: '#495057', fontSize: 13 }}>{m.dosage} · {m.frequency} · {m.duration}</Typography>
                  {!isReadOnly && (
                    <Button size="small" onClick={() => setMedicinesList(prev => prev.filter((_, idx) => idx !== i))}
                      sx={{ minWidth: 0, p: 0.25, color: '#adb5bd', '&:hover': { color: '#e03131' } }}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
            {!isReadOnly && (
              <Stack sx={{ gap: 1 }}>
                <Autocomplete
                  size="small"
                  options={medicineOptions}
                  getOptionLabel={opt => opt.name}
                  filterOptions={x => x}
                  inputValue={medicineSearch}
                  onInputChange={(_, val, reason) => { if (reason !== 'reset') setMedicineSearch(val); }}
                  onChange={(_, value) => {
                    if (!value) return;
                    setTimeout(() => setMedicineSearch(value.name), 0);
                  }}
                  renderInput={params => (
                    <TextField {...params} placeholder="חפש שם תרופה..."
                      slotProps={{ ...params.slotProps, htmlInput: { ...(params.slotProps?.htmlInput as object), ...RTL_INPUT } }} />
                  )}
                  renderOption={(props, opt) => (
                    <Box component="li" {...props} sx={{ direction: 'rtl' }}>
                      <Typography variant="body2">{opt.name}</Typography>
                    </Box>
                  )}
                  noOptionsText="לא נמצאו תרופות"
                  slotProps={{ popper: { placement: 'bottom-start', modifiers: [{ name: 'flip', enabled: false }] } }}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                  <TextField size="small" placeholder="מינון (100mg)" value={medicineDosage}
                    onChange={e => setMedicineDosage(e.target.value)} slotProps={{ htmlInput: RTL_INPUT }} />
                  <TextField size="small" placeholder="תדירות (פעם ביום)" value={medicineFrequency}
                    onChange={e => setMedicineFrequency(e.target.value)} slotProps={{ htmlInput: RTL_INPUT }} />
                  <TextField size="small" placeholder="משך טיפול (7 ימים)" value={medicineDuration}
                    onChange={e => setMedicineDuration(e.target.value)} slotProps={{ htmlInput: RTL_INPUT }} />
                </Box>
                <Button variant="outlined" size="small" onClick={handleAddMedicine}
                  sx={{ alignSelf: 'flex-start', px: 3, borderRadius: '6px', fontWeight: 600 }}>
                  הוסף תרופה
                </Button>
              </Stack>
            )}
          </FormCard>


          {!isReadOnly && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', px: 0.5 }}>
              <Button variant="contained" size="large" onClick={handleSave} disabled={saving}
                sx={{ borderRadius: '12px', px: 4.5, py: 1.5, fontSize: 15, fontWeight: 700, letterSpacing: '0.02em', background: '#3b5bdb', '&:hover': { background: '#3451c7' } }}>
                {saving ? 'שומר…' : 'שמור ואשר'}
              </Button>
            </Box>
          )}
        </FormColumn>

        {/* ── Left: AI summary ── */}
        <AiPanel>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', px: 2.5, borderBottom: '1px solid #e9ecef', height: 48, alignItems: 'flex-end' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#3b5bdb', borderBottom: '2px solid #3b5bdb', pb: 1.5 }}>
              סיכום בינה מלאכותית
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
            {isProcessing ? (
              <Typography sx={{ fontSize: 14, color: '#868e96', textAlign: 'center', mt: 5 }}>מנתח ביקור...</Typography>
            ) : (
              <Paper elevation={0} sx={{ borderRadius: 3, p: 1.75, background: '#f8f9fa', border: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: '#eef2ff', color: '#3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isSummarizing ? <CircularProgress size={14} sx={{ color: '#3b5bdb' }} /> : <AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                    תובנה MedSync
                    {isSummarizing && <Typography component="span" sx={{ fontWeight: 500, color: '#3b5bdb', fontSize: 11 }}> · מעדכן…</Typography>}
                  </Typography>
                </Stack>
                {liveSummary ? (
                  <Stack sx={{ gap: 1 }}>
                    {SUMMARY_SECTIONS.map(({ key, label, icon, color, bg }) => (
                      <SummarySectionCard key={key}>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 22, height: 22, borderRadius: '6px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {icon}
                          </Box>
                          <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>
                            {label}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 13, color: '#495057', lineHeight: 1.55, textAlign: 'right', direction: 'rtl', pl: 3.75 }}>
                          {liveSummary[key] || 'Not documented.'}
                        </Typography>
                      </SummarySectionCard>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ fontSize: 13, color: '#adb5bd', textAlign: 'center', lineHeight: 1.5 }}>
                    רשום או הקלט ביקור כדי לקבל סיכום.
                  </Typography>
                )}
              </Paper>
            )}
          </Box>
          {!isReadOnly && (
            <Box sx={{ p: 2 }}>
              <Button fullWidth
                variant={isRecording ? 'contained' : 'outlined'}
                color={isRecording ? 'error' : 'primary'}
                startIcon={isRecording ? <StopIcon /> : <KeyboardVoiceIcon />}
                onClick={handleRecord}
                sx={{
                  borderRadius: '10px', fontWeight: 600, fontSize: 14, py: 1.375,
                  ...(isRecording ? {} : { borderColor: '#3b5bdb', color: '#3b5bdb', '&:hover': { background: '#eef2ff', borderColor: '#3b5bdb' } }),
                }}>
                {isRecording ? `עצור הקלטה  ${formatTime(timer)}` : 'הקלט שמע לביקור'}
              </Button>
            </Box>
          )}
        </AiPanel>
      </Box>

      <Snackbar open={!!toast} autoHideDuration={3500} onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast?.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </PageRoot>
  );
};

export default VisitPage;

