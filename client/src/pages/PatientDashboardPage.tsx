import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatientById, Patient } from '../api/patients';
import { downloadDocument } from '../api/documents';
import { useAsyncData } from '../hooks/useAsyncData';
import PageHeader from '../components/PageHeader';
import ClickableCard from '../components/ClickableCard';
import InfoGrid from '../components/InfoGrid';
import DocumentSummaryModal from '../components/DocumentSummaryModal';
import styles from './PatientDashboardPage.module.css';

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: patient, status } = useAsyncData<Patient>(
    () => getPatientById(id!),
    [id],
  );

  const [summaryModal, setSummaryModal] = useState<{ id: string; name: string } | null>(null);

  if (status !== 'done' || !patient) {
    return (
      <div className={styles.main}>
        <PageHeader
          title={status === 'loading' ? 'טוען מטופל...' : 'מטופל לא נמצא'}
          subtitle={status === 'loading' ? 'מייד נתוני המטופל' : 'המטופל הנבחר אינו קיים'}
          onBack={() => navigate('/patients')}
        />
        <div className={styles.body}>
          <div className={styles.container}>
            <div className={styles.emptyState}>
              {status === 'loading'
                ? 'אנא המתן…'
                : 'לא נמצא המטופל. חזור לרשימה.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className={styles.main}>
      <PageHeader
        title={fullName}
        subtitle={`ת"ז: ${patient.idNumber ?? patient.id.slice(0, 8).toUpperCase()} • גיל ${patient.age} • ${patient.gender === 'Male' ? 'זכר' : patient.gender === 'Female' ? 'נקבה' : patient.gender}`}
        onBack={() => navigate('/patients')}
      />

      <div className={styles.body}>
        <div className={styles.container}>
          {/* Quick info */}
          <InfoGrid fields={[
            { label: 'תאריך לידה', value: patient.dob },
            { label: 'טלפון',      value: patient.phone },
            { label: 'קופת חולים', value: patient.hmo },
            { label: 'כתובת',      value: patient.address },
          ]} />

          {/* AI overview */}
          <div className={styles.overviewCard}>
            <div className={styles.overviewAccent} />
            <div className={styles.overviewHead}>
              <div className={styles.overviewTitleRow}>
                <div className={styles.sparkleIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div className={styles.overviewTitle}>סיכום רפואי בבינה מלאכותית</div>
              </div>
              <button
                className={styles.startBtn}
                onClick={() => navigate(`/patients/${patient.id}/visit`)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                </svg>
                התחל ביקור
              </button>
            </div>
            <p className={styles.overviewText}>{patient.overview}</p>
          </div>

          {/* Two columns */}
          <div className={styles.cols}>
            <div>
              <div className={styles.colHeader}>
                <div className={styles.colTitle}>ביקורים אחרונים</div>
              </div>
              {patient.encounters.length === 0 ? (
                <div className={styles.emptyState}>אין ביקורים קודמים.</div>
              ) : (
                <div className={styles.encounterList}>
                  {patient.encounters.map((e, idx) => (
                    <ClickableCard
                      key={e.id}
                      to={`/patients/${patient.id}/visits/${e.id}`}
                      className={styles.encounter}
                    >
                      <div className={styles.encounterHead}>
                        <div className={styles.encounterDoctor}>
                          <div
                            className={`${styles.encounterIcon} ${
                              idx > 0 ? styles.encounterIconAlt : ''
                            }`}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                              <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                              <circle cx="20" cy="10" r="2" />
                            </svg>
                          </div>
                          <span>{e.doctor}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={styles.encounterDate}>{e.date}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ced4da" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </div>
                      <div className={styles.encounterMeta}>
                        {e.specialty} • {e.type}
                      </div>
                    </ClickableCard>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className={styles.colHeader}>
                <div className={styles.colTitle}>מסמכים רפואיים</div>
                <button
                  className={styles.uploadLink}
                  onClick={() => navigate(`/patients/${patient.id}/documents`)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  העלאת מסמך
                </button>
              </div>
              {patient.documents.length === 0 ? (
                <div className={styles.emptyState}>אין מסמכים.</div>
              ) : (
                <div className={styles.docList}>
                  {patient.documents.map(d => (
                    <div key={d.id} className={styles.docCard}>
                      <div className={styles.docIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <polyline points="9 15 11 17 15 13" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={styles.docName}>{d.name}</div>
                        <div className={styles.docMeta}>
                          {d.date} • {d.kind}
                        </div>
                      </div>
                      <button
                        title="צפה בסיכום"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#868e96', padding: '4px', display: 'flex', alignItems: 'center' }}
                        onClick={() => setSummaryModal({ id: d.id, name: d.name })}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="12" y1="8" x2="12" y2="12"/>
                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      </button>
                      <button
                        title="Download"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#868e96', padding: '4px', display: 'flex', alignItems: 'center' }}
                        onClick={() => downloadDocument(d.id, d.name)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {summaryModal && (
        <DocumentSummaryModal
          docId={summaryModal.id}
          docName={summaryModal.name}
          onClose={() => setSummaryModal(null)}
        />
      )}
    </div>
  );
}
