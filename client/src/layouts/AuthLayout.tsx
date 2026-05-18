import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  return (
    <div className={styles.page}>
      {/* Left Panel */}
      <div className={styles.leftPanel}>
        <div className={styles.logo}>M</div>
        <h1 className={styles.heroHeading}>
          Your Medical History,<br />Unified.
        </h1>
        <p className={styles.heroSubtext}>
          Connect with your doctors, manage documents, and get AI-powered health insights.
        </p>
        <div className={styles.badge}>
          <div className={styles.badgeIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div className={styles.badgeTitle}>Secure &amp; Private</div>
            <div className={styles.badgeSub}>HIPAA Compliant Encryption</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <Outlet />
      </div>
    </div>
  );
}

