import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, ToggleButtonGroup, ToggleButton, FormControlLabel, Checkbox, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import InputAdornment from '@mui/material/InputAdornment';
import { registerDoctor, registerPatient, saveSession } from '../api/auth';

type Role = 'patient' | 'doctor';

export default function RegisterPage() {
  const [role, setRole] = useState<Role>('patient');
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState('');
  const [idOrLicense, setIdOrLicense] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError('You must agree to the Terms and Privacy Policy');
      return;
    }
    if (!fullName || !email || !password) {
      setError('Full name, email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      const result =
        role === 'doctor'
          ? await registerDoctor({
              fullName,
              email,
              password,
              licenseNumber: idOrLicense || 'TBD',
              specialization: 'General',
            })
          : await registerPatient({
              fullName,
              email,
              password,
              idNumber: idOrLicense || undefined,
              address: '',
            });
      saveSession(result);
      navigate(result.role === 'patient' ? '/dashboard' : '/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField placeholder="Full Name" autoComplete="name"
          value={fullName} onChange={e => setFullName(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#adb5bd', fontSize: 18 }} /></InputAdornment> } }} />
        <TextField placeholder={role === 'doctor' ? 'License Number' : 'ID Number (Teudat Zehut)'} autoComplete="off"
          value={idOrLicense} onChange={e => setIdOrLicense(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: '#adb5bd', fontSize: 18 }} /></InputAdornment> } }} />
        <TextField type="email" placeholder="Email Address" autoComplete="email"
          value={email} onChange={e => setEmail(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#adb5bd', fontSize: 18 }} /></InputAdornment> } }} />
        <TextField type="password" placeholder="Password" autoComplete="new-password"
          value={password} onChange={e => setPassword(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#adb5bd', fontSize: 18 }} /></InputAdornment> } }} />

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

        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ mt: 0.5, py: 1.4, fontSize: 16 }}>
          {submitting ? 'Creating account…' : 'Create Account'}
        </Button>
      </Box>

      <Typography sx={{ textAlign: 'center', mt: 2, fontSize: 14, color: 'text.secondary' }}>
        Already have an account?{' '}
        <Typography component={Link} to="/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Sign In</Typography>
      </Typography>
    </Box>
  );
}

