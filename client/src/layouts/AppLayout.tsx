import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Box, Tooltip, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import LogoutIcon from '@mui/icons-material/Logout';

const NAV_ITEM_SX = {
  width: 40, height: 40, borderRadius: '10px', color: '#adb5bd',
  '&:hover': { background: '#f1f3f5', color: '#495057' },
  '&.active': { background: '#eef2ff', color: '#3b5bdb' },
};

function NavItem({ to, title, icon }: { to: string; title: string; icon: React.ReactNode }) {
  return (
    <Tooltip title={title} placement="right">
      <IconButton component={NavLink} to={to} sx={NAV_ITEM_SX}>
        {icon}
      </IconButton>
    </Tooltip>
  );
}

export default function AppLayout() {
  const navigate = useNavigate();
  const isDoctor = localStorage.getItem('role') === 'doctor';

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box
        component="aside"
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: 64, borderRight: '1px solid #e9ecef', py: 2, flexShrink: 0, bgcolor: '#fff',
        }}
      >
        <Box
          sx={{
            width: 38, height: 38, bgcolor: 'primary.main', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 18, mb: 2,
          }}
        >
          M
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flex: 1 }}>
          {isDoctor ? (
            <>
              <NavItem to="/visit"     title="Active Visit" icon={<MonitorHeartIcon fontSize="small" />} />
              <NavItem to="/documents" title="Documents"    icon={<DescriptionIcon  fontSize="small" />} />
            </>
          ) : (
            <>
              <NavItem to="/dashboard" title="Home"      icon={<HomeIcon        fontSize="small" />} />
              <NavItem to="/documents" title="Documents" icon={<DescriptionIcon fontSize="small" />} />
              <NavItem to="/profile"   title="Profile"   icon={<PersonIcon      fontSize="small" />} />
            </>
          )}
        </Box>

        <Tooltip title="Log out" placement="right">
          <IconButton
            onClick={() => { localStorage.removeItem('role'); navigate('/login'); }}
            sx={{ width: 40, height: 40, borderRadius: '10px', color: '#adb5bd', '&:hover': { background: '#f1f3f5', color: '#495057' } }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Outlet />
    </Box>
  );
}


