import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import InputAdornment from '@mui/material/InputAdornment';

type Role = 'patient' | 'doctor';

export default function LoginPage() {
  const [role, setRole] = useState<Role>('patient');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('role', role);
    navigate(role === 'patient' ? '/dashboard' : '/visit');
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

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>Welcome Back</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2.5 }}>Sign in to your account to continue.</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField
          type="email" placeholder="Email Address" autoComplete="email"
          InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#adb5bd', fontSize: 18 }} /></InputAdornment> }}
        />
        <TextField
          type="password" placeholder="Password" autoComplete="current-password"
          InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#adb5bd', fontSize: 18 }} /></InputAdornment> }}
        />
        <Box sx={{ textAlign: 'right' }}>
          <Typography component="a" href="#" sx={{ fontSize: 13, color: 'primary.main', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Forgot password?</Typography>
        </Box>
        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 0.5, py: 1.4, fontSize: 16 }}>Sign In</Button>
      </Box>

      <Typography sx={{ textAlign: 'center', mt: 2, fontSize: 14, color: 'text.secondary' }}>
        Don't have an account?{' '}
        <Typography component={Link} to="/register" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Sign Up</Typography>
      </Typography>
    </Box>
  );
}
