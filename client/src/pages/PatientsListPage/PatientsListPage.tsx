import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Stack,
  Avatar,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getPatients, PatientSummary } from '../api/patients';
import { useAsyncData } from '../hooks/useAsyncData';
import PageHeader from '../components/PageHeader';
import ClickableCard from '../components/ClickableCard';

const initials = (first: string, last: string) =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

export const PatientsListPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const { data: patients, status } = useAsyncData<PatientSummary[]>(getPatients, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients ?? [];
    return (patients ?? []).filter(p =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      (p.idNumber ?? '').toLowerCase().includes(q)
    );
  }, [query, patients]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <PageHeader title="רשימת מטופלים" subtitle="בחר מטופל להתחלת הטיפול" />

      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#f8f9fa', p: 3 }}>
        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          <TextField
            fullWidth
            placeholder="חיפוש לפי שם או תעודת זהות..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            size="small"
            sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#868e96', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {status === 'loading' ? (
            <Typography sx={{ textAlign: 'center', color: '#868e96', py: 4 }}>
              טוען מטופלים...
            </Typography>
          ) : status === 'error' ? (
            <Typography sx={{ textAlign: 'center', color: 'error.main', py: 4 }}>
              טעינת המטופלים נכשלה.
            </Typography>
          ) : filtered.length === 0 ? (
            <Typography sx={{ textAlign: 'center', color: '#868e96', py: 4 }}>
              לא נמצאו מטופלים תואמים.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {filtered.map(p => (
                <ClickableCard key={p.id} to={`/patients/${p.id}`}>
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
                    <ChevronRightIcon sx={{ color: '#ced4da', flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>
                        {p.firstName} {p.lastName}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: '#868e96' }}>
                        ת"ז: {p.idNumber ?? p.id.slice(0, 8).toUpperCase()}
                        {p.age > 0 ? ` • גיל ${p.age}` : ''}
                        {p.gender ? ` • ${p.gender === 'Male' ? 'זכר' : p.gender === 'Female' ? 'נקבה' : p.gender}` : ''}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {initials(p.firstName, p.lastName)}
                    </Avatar>
                  </Paper>
                </ClickableCard>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PatientsListPage;
