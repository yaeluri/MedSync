import { NavLink, Outlet } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
}

const NAV_LINKS: NavItem[] = [
  { to: '/documents', label: 'Documents' },
  { to: '/visit',     label: 'Visit Recording' },
];

const navStyle = ({ isActive }: { isActive: boolean }) => ({
  marginRight: '1.5rem',
  fontWeight: isActive ? 'bold' : 'normal',
  textDecoration: 'none',
  color: isActive ? '#007bff' : '#333',
});

const MainLayout = () => (
  <div>
    <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #ddd', background: '#fff' }}>
      {NAV_LINKS.map(({ to, label }) => (
        <NavLink key={to} to={to} style={navStyle}>{label}</NavLink>
      ))}
    </nav>
    <main style={{ padding: '1rem' }}>
      <Outlet />
    </main>
  </div>
);

export default MainLayout;
