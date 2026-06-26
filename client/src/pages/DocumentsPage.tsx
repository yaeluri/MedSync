import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { getPatientById, Patient } from '../api/patients';
import { downloadDocument } from '../api/documents';
import { useAsyncData } from '../hooks/useAsyncData';
import PageHeader from '../components/PageHeader';
import DocumentSummaryModal from '../components/DocumentSummaryModal';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { file, status, summary, uploadedId, uploadedFileName, fileInputRef, selectFile, upload, reset } =
    useDocumentUpload(id);

  const { data: patient } = useAsyncData<Patient>(
    () => getPatientById(id!),
    [id],
  );

  const isUploading = status === 'uploading';
  const isDone = status === 'done';
  const isError = status === 'error';

  const [summaryModal, setSummaryModal] = useState<{ id: string; name: string } | null>(null);

  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : 'מטופל';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <PageHeader
        title={`מסמכים — ${patientName}`}
        subtitle="העלה וסכם מסמכים רפואיים"
        onBack={id ? () => navigate(`/patients/${id}`) : undefined}
      />

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', p: 3, gap: 3 }}>
        {/* Left column */}
        <Box sx={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            העלאת מסמך
          </Typography>

          {/* Drop zone */}
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed #ced4da',
              borderRadius: 2,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              bgcolor: '#f8f9fa',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: 'primary.main', bgcolor: '#eef2ff' },
              gap: 1,
            }}
          >
            <UploadFileIcon sx={{ fontSize: 36, color: '#ced4da' }} />
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#495057' }}>
              לחץ להעלאה או גרור לכאן
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#868e96' }}>
              PDF או קבצי תמונה
            </Typography>
          </Box>

          {/* Hidden file input — exception allowed for file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={selectFile}
            style={{ display: 'none' }}
          />

          {file && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, bgcolor: '#eef2ff', borderRadius: 1.5 }}>
              <DescriptionIcon sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={upload}
              disabled={!file || isUploading}
              fullWidth
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              {isUploading ? 'מעבד...' : 'העלאה וסיכום'}
            </Button>
            {(file || summary) && (
              <Button
                variant="outlined"
                onClick={reset}
                sx={{ borderRadius: 2, fontWeight: 600, flexShrink: 0 }}
              >
                נקה
              </Button>
            )}
          </Stack>

          {(isDone || isError) && (
            <Paper
              elevation={0}
              sx={{ border: '1px solid #e9ecef', borderRadius: 2, p: 2 }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', flex: 1 }}>
                  סיכום בינה מלאכותית
                </Typography>
                {isDone && (
                  <Chip label="הושלם" size="small" sx={{ fontSize: 11, bgcolor: '#ebfbee', color: '#2f9e44', fontWeight: 600 }} />
                )}
                {isDone && uploadedId && (
                  <Tooltip title="הורדה">
                    <IconButton
                      size="small"
                      onClick={() => downloadDocument(uploadedId, uploadedFileName ?? 'document')}
                      sx={{ color: '#868e96' }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
              <Typography
                sx={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: isError ? 'error.main' : '#495057',
                  direction: 'rtl',
                }}
              >
                {summary}
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Right panel */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e9ecef',
            borderRadius: 2,
            bgcolor: '#fff',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #e9ecef' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>
              תובנות בינה מלאכותית
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {isUploading ? (
              <Typography sx={{ color: '#868e96', fontSize: 14 }}>מנתח מסמך...</Typography>
            ) : isDone ? (
              <Box sx={{ display: 'flex', gap: 1.5, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: '#eef2ff',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>
                    תובנה MedSync
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#495057' }}>
                    המסמך עובד בהצלחה. ראה את הסיכום משמאל.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ color: '#868e96', fontSize: 14 }}>
                העלה מסמך לצפייה בתובנות.
              </Typography>
            )}
          </Box>

          {/* Existing documents for this patient */}
          {patient && patient.documents && patient.documents.length > 0 && (
            <>
              <Divider />
              <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #e9ecef' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  מסמכים שהועלו
                </Typography>
              </Box>
              <Box sx={{ overflow: 'auto' }}>
                {patient.documents.map(d => (
                  <Box
                    key={d.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderBottom: '1px solid #f1f3f5',
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 16, color: '#868e96', flexShrink: 0 }} />
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: '#1a1a2e',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={d.name}
                    >
                      {d.name}
                    </Typography>
                    <Tooltip title="צפה בסיכום">
                      <IconButton
                        size="small"
                        sx={{ color: '#868e96' }}
                        onClick={() => setSummaryModal({ id: d.id, name: d.name })}
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="הורדה">
                      <IconButton
                        size="small"
                        sx={{ color: '#868e96' }}
                        onClick={() => downloadDocument(d.id, d.name)}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
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

