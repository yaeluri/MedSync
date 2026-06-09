import { useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, Button, Divider, Chip } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import BadgeIcon from '@mui/icons-material/Badge';
import LogoutIcon from '@mui/icons-material/Logout';

export default function ProfilePage() {
  const navigate = useNavigate();
  const role = (localStorage.getItem('role') as 'patient' | 'doctor' | null) ?? 'patient';

  const profile = {
    name: 'Israel Israeli',
    initials: 'II',
    email: 'israel.israeli@example.com',
    phone: '+972 50-123-4567',
    dob: 'May 14, 1980',
    idNumber: '123456789',
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
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
            {profile.initials}
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
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#868e96', letterSpacing: '0.06em', textTransform: 'uppercase', mb: 2 }}>
            Personal Information
          </Typography>

          <Row icon={<EmailIcon fontSize="small" />} label="Email" value={profile.email} />
          <Divider sx={{ my: 1.5 }} />
          <Row icon={<PhoneIcon fontSize="small" />} label="Phone" value={profile.phone} />
          <Divider sx={{ my: 1.5 }} />
          <Row icon={<CakeIcon fontSize="small" />} label="Date of Birth" value={profile.dob} />
          <Divider sx={{ my: 1.5 }} />
          <Row icon={<BadgeIcon fontSize="small" />} label="ID Number" value={profile.idNumber} />
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
