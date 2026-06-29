import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Patient } from '../../../api/patients';
import { DocumentRow } from './DocumentRow';

interface InsightsPanelProps {
  patient: Patient | null;
  isUploading: boolean;
  isDone: boolean;
  onViewSummary: (doc: { id: string; name: string }) => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ patient, isUploading, isDone, onViewSummary }) => (
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
            <DocumentRow key={d.id} document={d} onViewSummary={onViewSummary} />
          ))}
        </Box>
      </>
    )}
  </Box>
);

export default InsightsPanel;
