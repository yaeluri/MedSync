import React from 'react';
import { Button, Stack } from '@mui/material';

interface IStepActionsProps {
  color: string;
  submitting: boolean;
  onBack: () => void;
}

export const StepActions: React.FC<IStepActionsProps> = ({ color, submitting, onBack }) => (
  <Stack direction="row" sx={{ mt: 0.5, gap: 2 }}>
    <Button type="button" variant="outlined" size="large" onClick={onBack} disabled={submitting}
      sx={{ py: 1.4, fontSize: 16, borderColor: color, color, '&:hover': { borderColor: color } }}>
      חזרה
    </Button>
    <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}
      sx={{ py: 1.4, fontSize: 16, bgcolor: color, '&:hover': { bgcolor: color, filter: 'brightness(0.9)' } }}>
      {submitting ? 'יוצר חשבון…' : 'יצירת חשבון'}
    </Button>
  </Stack>
);

export default StepActions;
