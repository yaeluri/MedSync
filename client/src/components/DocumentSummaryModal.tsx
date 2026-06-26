import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import { getDocumentSummary } from '../api/documents';

interface Props {
  docId: string;
  docName: string;
  onClose: () => void;
}

export const DocumentSummaryModal: React.FC<Props> = ({ docId, docName, onClose }) => {
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getDocumentSummary(docId)
      .then(r => { if (active) setSummaryText(r.summaryText || 'אין סיכום זמין.'); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [docId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 6 }}>
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
          <DescriptionIcon fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>סיכום בינה מלאכותית</Typography>
          <Typography sx={{ fontSize: 12, color: '#868e96' }}>{docName}</Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="סגור"
          size="small"
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3, justifyContent: 'center' }}>
            <CircularProgress size={24} />
            <Typography sx={{ color: '#868e96' }}>טוען סיכום...</Typography>
          </Box>
        )}
        {!loading && error && (
          <Typography sx={{ color: 'error.main', py: 2 }}>
            שגיאה בטעינת הסיכום. נסה שנית.
          </Typography>
        )}
        {!loading && !error && (
          <Typography sx={{ lineHeight: 1.8, color: '#1a1a2e', direction: 'rtl' }}>
            {summaryText}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentSummaryModal;
