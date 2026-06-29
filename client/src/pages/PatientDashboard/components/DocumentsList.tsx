import { Avatar, Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { downloadDocument } from '../../../api/documents';
import { DashboardDoc } from '../hooks/usePatientDashboard';
import DownloadIcon from '../../../assets/svg/download.svg?react';

interface DocumentsListProps {
  documents: DashboardDoc[];
}

function DocRow({ doc }: { doc: DashboardDoc }) {
  const isPending = 'status' in doc && doc.status === 'processing';
  const kind      = 'kind' in doc ? doc.kind : 'pdf';
  const isImage   = kind === 'image' || /^image/i.test(kind);

  return (
    <Stack
      direction="row-reverse" spacing={1.5}
      sx={{ p: 1, borderRadius: 2, bgcolor: '#f8f9fa', alignItems: 'center', '&:hover': { bgcolor: '#f1f3f5' } }}
    >
      <Avatar
        sx={{
          width: 36, height: 36, borderRadius: 2,
          bgcolor: isImage ? '#fff3e6' : '#e8f4fd',
          color:   isImage ? '#e8590c' : '#1c7ed6',
        }}
      >
        {isImage ? <ImageIcon fontSize="small" /> : <PictureAsPdfIcon fontSize="small" />}
      </Avatar>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{doc.name}</Typography>
        {isPending
          ? <Typography sx={{ fontSize: 12, color: '#e8590c', fontWeight: 500 }}>מעבד...</Typography>
          : <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{doc.date || ''}</Typography>
        }
      </Box>

      {!isPending && (
        <Tooltip title="הורדה">
          <IconButton size="small" onClick={() => downloadDocument(doc.id, doc.name)}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

export function DocumentsList({ documents }: DocumentsListProps) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e9ecef', height: '100%' }}>
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>מסמכים אחרונים</Typography>
      {documents.length === 0 ? (
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
          אין מסמכים עדיין. העלה מסמך להתחיל.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {documents.map(doc => <DocRow key={doc.id} doc={doc} />)}
        </Stack>
      )}
    </Paper>
  );
}
