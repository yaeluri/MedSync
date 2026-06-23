import styles from './PageHeader.module.css';
import { useCurrentDoctor } from '../hooks/useCurrentDoctor';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function PageHeader({ title, subtitle, onBack }: PageHeaderProps) {
  const doctor = useCurrentDoctor();

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div className={styles.titleBlock}>
          <div className={styles.title}>{title}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
      </div>
      <div className={styles.headerRight}>
        <div className={styles.doctorInfo}>
          <span className={styles.doctorName}>{doctor.fullName}</span>
          <span className={styles.doctorSpec}>{doctor.specialization}</span>
        </div>
        <div className={styles.avatar}>{doctor.initials}</div>
      </div>
    </header>
  );
}
