import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

export default function AuthLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left panel */}
      <Box
        sx={{
          flex: '0 0 46%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          px: 7, py: 6,
          background: 'linear-gradient(135deg, #3b5bdb 0%, #5c7cfa 100%)', color: '#fff',
          '@media (max-width:768px)': { flex: 'none', px: 4, py: 4 },
        }}
      >
        <Box
          sx={{
            width: 52, height: 52, borderRadius: '14px', mb: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800,
            background: 'rgba(255,255,255,0.18)',
          }}
        >
          M
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 1.5 }}>
          Your Medical History,<br />Unified.
        </Typography>
        <Typography sx={{ fontSize: 16, lineHeight: 1.6, mb: 5, maxWidth: 320, color: 'rgba(255,255,255,0.82)' }}>
          Connect with your doctors, manage documents, and get AI-powered health insights.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2, borderRadius: '14px', background: 'rgba(255,255,255,0.12)' }}>
          <Box sx={{ width: 42, height: 42, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.15)' }}>
            <SecurityIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Secure &amp; Private</Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>HIPAA Compliant Encryption</Typography>
          </Box>
        </Box>
      </Box>

      {/* Right panel */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', p: 4 }}>
        <Outlet />
      </Box>
    </Box>
  );
}

