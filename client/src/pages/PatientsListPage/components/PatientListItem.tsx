import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { PatientSummary } from '../../../api/patients';
import ClickableCard from '../../../components/ClickableCard/ClickableCard';
import { initials } from '../utils';

interface PatientListItemProps {
  patient: PatientSummary;
}

const genderLabel = (gender?: string) => {
  if (gender === 'Male') return 'זכר';
  if (gender === 'Female') return 'נקבה';
  return gender;
};

export const PatientListItem: React.FC<PatientListItemProps> = ({ patient }) => (
  <ClickableCard to={`/patients/${patient.id}`}>
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.5,
        border: '1px solid #e9ecef',
        borderRadius: 2,
        bgcolor: '#fff',
        '&:hover': { borderColor: '#adb5bd', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
        transition: 'all 0.15s ease',
      }}
    >
      <Avatar
        sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700, flexShrink: 0 }}
      >
        {initials(patient.firstName, patient.lastName)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>
          {patient.firstName} {patient.lastName}
        </Typography>
        <Typography sx={{ fontSize: 13, color: '#868e96' }}>
          ת"ז: {patient.idNumber ?? patient.id.slice(0, 8).toUpperCase()}
          {patient.age > 0 ? ` • גיל ${patient.age}` : ''}
          {patient.gender ? ` • ${genderLabel(patient.gender)}` : ''}
        </Typography>
      </Box>
      <ChevronLeftIcon sx={{ color: '#ced4da', flexShrink: 0 }} />
    </Paper>
  </ClickableCard>
);

export default PatientListItem;
