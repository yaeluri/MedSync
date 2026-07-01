import React from 'react';
import { Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';

interface IFormCardHeaderProps {
  isReadOnly: boolean;
  isProcessing: boolean;
  onRecord: () => void;
}

export const FormCardHeader: React.FC<IFormCardHeaderProps> = ({ isReadOnly, isProcessing, onRecord }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#868e96', letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1 }}>
      רשומת ביקור
    </Typography>
    <Chip label="טיוטא" size="small" sx={{ fontSize: 11, fontWeight: 600, color: '#e8590c', background: '#fff3e6', border: 'none', height: 22 }} />
    {isProcessing && (
      <Chip icon={<CircularProgress size={10} sx={{ color: '#3b5bdb !important' }} />} label="מתמלל..." size="small"
        sx={{ fontSize: 11, fontWeight: 600, color: '#3b5bdb', background: '#eef2ff', height: 22 }} />
    )}
    {!isReadOnly && (
      <Button size="small" variant="outlined" onClick={onRecord}
        sx={{ minWidth: 36, width: 36, height: 36, p: 0, borderRadius: '8px', borderColor: '#e9ecef', color: '#3b5bdb', '&:hover': { background: '#eef2ff', borderColor: '#3b5bdb' } }}>
        <KeyboardVoiceIcon sx={{ fontSize: 18 }} />
      </Button>
    )}
  </Stack>
);

export default FormCardHeader;
