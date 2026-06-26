import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Stack,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getPatientById, Patient } from '../api/patients';
import { uploadDocument } from '../api/documents';
import { loadSession } from '../api/auth';
import {
  getMedicalDocuments,
  MedicalDocument,
  DocumentTypeEnum,
  SummaryStatus,
} from '../api/medical-documents';
import { useAsyncData } from '../hooks/useAsyncData';
import { useCameraStream } from '../hooks/useCameraStream';
import { UploadModal } from '../components/patientDashboard/UploadModal';
import DocumentSummaryModal from '../components/DocumentSummaryModal';

type FilterKey = 'all' | DocumentTypeEnum;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'LAB_RESULT', label: 'בדיקות מעבדה' },
  { key: 'REFERRAL', label: 'הפניות' },
  { key: 'DISCHARGE_SUMMARY', label: 'סיכומים' },
];

const DOC_TYPE_LABELS: Record<DocumentTypeEnum, string> = {
  LAB_RESULT: 'בדיקת מעבדה',
  REFERRAL: 'הפניה',
  DISCHARGE_SUMMARY: 'סיכום שחרור',
  IMAGING: 'דימות',
  PRESCRIPTION: 'מרשם',
  OTHER: 'אחר',
};

function fileBadge(doc: MedicalDocument): { label: string; color: string; bg: string } {
  const fmt = (doc.fileFormat || doc.fileName.split('.').pop() || '').toLowerCase();
  if (fmt.includes('pdf')) return { label: 'PDF', color: '#e03131', bg: '#fff0f0' };
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'img', 'image', 'tiff'].some(x => fmt.includes(x)))
    return { label: 'IMG', color: '#1971c2', bg: '#e7f1ff' };
  if (['doc', 'docx'].some(x => fmt.includes(x))) return { label: 'DOC', color: '#2f6f4f', bg: '#e7f6ee' };
  return { label: (fmt || 'FILE').toUpperCase().slice(0, 4), color: '#495057', bg: '#f1f3f5' };
}

function statusChip(status: SummaryStatus): { label: string; color: string; bg: string } {
  if (status === 'SUCCESS') return { label: 'נותח', color: '#2f9e44', bg: '#ebfbee' };
  if (status === 'PROCESSING') return { label: 'מעבד', color: '#e8590c', bg: '#fff4e6' };
  return { label: 'נכשל', color: '#e03131', bg: '#fff0f0' };
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const session = loadSession();
  const isDoctorView = !!id;
  // Tenant scope: doctors open a patient via the route param; patients see only their own records.
  const patientId = id ?? session?.patientId;

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [summaryModal, setSummaryModal] = useState<{ id: string; name: string } | null>(null);

  const { data: patient } = useAsyncData<Patient | null>(
    () => (patientId ? getPatientById(patientId) : Promise.resolve(null)),
    [patientId],
  );

  const { data: documents, status } = useAsyncData<MedicalDocument[]>(
    () => (patientId ? getMedicalDocuments(patientId) : Promise.resolve([])),
    [patientId, refreshKey],
  );

  // Poll the list while any document is still being analyzed in the background.
  const hasProcessing = (documents ?? []).some(d => d.summaryStatus === 'PROCESSING');
  useEffect(() => {
    if (!hasProcessing) return;
    const t = setInterval(() => setRefreshKey(k => k + 1), 3000);
    return () => clearInterval(t);
  }, [hasProcessing]);

  const { videoRef, canvasRef, cameraMode, setCameraMode, cameraError, stopCamera, capture } =
    useCameraStream();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const closeUpload = () => {
    stopCamera();
    setUploadOpen(false);
  };

  const handleUpload = async (file: File) => {
    if (!patientId) return;
    setUploading(true);
    try {
      await uploadDocument(file, patientId, session?.userId);
      setRefreshKey(k => k + 1);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    closeUpload();
    handleUpload(file);
    e.target.value = '';
  };

  const handleCapture = () => {
    capture(file => {
      setUploadOpen(false);
      handleUpload(file);
    });
  };

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'מטופל';
  const title = isDoctorView ? `מסמכים — ${patientName}` : 'המסמכים הרפואיים שלי';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (documents ?? []).filter(d => {
      if (filter !== 'all' && d.documentType !== filter) return false;
      if (!q) return true;
      const typeLabel = d.documentType ? DOC_TYPE_LABELS[d.documentType] : '';
      return d.fileName.toLowerCase().includes(q) || typeLabel.toLowerCase().includes(q);
    });
  }, [documents, filter, query]);

  const stateMsg = (text: string) => (
    <Typography sx={{ textAlign: 'center', color: '#868e96', fontSize: 14, py: 8 }}>{text}</Typography>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
      {uploading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300 }} />}
      {/* Top bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          height: 72,
          bgcolor: '#fff',
          borderBottom: '1px solid #e9ecef',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isDoctorView && (
            <IconButton onClick={() => navigate(`/patients/${id}`)} aria-label="חזרה" size="small">
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          )}
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>{title}</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadOpen(true)}
          sx={{ borderRadius: 3, px: 2.5, py: 1.2, fontWeight: 700 }}
        >
          הוסף חדש
        </Button>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 4, py: 3.5 }}>
        {/* Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5, flexWrap: 'wrap' }}>
          <TextField
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="חיפוש לפי רופא או סוג..."
            sx={{
              flex: 1,
              minWidth: 280,
              '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: '#fff' },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#adb5bd' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
            {FILTERS.map(f => {
              const active = filter === f.key;
              return (
                <Chip
                  key={f.key}
                  label={f.label}
                  onClick={() => setFilter(f.key)}
                  variant={active ? 'filled' : 'outlined'}
                  color={active ? 'primary' : 'default'}
                  sx={{
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 13,
                    px: 1,
                    height: 38,
                    bgcolor: active ? undefined : '#fff',
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* States / grid */}
        {!patientId
          ? stateMsg('לא נמצא מטופל מחובר.')
          : status === 'loading' && !documents
          ? stateMsg('טוען מסמכים...')
          : status === 'error' && !documents
          ? stateMsg('טעינת המסמכים נכשלה.')
          : filtered.length === 0
          ? stateMsg('לא נמצאו מסמכים תואמים.')
          : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2.5 }}>
              {filtered.map(doc => {
                const badge = fileBadge(doc);
                const st = statusChip(doc.summaryStatus);
                return (
                  <Card
                    key={doc.id}
                    elevation={0}
                    onClick={() => setSummaryModal({ id: doc.id, name: doc.fileName })}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      border: '1px solid #eef0f3',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
                      transition: 'all .18s',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(16,24,40,0.1)',
                        transform: 'translateY(-2px)',
                        borderColor: '#dfe3ea',
                      },
                    }}
                  >
                    <Box sx={{ mb: 2.25 }}>
                      <Chip
                        label={badge.label}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: 11,
                          letterSpacing: '.04em',
                          color: badge.color,
                          bgcolor: badge.bg,
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                    <Typography
                      title={doc.fileName}
                      sx={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#1a1a2e',
                        mb: 0.75,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {doc.fileName}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: '#868e96', mb: 2 }}>
                      {formatDate(doc.uploadedAt)}
                      {doc.documentType ? ` • ${DOC_TYPE_LABELS[doc.documentType]}` : ''}
                    </Typography>
                    <Chip
                      size="small"
                      icon={
                        doc.summaryStatus === 'PROCESSING' ? (
                          <CircularProgress size={11} sx={{ color: st.color }} />
                        ) : undefined
                      }
                      label={st.label}
                      sx={{
                        fontWeight: 800,
                        fontSize: 11,
                        letterSpacing: '.05em',
                        color: st.color,
                        bgcolor: st.bg,
                        borderRadius: 2,
                        '& .MuiChip-icon': { color: st.color, ml: '6px', mr: '-4px' },
                      }}
                    />
                  </Card>
                );
              })}
            </Box>
          )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <UploadModal
        open={uploadOpen}
        onClose={closeUpload}
        cameraMode={cameraMode}
        onStartCamera={() => setCameraMode(true)}
        onStopCamera={stopCamera}
        cameraError={cameraError}
        videoRef={videoRef}
        canvasRef={canvasRef}
        onCapture={handleCapture}
        onChooseFile={() => fileInputRef.current?.click()}
      />

      {summaryModal && (
        <DocumentSummaryModal
          docId={summaryModal.id}
          docName={summaryModal.name}
          onClose={() => setSummaryModal(null)}
        />
      )}
    </Box>
  );
}
