import React from 'react';
import { Box, Typography, Button, Stack, Paper } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import MedicalSummary from '../../../components/MedicalSummary';

interface AiSummaryCardProps {
  overview: string;
  onStartVisit: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ overview, onStartVisit, onRefresh, refreshing }) => (
  <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e9ecef', borderRight: '4px solid #3b5bdb', p: 2.5 }}>
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#eef2ff', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AutoAwesomeIcon fontSize="small" />
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>סיכום רפואי בבינה מלאכותית</Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
        {onRefresh && (
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={refreshing}
            sx={{ borderRadius: 2, fontWeight: 600, fontSize: 13 }}
          >
            {refreshing ? 'מעדכן...' : 'רענן סיכום'}
          </Button>
        )}
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={onStartVisit} sx={{ borderRadius: 2, fontWeight: 600, fontSize: 13 }}>
          התחל ביקור
        </Button>
      </Stack>
    </Stack>
    {overview ? (
      <MedicalSummary text={overview} />
    ) : (
      <Typography sx={{ fontSize: 14, color: '#495057', lineHeight: 1.7 }}>
        טרם נוצר סיכום רפואי. שמור ביקור או העלה מסמך כדי לייצר סיכום.
      </Typography>
    )}
  </Paper>
);

export default AiSummaryCard;
