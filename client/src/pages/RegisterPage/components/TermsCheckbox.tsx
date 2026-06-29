import React from 'react';
import { FormControlLabel, Checkbox, Typography } from '@mui/material';

interface ITermsCheckboxProps {
  agreed: boolean;
  onChange: (checked: boolean) => void;
  color: string;
}

const termsLink = (label: string, color: string) => (
  <Typography component="a" href="#" sx={{ fontSize: 13, color, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
    {label}
  </Typography>
);

export const TermsCheckbox: React.FC<ITermsCheckboxProps> = ({ agreed, onChange, color }) => (
  <FormControlLabel
    control={<Checkbox checked={agreed} onChange={e => onChange(e.target.checked)} size="small" sx={{ color, '&.Mui-checked': { color } }} />}
    label={
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
        אני מסכים ל{termsLink('תנאי שימוש', color)}{' '}ו{termsLink('מדיניות פרטיות', color)}
      </Typography>
    }
  />
);

export default TermsCheckbox;
