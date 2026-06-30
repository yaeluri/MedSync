import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Stack, Paper, IconButton, Tooltip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import DescriptionIcon from '@mui/icons-material/Description';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { getPatientById, Patient, refreshMedicalSummary, ClinicalAlert } from '../api/patients';
import { downloadDocument } from '../api/documents';
import { useAsyncData } from '../hooks/useAsyncData';
import PageHeader from '../components/PageHeader';
import ClickableCard from '../components/ClickableCard';
import InfoGrid from '../components/InfoGrid';
import DocumentSummaryModal from '../components/DocumentSummaryModal';
import MedicalSummary from '../components/MedicalSummary';
import ClinicalAlertsCard from '../components/patientDashboard/ClinicalAlertsCard';

export const PatientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: patient, status } = useAsyncData<Patient>(
    () => getPatientById(id!),
    [id],
  );
  const [summaryModal, setSummaryModal] = useState<{ id: string; name: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [patientOverride, setPatientOverride] = useState<Patient | null>(null);

  const displayPatient = patientOverride ?? patient;

  function handleAlertsChange(next: ClinicalAlert[]) {
    if (!displayPatient) return;
    setPatientOverride({ ...displayPatient, clinicalAlerts: next });
    setRefreshing(true);
    refreshMedicalSummary(displayPatient.id)
      .then((updated) => setPatientOverride(updated))
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }

  async function handleRefreshSummary() {
    if (!patient) return;
    setRefreshing(true);
    try {
      const updated = await refreshMedicalSummary(patient.id);
      setPatientOverride(updated);
    } finally {
      setRefreshing(false);
    }
  }

  if (status !== 'done' || !displayPatient) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', direction: 'rtl' }}>
        <PageHeader
          title={status === 'loading' ? 'טוען מטופל...' : 'מטופל לא נמצא'}
          subtitle={status === 'loading' ? 'מייד נתוני המטופל' : 'המטופל הנבחר אינו קיים'}
          onBack={() => navigate('/patients')}
        />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: '#868e96' }}>
            {status === 'loading' ? 'אנא המתן…' : 'לא נמצא המטופל. חזור לרשימה.'}
          </Typography>
        </Box>
      </Box>
    );
  }

  const fullName = `${displayPatient.firstName} ${displayPatient.lastName}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', direction: 'rtl' }}>
      <PageHeader
        title={fullName}
        subtitle={`ת"ז: ${displayPatient.idNumber ?? displayPatient.id.slice(0, 8).toUpperCase()} • גיל ${displayPatient.age} • ${displayPatient.gender === 'Male' ? 'זכר' : displayPatient.gender === 'Female' ? 'נקבה' : displayPatient.gender}`}
        onBack={() => navigate('/patients')}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <ClinicalAlertsCard
          patientId={displayPatient.id}
          alerts={displayPatient.clinicalAlerts ?? []}
          onAlertsChange={handleAlertsChange}
        />
        <InfoGrid fields={[
          { label: 'תאריך לידה', value: displayPatient.dob },
          { label: 'טלפון',      value: displayPatient.phone },
          { label: 'קופת חולים', value: displayPatient.hmo },
          { label: 'כתובת',      value: displayPatient.address },
        ]} />
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e9ecef', borderRight: '4px solid #3b5bdb', p: 2.5 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 2 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#eef2ff', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AutoAwesomeIcon fontSize="small" />
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>סיכום רפואי בבינה מלאכותית</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefreshSummary}
                  disabled={refreshing}
                  sx={{ borderRadius: 2, fontWeight: 600, fontSize: 13 }}
                >
                  {refreshing ? 'מעדכן...' : 'רענן סיכום'}
                </Button>
                <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => navigate(`/patients/${displayPatient.id}/visit`)} sx={{ borderRadius: 2, fontWeight: 600, fontSize: 13 }}>
                  התחל ביקור
                </Button>
              </Stack>
            </Stack>
            {displayPatient.overview ? (
              <MedicalSummary text={displayPatient.overview} />
            ) : (
              <Typography sx={{ fontSize: 14, color: '#495057', lineHeight: 1.7 }}>
                טרם נוצר סיכום רפואי. שמור ביקור או העלה מסמך כדי לייצר סיכום.
              </Typography>
            )}
        </Paper>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', mb: 1.5 }}>ביקורים אחרונים</Typography>
            {displayPatient.encounters.length === 0 ? (
              <Typography sx={{ color: '#868e96', fontSize: 14 }}>אין ביקורים קודמים.</Typography>
            ) : (
              <Stack spacing={1}>
                {displayPatient.encounters.map((e, idx) => (
                  <ClickableCard key={e.id} to={`/patients/${displayPatient.id}/visits/${e.id}`}>
                    <Paper elevation={0} sx={{ border: '1px solid #e9ecef', borderRadius: 2, p: 2, bgcolor: '#fff', '&:hover': { borderColor: 'primary.main', boxShadow: '0 2px 8px rgba(59,91,219,0.08)' }, transition: 'all 0.15s ease' }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: idx > 0 ? '#f1f3f5' : '#eef2ff', color: idx > 0 ? '#868e96' : 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MedicalServicesIcon sx={{ fontSize: 14 }} />
                          </Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{e.doctor}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                          <Typography sx={{ fontSize: 12, color: '#868e96' }}>{e.date}</Typography>
                          <ChevronLeftIcon sx={{ fontSize: 14, color: '#ced4da' }} />
                        </Stack>
                      </Stack>
                      <Typography sx={{ fontSize: 12, color: '#868e96' }}>{e.specialty} • {e.type}</Typography>
                    </Paper>
                  </ClickableCard>
                ))}
              </Stack>
            )}
          </Box>
          <Box>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>מסמכים רפואיים</Typography>
              <Button startIcon={<UploadFileIcon />} size="small" onClick={() => navigate(`/patients/${displayPatient.id}/documents`)} sx={{ fontSize: 12, fontWeight: 600 }}>
                העלאת מסמך
              </Button>
            </Stack>
            {displayPatient.documents.length === 0 ? (
              <Typography sx={{ color: '#868e96', fontSize: 14 }}>אין מסמכים.</Typography>
            ) : (
              <Stack spacing={1}>
                {displayPatient.documents.map(d => (
                  <Paper key={d.id} elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: '1px solid #e9ecef', borderRadius: 2, bgcolor: '#fff' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#f1f3f5', color: '#868e96', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <DescriptionIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#868e96' }}>{d.date} • {d.kind}</Typography>
                    </Box>
                    <Tooltip title="צפה בסיכום">
                      <IconButton size="small" sx={{ color: '#868e96' }} onClick={() => setSummaryModal({ id: d.id, name: d.name })}>
                        <InfoOutlinedIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="הורדה">
                      <IconButton size="small" sx={{ color: '#868e96' }} onClick={() => downloadDocument(d.id, d.name)}>
                        <DownloadIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>

      {summaryModal && (
        <DocumentSummaryModal docId={summaryModal.id} docName={summaryModal.name} onClose={() => setSummaryModal(null)} />
      )}
    </Box>
  );
};

export default PatientDashboardPage;