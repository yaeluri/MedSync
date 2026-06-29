import React from 'react';
import { Box, Typography, Button, Stack, Paper, IconButton, Tooltip, Chip } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadDocument } from '../../../api/documents';
import type { useDocumentUpload } from '../../../hooks/useDocumentUpload';

type UploadState = ReturnType<typeof useDocumentUpload>;

interface UploadPanelProps {
  upload: UploadState;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ upload }) => {
  const { file, status, summary, uploadedId, uploadedFileName, fileInputRef, selectFile, upload: doUpload, reset } = upload;
  const isUploading = status === 'uploading';
  const isDone = status === 'done';
  const isError = status === 'error';

  return (
    <Box sx={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#868e96', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        העלאת מסמך
      </Typography>

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
        <Button variant="contained" onClick={doUpload} disabled={!file || isUploading} fullWidth sx={{ borderRadius: 2, fontWeight: 600 }}>
          {isUploading ? 'מעבד...' : 'העלאה וסיכום'}
        </Button>
        {(file || summary) && (
          <Button variant="outlined" onClick={reset} sx={{ borderRadius: 2, fontWeight: 600, flexShrink: 0 }}>
            נקה
          </Button>
        )}
      </Stack>

      {(isDone || isError) && (
        <Paper elevation={0} sx={{ border: '1px solid #e9ecef', borderRadius: 2, p: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', mb: 1 }} spacing={1}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', flex: 1 }}>
              סיכום בינה מלאכותית
            </Typography>
            {isDone && (
              <Chip label="הושלם" size="small" sx={{ fontSize: 11, bgcolor: '#ebfbee', color: '#2f9e44', fontWeight: 600 }} />
            )}
            {isDone && uploadedId && (
              <Tooltip title="הורדה">
                <IconButton size="small" onClick={() => downloadDocument(uploadedId, uploadedFileName ?? 'document')} sx={{ color: '#868e96' }}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          <Typography sx={{ fontSize: 13, lineHeight: 1.7, color: isError ? 'error.main' : '#495057', direction: 'rtl' }}>
            {summary}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default UploadPanel;
