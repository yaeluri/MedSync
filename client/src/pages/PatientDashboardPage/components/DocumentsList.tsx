import React from 'react';
import { Box, Typography, Button, Stack, Paper, IconButton, Tooltip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import { PatientDocument } from '../../../api/patients';
import { downloadDocument } from '../../../api/documents';

interface DocumentsListProps {
  documents: PatientDocument[];
  onUpload: () => void;
  onViewSummary: (doc: { id: string; name: string }) => void;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({ documents, onUpload, onViewSummary }) => (
  <Box>
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>מסמכים רפואיים</Typography>
      <Button startIcon={<UploadFileIcon />} size="small" onClick={onUpload} sx={{ fontSize: 12, fontWeight: 600 }}>
        העלאת מסמך
      </Button>
    </Stack>
    {documents.length === 0 ? (
      <Typography sx={{ color: '#868e96', fontSize: 14 }}>אין מסמכים.</Typography>
    ) : (
      <Stack spacing={1}>
        {documents.map(d => (
          <Paper key={d.id} elevation={0} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, border: '1px solid #e9ecef', borderRadius: 2, bgcolor: '#fff' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#f1f3f5', color: '#868e96', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DescriptionIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</Typography>
              <Typography sx={{ fontSize: 12, color: '#868e96' }}>{d.date} • {d.kind}</Typography>
            </Box>
            <Tooltip title="צפה בסיכום">
              <IconButton size="small" sx={{ color: '#868e96' }} onClick={() => onViewSummary({ id: d.id, name: d.name })}>
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
);

export default DocumentsList;
