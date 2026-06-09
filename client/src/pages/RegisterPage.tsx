import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, TextField, Button, ToggleButtonGroup, ToggleButton, FormControlLabel, Checkbox } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import InputAdornment from '@mui/material/InputAdornment';

type Role = 'patient' | 'doctor';

export default function RegisterPage() {
  const [role, setRole] = useState<Role>('patient');
  const [agreed, setAgreed] = useState(false);

  return (
    <Box sx={{ width: '100%', maxWidth: 420, p: 4 }}>
      <ToggleButtonGroup
        value={role} exclusive size="small"
        onChange={(_, v) => v && setRole(v)}
        sx={{ mb: 3, background: '#f1f3f5', borderRadius: '12px', p: '4px', border: 'none' }}
      >
        <ToggleButton value="patient" sx={{ border: 'none', borderRadius: '9px !important', px: 2.5, fontWeight: 500 }}>Patient</ToggleButton>
        <ToggleButton value="doctor"  sx={{ border: 'none', borderRadius: '9px !important', px: 2.5, fontWeight: 500 }}>Doctor</ToggleButton>
      </ToggleButtonGroup>

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>Create Account</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2.5 }}>Start your unified health journey.</Typography>

      <Box component="form" onSubmit={e => e.preventDefault()} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField placeholder="Full Name" autoComplete="name"
          InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#adb5bd', fontSize: 18 }} /></InputAdornment> }} />
        <TextField placeholder="ID Number (Teudat Zehut)" autoComplete="off"
          InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#adb5bd', fontSize: 18 }} /></InputAdornment> }} />
        <TextField type="email" placeholder="Email Address" autoComplete="email"
          InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#adb5bd', fontSize: 18 }} /></InputAdornment> }} />
        <TextField type="password" placeholder="Password" autoComplete="new-password"
          InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#adb5bd', fontSize: 18 }} /></InputAdornment> }} />

        <FormControlLabel
          control={<Checkbox checked={agreed} onChange={e => setAgreed(e.target.checked)} size="small" />}
          label={
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              I agree to the{' '}
              <Typography component="a" href="#" sx={{ fontSize: 13, color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms</Typography>
              {' '}and{' '}
              <Typography component="a" href="#" sx={{ fontSize: 13, color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy Policy</Typography>
            </Typography>
          }
        />

        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 0.5, py: 1.4, fontSize: 16 }}>Create Account</Button>
      </Box>

      <Typography sx={{ textAlign: 'center', mt: 2, fontSize: 14, color: 'text.secondary' }}>
        Already have an account?{' '}
        <Typography component={Link} to="/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Sign In</Typography>
      </Typography>
    </Box>
  );
}

