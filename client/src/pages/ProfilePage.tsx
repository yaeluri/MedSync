import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Divider,
  Chip,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { clearSession, loadSession, saveSession } from '../api/auth';
import { getUser, updateUser, User } from '../api/users';

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s.charAt(0).toUpperCase())
    .join('');
}

function toDateInput(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function formatDob(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const session = loadSession();
  const role = (session?.role as 'patient' | 'doctor' | undefined) ?? 'patient';
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<
    { severity: 'success' | 'error'; message: string } | null
  >(null);

  useEffect(() => {
    if (!session?.userId) return;
    getUser(session.userId)
      .then(u => {
        setUser(u);
        setPhone(u.phone ?? '');
        setBirthDate(toDateInput(u.birthDate));
      })
      .catch(() => setUser(null));
  }, [session?.userId]);

  const profile = {
    name: user?.fullName ?? session?.fullName ?? 'Guest',
    email: user?.email ?? session?.email ?? '',
    phone: user?.phone ?? '—',
    dob: formatDob(user?.birthDate),
  };
  const initials = initialsFromName(profile.name);

  const handleEdit = () => {
    setPhone(user?.phone ?? '');
    setBirthDate(toDateInput(user?.birthDate));
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setPhone(user?.phone ?? '');
    setBirthDate(toDateInput(user?.birthDate));
  };

  const handleSave = async () => {
    if (!session?.userId) return;
    setSaving(true);
    try {
      const updated = await updateUser(session.userId, {
        phone: phone.trim() || undefined,
        birthDate: birthDate || undefined,
      });
      setUser(updated);
      if (session) {
        saveSession({
          ...session,
          fullName: updated.fullName,
          email: updated.email,
        });
      }
      setEditing(false);
      setToast({ severity: 'success', message: 'Profile updated.' });
    } catch {
      setToast({ severity: 'error', message: 'Failed to save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <Box sx={{ flex: 1, overflow: 'auto', bgcolor: '#f8f9fa', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        {/* Header card */}
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
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>{profile.name}</Typography>
            <Chip
              label={role === 'doctor' ? 'Doctor' : 'Patient'}
              size="small"
              sx={{ mt: 0.5, bgcolor: '#eef2ff', color: 'primary.main', fontWeight: 600 }}
            />
          </Box>
        </Box>

        {/* Details card */}
        <Box sx={{ bgcolor: '#fff', border: '1px solid #e9ecef', borderRadius: 3, p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#868e96', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Personal Information
            </Typography>
            {!editing && (
              <Tooltip title="Edit">
                <IconButton onClick={handleEdit} size="small" sx={{ color: 'primary.main' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Row icon={<EmailIcon fontSize="small" />} label="Email" value={profile.email} />
          <Divider sx={{ my: 1.5 }} />

          {editing ? (
            <Stack spacing={2}>
              <TextField
                label="Phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                size="small"
                fullWidth
                placeholder="+972 50-000-0000"
              />
              <TextField
                label="Date of Birth"
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Row icon={<PhoneIcon fontSize="small" />} label="Phone" value={profile.phone} />
              <Divider sx={{ my: 1.5 }} />
              <Row icon={<CakeIcon fontSize="small" />} label="Date of Birth" value={profile.dob} />
            </>
          )}
        </Box>

        <Button
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          color="error"
          variant="outlined"
          sx={{ borderRadius: 2.5, fontWeight: 600 }}
        >
          Log out
        </Button>
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast?.severity}
          variant="filled"
          onClose={() => setToast(null)}
          sx={{ borderRadius: 2 }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 36, height: 36, borderRadius: 2, bgcolor: '#eef2ff',
          color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, color: '#868e96', fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: 14, color: '#1a1a2e', fontWeight: 600 }}>{value}</Typography>
      </Box>
    </Box>
  );
}
