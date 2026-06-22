import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, PatientSummary } from '../api/patients';
import { useCurrentDoctor } from '../hooks/useCurrentDoctor';
import styles from './PatientsListPage.module.css';

const initials = (first: string, last: string) =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

export default function PatientsListPage() {
  const navigate = useNavigate();
  const doctor = useCurrentDoctor();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    getPatients()
      .then(data => {
        if (!active) return;
        setPatients(data);
        setStatus('done');
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p => {
      return (
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        (p.idNumber ?? '').toLowerCase().includes(q)
      );
    });
  }, [query, patients]);

  return (
    <div className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.pageTitle}>Patient List</div>
          <div className={styles.pageSub}>Select a patient to begin</div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.doctorInfo}>
            <span className={styles.doctorName}>{doctor.fullName}</span>
            <span className={styles.doctorSpec}>{doctor.specialization}</span>
          </div>
          <div className={styles.avatar}>{doctor.initials}</div>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.container}>
          <div className={styles.searchWrap}>
            <svg
              className={styles.searchIcon}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name or ID..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          {status === 'loading' ? (
            <div className={styles.empty}>Loading patients...</div>
          ) : status === 'error' ? (
            <div className={styles.empty}>Failed to load patients.</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>No patients match your search.</div>
          ) : (
            <div className={styles.list}>
              {filtered.map(p => (
                <div
                  key={p.id}
                  className={styles.card}
                  onClick={() => navigate(`/patients/${p.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/patients/${p.id}`);
                    }
                  }}
                >
                  <div className={styles.avatarLg}>
                    {initials(p.firstName, p.lastName)}
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardName}>
                      {p.firstName} {p.lastName}
                    </div>
                    <div className={styles.cardMeta}>
                      ID: {p.idNumber ?? p.id.slice(0, 8).toUpperCase()}
                      {p.age > 0 ? ` • ${p.age} Years` : ''}
                      {p.gender ? ` • ${p.gender}` : ''}
                    </div>
                  </div>
                  <svg
                    className={styles.chevron}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
