import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { getPatientById, Patient } from '../api/patients';
import styles from './DocumentsPage.module.css';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { file, status, summary, fileInputRef, selectFile, upload, reset } =
    useDocumentUpload(id);

  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getPatientById(id)
      .then(data => {
        if (active) setPatient(data);
      })
      .catch(() => {
        if (active) setPatient(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const isUploading = status === 'uploading';
  const isDone = status === 'done';
  const isError = status === 'error';

  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : 'Patient';

  return (
    <div className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {id && (
            <button
              className={styles.backBtn}
              onClick={() => navigate(`/patients/${id}`)}
              aria-label="Back to patient"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div className={styles.headerTitleBlock}>
            <div className={styles.pageTitle}>Documents — {patientName}</div>
            <div className={styles.pageSub}>
              Upload &amp; summarize medical documents for this patient
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.doctorInfo}>
            <span className={styles.doctorName}>Dr. Rotem Philipp</span>
            <span className={styles.doctorSpec}>Cardiology</span>
          </div>
          <div className={styles.avatar}>DR</div>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.leftColumn}>
          <div className={styles.sectionTitle}>Upload Document</div>

          <div
            className={styles.dropZone}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className={styles.dropZoneIcon} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className={styles.dropZoneText}>Click to upload or drag &amp; drop</p>
            <p className={styles.dropZoneSub}>PDF or image files</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/*"
            onChange={selectFile}
            style={{ display: 'none' }}
          />

          {file && (
            <div className={styles.fileSelected}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              {file.name}
            </div>
          )}

          <div className={styles.btnRow}>
            <button
              className={file && !isUploading ? styles.uploadBtn : styles.uploadBtnDisabled}
              onClick={upload}
              disabled={!file || isUploading}
            >
              {isUploading ? 'Processing...' : 'Upload & Summarize'}
            </button>
            {(file || summary) && (
              <button className={styles.clearBtn} onClick={reset}>Clear</button>
            )}
          </div>

          {(isDone || isError) && (
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className={styles.summaryTitle}>AI Summary</span>
                {isDone && <span className={styles.summaryBadge}>Done</span>}
              </div>
              <p className={`${styles.summaryText} ${isError ? styles.summaryError : ''}`}>
                {summary}
              </p>
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <aside className={styles.rightPanel}>
          <div className={styles.panelTabBar}>
            <span className={styles.panelTab}>AI Insights</span>
          </div>

          <div className={styles.panelContent}>
            {isUploading ? (
              <p className={styles.processingText}>Analyzing document...</p>
            ) : isDone ? (
              <div className={styles.insightCard}>
                <div className={styles.insightIconWrap}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.insightTitle}>MedSync Insight</div>
                  <div className={styles.insightText}>
                    Document processed successfully. Review the summary on the left.
                  </div>
                </div>
              </div>
            ) : (
              <p className={styles.emptyState}>Upload a document to see AI insights here.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
