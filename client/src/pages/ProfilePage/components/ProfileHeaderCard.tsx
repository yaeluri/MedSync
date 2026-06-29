import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';

interface ProfileHeaderCardProps {
  name: string;
  initials: string;
  role: 'patient' | 'doctor';
}

export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({ name, initials, role }) => (
  <Box
    sx={{
      bgcolor: '#fff', border: '1px solid #e9ecef', borderRadius: 3,
      p: 3, display: 'flex', alignItems: 'center', gap: 2.5, mb: 3,
    }}
  >
    <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 24, fontWeight: 700 }}>
      {initials || '?'}
    </Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>{name}</Typography>
      <Chip
        label={role === 'doctor' ? 'רופא' : 'מטופל'}
        size="small"
        sx={{ mt: 0.5, bgcolor: '#eef2ff', color: 'primary.main', fontWeight: 600 }}
      />
    </Box>
  </Box>
);

export default ProfileHeaderCard;
