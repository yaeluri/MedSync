import React from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, label, color, bg }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, borderBottom: '1px solid #f1f3f5', pb: 1, mb: 0.5 }}>
    <Box sx={{ width: 30, height: 30, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color, flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>
      {label}
    </Typography>
  </Stack>
);

export default SectionHeader;
