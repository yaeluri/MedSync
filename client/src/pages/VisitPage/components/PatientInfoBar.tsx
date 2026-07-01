import React from 'react';
import { Stack, Typography, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import { PatientInfoBarRoot } from '../styled';
import { PatientInfo } from '../constants';

interface PatientInfoBarProps {
  info: PatientInfo;
}

export const PatientInfoBar: React.FC<PatientInfoBarProps> = ({ info }) => (
  <PatientInfoBarRoot>
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
      <PersonIcon sx={{ fontSize: 14 }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{info.name}</Typography>
    </Stack>
    {info.idNumber && <Chip label={`ID: ${info.idNumber}`} size="small" variant="outlined" sx={{ height: 24, fontSize: 12 }} />}
    {info.phone && <Chip icon={<PhoneIcon sx={{ fontSize: 12 }} />} label={info.phone} size="small" variant="outlined" sx={{ height: 24, fontSize: 12 }} />}
    {info.dob && <Chip label={`DOB: ${info.dob}`} size="small" variant="outlined" sx={{ height: 24, fontSize: 12 }} />}
    {info.hmo && <Chip label={`HMO: ${info.hmo}`} size="small" variant="outlined" sx={{ height: 24, fontSize: 12 }} />}
    {info.bloodType && <Chip label={`🩸 ${info.bloodType}`} size="small" sx={{ height: 24, fontSize: 12, background: '#fff5f5', color: '#e03131', border: '1px solid #ffc9c9' }} />}
  </PatientInfoBarRoot>
);

export default PatientInfoBar;
