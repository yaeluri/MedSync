import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') as 'patient' | 'doctor' | null;
  const isDoctor = role === 'doctor';

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>M</div>

        <nav className={styles.nav}>
          {isDoctor ? (
            /* ── Doctor nav ── */
            <>
              {/* Active Visit */}
              <NavLink
                to="/visit"
                title="Active Visit"
                className={({ isActive }) =>
                  `${styles.navBtn}${isActive ? ` ${styles.navBtnActive}` : ''}`
                }
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </NavLink>

              {/* Documents */}
              <NavLink
                to="/documents"
                title="Documents"
                className={({ isActive }) =>
                  `${styles.navBtn}${isActive ? ` ${styles.navBtnActive}` : ''}`
                }
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </NavLink>
            </>
          ) : (
            /* ── Patient nav ── */
            <>
              {/* Home / Dashboard */}
              <NavLink
                to="/dashboard"
                title="Home"
                className={({ isActive }) =>
                  `${styles.navBtn}${isActive ? ` ${styles.navBtnActive}` : ''}`
                }
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </NavLink>

              {/* Documents */}
              <NavLink
                to="/documents"
                title="Documents"
                className={({ isActive }) =>
                  `${styles.navBtn}${isActive ? ` ${styles.navBtnActive}` : ''}`
                }
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </NavLink>

              {/* Profile */}
              <NavLink
                to="/profile"
                title="Profile"
                className={({ isActive }) =>
                  `${styles.navBtn}${isActive ? ` ${styles.navBtnActive}` : ''}`
                }
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </NavLink>
            </>
          )}
        </nav>

        <button
          className={styles.logoutBtn}
          title="Log out"
          onClick={() => { localStorage.removeItem('role'); navigate('/login'); }}
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
