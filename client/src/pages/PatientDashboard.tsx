import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PatientDashboard.module.css';

const mockUser = { name: 'Israel Israeli', initials: 'II' };

const mockDocuments = [
  { id: 1, name: 'Referral_Letter.jpg', date: null, status: 'processing', type: 'image' },
  { id: 2, name: 'Blood_Test.pdf', date: 'Oct 20, 2025', status: 'done', type: 'pdf' },
];

const mockVisits = [
  {
    id: 1,
    doctor: 'Dr. Rotem Philipp',
    specialty: 'Cardiology',
    date: 'Dec 01, 2025',
    type: 'Follow-up',
  },
  {
    id: 2,
    doctor: 'Dr. Amir Cohen',
    specialty: 'General Practice',
    date: 'Nov 14, 2025',
    type: 'Checkup',
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const firstName = mockUser.name.split(' ')[0];

  return (
    <div className={styles.main}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.greeting}>
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className={styles.greetingSub}>Here is your health overview.</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{mockUser.name}</span>
            <span className={styles.userRole}>Patient View</span>
          </div>
          <div className={styles.avatar}>{mockUser.initials}</div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className={styles.body}>
        {/* Upload Banner */}
        <div className={styles.uploadBanner}>
          <div className={styles.bannerContent}>
            <h2 className={styles.bannerTitle}>Have a new document?</h2>
            <p className={styles.bannerSub}>
              Upload test results or referrals before your next visit.
            </p>
            <button
              className={styles.bannerBtn}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload Document
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              style={{ display: 'none' }}
              onChange={() => navigate('/documents')}
            />
          </div>
          <div className={styles.bannerIllustration}>
            <svg width="90" height="110" viewBox="0 0 90 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="60" height="80" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
              <rect x="20" y="30" width="40" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
              <rect x="20" y="42" width="30" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="20" y="54" width="35" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
              <path d="M55 8 L75 8 L75 30 L55 30 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
              <path d="M55 8 L75 30" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        {/* Middle Row: AI Summary + Recent Docs */}
        <div className={styles.middleRow}>
          {/* AI Summary */}
          <div className={styles.aiCard}>
            <div className={styles.aiCardHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
              </svg>
              <span className={styles.aiCardTitle}>AI Health Summary</span>
            </div>
            <p className={styles.aiCardText}>
              "Based on your recent uploads, your <strong>Blood Pressure</strong> trends are stable.
              Dr. Cohen noted an improvement in your headaches. Remember to bring your latest blood
              work results to the next checkup."
            </p>
          </div>

          {/* Recent Documents */}
          <div className={styles.docsCard}>
            <h3 className={styles.cardTitle}>Recent Documents</h3>
            <div className={styles.docsList}>
              {mockDocuments.map(doc => (
                <div key={doc.id} className={styles.docItem}>
                  <div className={`${styles.docIcon} ${doc.type === 'image' ? styles.docIconImage : styles.docIconPdf}`}>
                    {doc.type === 'image' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    )}
                  </div>
                  <div className={styles.docMeta}>
                    <span className={styles.docName}>{doc.name}</span>
                    {doc.status === 'processing' ? (
                      <span className={styles.docProcessing}>Processing...</span>
                    ) : (
                      <span className={styles.docDate}>{doc.date}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Visits */}
        <div className={styles.visitsSection}>
          <h3 className={styles.sectionTitle}>Recent Visits</h3>
          <div className={styles.visitsList}>
            {mockVisits.map(visit => (
              <div key={visit.id} className={styles.visitCard}>
                <div className={styles.visitIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.64a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className={styles.visitMeta}>
                  <span className={styles.visitDoctor}>{visit.doctor} ({visit.specialty})</span>
                  <span className={styles.visitDate}>{visit.date} • {visit.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
