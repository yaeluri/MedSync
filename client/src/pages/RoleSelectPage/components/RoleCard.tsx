import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconGradient: string;
  hoverColor: string;
  hoverShadow: string;
  onClick: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  title, description, icon, iconGradient, hoverColor, hoverShadow, onClick,
}) => (
  <Paper
    onClick={onClick}
    elevation={0}
    sx={{
      width: 260,
      p: 4,
      cursor: 'pointer',
      borderRadius: '20px',
      border: '2px solid transparent',
      transition: 'all 0.25s ease',
      background: '#fff',
      '&:hover': {
        borderColor: hoverColor,
        transform: 'translateY(-4px)',
        boxShadow: hoverShadow,
      },
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: '16px',
        mb: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: iconGradient,
      }}
    >
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e', mb: 0.5 }}>
      {title}
    </Typography>
    <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.5 }}>
      {description}
    </Typography>
  </Paper>
);

export default RoleCard;
