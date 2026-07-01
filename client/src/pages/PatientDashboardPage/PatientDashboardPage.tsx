import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { getPatientById, Patient } from '../../api/patients';
import { useAsyncData } from '../../hooks/useAsyncData';
import { genderLabel } from '../../utils/format';
import PageHeader from '../../components/PageHeader/PageHeader';
import InfoGrid from '../../components/InfoGrid/InfoGrid';
import DocumentSummaryModal from '../../components/DocumentSummaryModal/DocumentSummaryModal';
import { AiSummaryCard } from './components/AiSummaryCard';
import { EncountersList } from './components/EncountersList';
import { DocumentsList } from './components/DocumentsList';

export const PatientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: patient, status } = useAsyncData<Patient>(() => getPatientById(id!), [id]);
  const [summaryModal, setSummaryModal] = useState<{ id: string; name: string } | null>(null);

  if (status !== 'done' || !patient) {
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

  const fullName = `${patient.firstName} ${patient.lastName}`;
  const idLabel = patient.idNumber ?? patient.id.slice(0, 8).toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', direction: 'rtl' }}>
      <PageHeader
        title={fullName}
        subtitle={`ת"ז: ${idLabel} • גיל ${patient.age} • ${genderLabel(patient.gender)}`}
        onBack={() => navigate('/patients')}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <InfoGrid fields={[
          { label: 'תאריך לידה', value: patient.dob },
          { label: 'טלפון',      value: patient.phone },
          { label: 'קופת חולים', value: patient.hmo },
          { label: 'כתובת',      value: patient.address },
        ]} />

        <AiSummaryCard overview={patient.overview} onStartVisit={() => navigate(`/patients/${patient.id}/visit`)} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <EncountersList encounters={patient.encounters} patientId={patient.id} />
          <DocumentsList
            documents={patient.documents}
            onUpload={() => navigate(`/patients/${patient.id}/documents`)}
            onViewSummary={setSummaryModal}
          />
        </Box>
      </Box>

      {summaryModal && (
        <DocumentSummaryModal docId={summaryModal.id} docName={summaryModal.name} onClose={() => setSummaryModal(null)} />
      )}
    </Box>
  );
};

export default PatientDashboardPage;
