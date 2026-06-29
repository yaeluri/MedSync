import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadDocument } from '../../../api/documents';
import { PatientDocument } from '../../../api/patients';

interface DocumentRowProps {
  document: PatientDocument;
  onViewSummary: (doc: { id: string; name: string }) => void;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({ document: d, onViewSummary }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderBottom: '1px solid #f1f3f5' }}>
    <DescriptionIcon sx={{ fontSize: 16, color: '#868e96', flexShrink: 0 }} />
    <Typography
      sx={{ fontSize: 13, color: '#1a1a2e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      title={d.name}
    >
      {d.name}
    </Typography>
    <Tooltip title="צפה בסיכום">
      <IconButton size="small" sx={{ color: '#868e96' }} onClick={() => onViewSummary({ id: d.id, name: d.name })}>
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
    <Tooltip title="הורדה">
      <IconButton size="small" sx={{ color: '#868e96' }} onClick={() => downloadDocument(d.id, d.name)}>
        <DownloadIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

export default DocumentRow;
