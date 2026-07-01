import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

interface NavItem { to: string; label: string; }

const NAV_LINKS: NavItem[] = [
  { to: '/documents', label: 'Documents' },
];

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  marginRight: '1.5rem',
  fontWeight: isActive ? 'bold' : 'normal',
  textDecoration: 'none',
  color: isActive ? '#007bff' : '#333',
});

const MainLayout: React.FC = () => (
  <Box>
    <Box component="nav" sx={{ padding: '1rem 2rem', borderBottom: '1px solid #ddd', background: '#fff' }}>
      {NAV_LINKS.map(({ to, label }) => (
        <NavLink key={to} to={to} style={navLinkStyle}>{label}</NavLink>
      ))}
    </Box>
    <Box component="main" sx={{ padding: '1rem' }}>
      <Outlet />
    </Box>
  </Box>
);

export default MainLayout;