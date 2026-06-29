import React from 'react';
import { Box, Typography } from '@mui/material';

interface ProfileRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const ProfileRow: React.FC<ProfileRowProps> = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box
      sx={{
        width: 36, height: 36, borderRadius: 2, bgcolor: '#eef2ff',
        color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 12, color: '#868e96', fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, color: '#1a1a2e', fontWeight: 600 }}>{value}</Typography>
    </Box>
  </Box>
);

export default ProfileRow;
