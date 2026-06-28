import React from 'react';
import { Box, Typography } from '@mui/material';

export interface InfoField {
  label: string;
  value?: string | number | null;
}

interface Props {
  fields: InfoField[];
}

export const InfoGrid: React.FC<Props> = ({ fields }) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 2,
        mb: 3,
      }}
    >
      {fields.map((f) => (
        <Box
          key={f.label}
          sx={{
            bgcolor: '#fff',
            border: '1px solid #e9ecef',
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography sx={{ fontSize: 12, color: '#868e96', fontWeight: 500, mb: 0.5 }}>
            {f.label}
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#1a1a2e', fontWeight: 600 }}>
            {f.value ?? '—'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default InfoGrid;
