import React, { useRef, useState } from 'react';
import { Box, Grid, LinearProgress } from '@mui/material';
import Toast from '../../components/Toast/Toast';
import { usePatientDashboard } from './hooks/usePatientDashboard';
import { useCameraStream }     from '../../hooks/useCameraStream';
import { DashboardHeader }     from './components/DashboardHeader';
import { UploadBanner }        from './components/UploadBanner';
import { AISummaryCard }       from './components/AISummaryCard';
import { DocumentsList }       from './components/DocumentsList';
import { VisitsList }          from './components/VisitsList';
import { UploadModal }         from './components/UploadModal';

export const PatientDashboard: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { patientId, userName, userInitials, firstName, patient, documents, visits, uploading, toast, setToast, uploadFile } =
    usePatientDashboard();
  const { videoRef, canvasRef, cameraMode, setCameraMode, cameraError, stopCamera, capture } =
    useCameraStream();

  const closeModal = () => { stopCamera(); setShowUploadModal(false); };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    closeModal();
    uploadFile(file);
    e.target.value = '';
  };

  const handleCapture = () => {
    capture(file => { setShowUploadModal(false); uploadFile(file); });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
      {uploading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300 }} />}

      <DashboardHeader userName={userName} userInitials={userInitials} firstName={firstName} />

      <Box sx={{ flex: 1, overflow: 'auto', p: 3.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <UploadBanner
          onUploadClick={() => setShowUploadModal(true)}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <AISummaryCard overview={patient?.overview} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <DocumentsList documents={documents} />
          </Grid>
        </Grid>

        <VisitsList visits={visits} patientId={patientId} />
      </Box>

      <UploadModal
        open={showUploadModal}
        onClose={closeModal}
        cameraMode={cameraMode}
        onStartCamera={() => setCameraMode(true)}
        onStopCamera={stopCamera}
        cameraError={cameraError}
        videoRef={videoRef}
        canvasRef={canvasRef}
        onCapture={handleCapture}
        onChooseFile={() => fileInputRef.current?.click()}
      />

      <Toast toast={toast} onClose={() => setToast(null)} autoHideDuration={4000} />
    </Box>
  );
};

export default PatientDashboard;
