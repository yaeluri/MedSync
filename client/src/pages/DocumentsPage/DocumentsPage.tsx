import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDocumentUpload } from '../../hooks/useDocumentUpload';
import { getPatientById, Patient } from '../../api/patients';
import { useAsyncData } from '../../hooks/useAsyncData';
import PageHeader from '../../components/PageHeader/PageHeader';
import DocumentSummaryModal from '../../components/DocumentSummaryModal/DocumentSummaryModal';
import { UploadPanel } from './components/UploadPanel';
import { InsightsPanel } from './components/InsightsPanel';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const upload = useDocumentUpload(id);

  const { data: patient } = useAsyncData<Patient>(() => getPatientById(id!), [id]);

  const [summaryModal, setSummaryModal] = useState<{ id: string; name: string } | null>(null);

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'מטופל';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <PageHeader
        title={`מסמכים — ${patientName}`}
        subtitle="העלה וסכם מסמכים רפואיים"
        onBack={id ? () => navigate(`/patients/${id}`) : undefined}
      />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', p: 3, gap: 3 }}>
        <UploadPanel upload={upload} />
        <InsightsPanel
          patient={patient}
          isUploading={upload.status === 'uploading'}
          isDone={upload.status === 'done'}
          onViewSummary={setSummaryModal}
        />
      </Box>

      {summaryModal && (
        <DocumentSummaryModal
          docId={summaryModal.id}
          docName={summaryModal.name}
          onClose={() => setSummaryModal(null)}
        />
      )}
    </Box>
  );
};

export default DocumentsPage;
