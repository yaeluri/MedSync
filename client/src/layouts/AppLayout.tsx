import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>M</div>

        <nav className={styles.nav}>
          {/* Patients */}
          <NavLink
            to="/patients"
            title="Patient List"
            className={({ isActive }) =>
              `${styles.navBtn}${isActive ? ` ${styles.navBtnActive}` : ''}`
            }
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </NavLink>
        </nav>

        <button
          className={styles.logoutBtn}
          title="Log out"
          onClick={() => navigate('/login')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </aside>

      <Outlet />
    </div>
  );
}
