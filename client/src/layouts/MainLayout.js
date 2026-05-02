import { NavLink, Outlet } from 'react-router-dom';

const navStyle = ({ isActive }) => ({
  marginRight: '1.5rem',
  fontWeight: isActive ? 'bold' : 'normal',
  textDecoration: 'none',
  color: isActive ? '#007bff' : '#333',
});

export default function MainLayout() {
  return (
    <div>
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid #ddd', background: '#fff' }}>
        <NavLink to="/documents" style={navStyle}>Documents</NavLink>
        <NavLink to="/visit" style={navStyle}>Visit Recording</NavLink>
      </nav>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}
