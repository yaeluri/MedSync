import React from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useCurrentDoctor } from '../../hooks/useCurrentDoctor';

export interface IPageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export const PageHeader: React.FC<IPageHeaderProps> = ({ title, subtitle, onBack }) => {
  const doctor = useCurrentDoctor();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        py: 2,
        borderBottom: '1px solid #e9ecef',
        bgcolor: '#fff',
        flexShrink: 0,
      }}
    >
      <Stack sx={{ flexDirection: 'row', alignItems: 'center' }} spacing={1}>
        {onBack && (
          <IconButton onClick={onBack} aria-label="Back" size="small">
            <ChevronRightIcon />
          </IconButton>
        )}
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 13, color: '#868e96' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      <Stack sx={{ flexDirection: 'row', alignItems: 'center' }} spacing={1.5}>
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>
            {doctor.fullName}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#868e96' }}>
            {doctor.specialization}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {doctor.initials}
        </Box>
      </Stack>
    </Box>
  );
};

export default PageHeader;
