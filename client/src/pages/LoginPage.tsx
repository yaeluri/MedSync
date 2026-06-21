import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, ToggleButtonGroup, ToggleButton, Alert } from '@mui/material';
import { login, saveSession } from '../api/auth';

type Role = "patient" | "doctor";

export default function LoginPage() {
  const [role, setRole] = useState<Role>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      const result = await login(email, password);
      saveSession(result);
      navigate(result.role === 'patient' ? '/dashboard' : '/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a2e', mb: 0.5 }}>Welcome Back</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2.5 }}>Sign in to your account to continue.</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField
          type="email" placeholder="Email Address" autoComplete="email"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <TextField
          type="password" placeholder="Password" autoComplete="current-password"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        <Box sx={{ textAlign: 'right' }}>
          <Typography component="a" href="#" sx={{ fontSize: 13, color: 'primary.main', fontWeight: 500, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Forgot password?</Typography>
        </Box>
        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting} sx={{ mt: 0.5, py: 1.4, fontSize: 16 }}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </Box>

      <Typography sx={{ textAlign: 'center', mt: 2, fontSize: 14, color: 'text.secondary' }}>
        Don't have an account?{' '}
        <Typography component={Link} to="/register" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Sign Up</Typography>
      </Typography>
    </Box>
  );
}
