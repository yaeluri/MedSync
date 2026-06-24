import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { getPatientById, Patient } from '../api/patients';
import { downloadDocument, getDocumentSummary } from '../api/documents';
import { useAsyncData } from '../hooks/useAsyncData';
import PageHeader from '../components/PageHeader';
import styles from './DocumentsPage.module.css';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { file, status, summary, uploadedId, uploadedFileName, fileInputRef, selectFile, upload, reset } =
    useDocumentUpload(id);

  const { data: patient } = useAsyncData<Patient>(
    () => getPatientById(id!),
    [id],
  );

  const [selectedDoc, setSelectedDoc] = useState<{ id: string; name: string } | null>(null);
  const [docSummary, setDocSummary] = useState<string | null>(null);
  const [loadingDocSummary, setLoadingDocSummary] = useState(false);

  async function handleViewSummary(docId: string, docName: string) {
    if (selectedDoc?.id === docId) {
      setSelectedDoc(null);
      setDocSummary(null);
      return;
    }
    setSelectedDoc({ id: docId, name: docName });
    setDocSummary(null);
    setLoadingDocSummary(true);
    try {
      const result = await getDocumentSummary(docId);
      setDocSummary(result.summaryText || 'אין סיכום זמין.');
    } catch {
      setDocSummary('שגיאה בטעינת הסיכום.');
    } finally {
      setLoadingDocSummary(false);
    }
  }

  const isUploading = status === 'uploading';
  const isDone = status === 'done' && !selectedDoc;
  const isError = status === 'error' && !selectedDoc;

  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : 'מטופל';

  return (
    <div className={styles.main}>
      <PageHeader
        title={`מסמכים — ${patientName}`}
        subtitle="העלה וסכם מסמכים רפואיים"
        onBack={id ? () => navigate(`/patients/${id}`) : undefined}
      />

      <div className={styles.body}>
        <div className={styles.leftColumn}>
          <div className={styles.sectionTitle}>העלאת מסמך</div>

          <div
            className={styles.dropZone}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className={styles.dropZoneIcon} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className={styles.dropZoneText}>לחץ להעלאה או גרור לכאן</p>
            <p className={styles.dropZoneSub}>PDF או קבצי תמונה</p>
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
              {isUploading ? 'מעבד...' : 'העלאה וסיכום'}
            </button>
            {(file || summary) && (
              <button className={styles.clearBtn} onClick={reset}>נקה</button>
            )}
          </div>

          {(isDone || isError || selectedDoc) && (
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span className={styles.summaryTitle}>
                  {selectedDoc ? `סיכום — ${selectedDoc.name}` : 'סיכום בינה מלאכותית'}
                </span>
                {isDone && !selectedDoc && <span className={styles.summaryBadge}>הושלם</span>}
                {isDone && !selectedDoc && uploadedId && (
                  <button
                    className={styles.downloadBtn}
                    title="Download uploaded file"
                    onClick={() => downloadDocument(uploadedId, uploadedFileName ?? 'document')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    הורדה
                  </button>
                )}
              </div>
              <p className={`${styles.summaryText} ${isError ? styles.summaryError : ''}`}>
                {selectedDoc
                  ? (loadingDocSummary ? 'טוען סיכום...' : docSummary)
                  : summary}
              </p>
            </div>
          )}
        </div>

        {/* ── Right panel ── */}
        <aside className={styles.rightPanel}>
          <div className={styles.panelTabBar}>
            <span className={styles.panelTab}>תובנות בינה מלאכותית</span>
          </div>

          <div className={styles.panelContent}>
            {isUploading ? (
              <p className={styles.processingText}>מנתח מסמך...</p>
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
                  <div className={styles.insightTitle}>תובנה MedSync</div>
                  <div className={styles.insightText}>
                    המסמך עובד בהצלחה. ראה את הסיכום משמאל.
                  </div>
                </div>
              </div>
            ) : (
              <p className={styles.emptyState}>העלה מסמך לצפייה בתובנות.</p>
            )}
          </div>

          {/* Existing documents for this patient */}
          {patient && patient.documents && patient.documents.length > 0 && (
            <div className={styles.existingDocsList}>
              <div className={styles.existingDocsTitle}>מסמכים שהועלו</div>
              {patient.documents.map(d => (
                <div key={d.id} className={`${styles.existingDocRow} ${selectedDoc?.id === d.id ? styles.existingDocRowActive : ''}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#868e96" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <button
                    className={styles.existingDocName}
                    title={d.name}
                    onClick={() => handleViewSummary(d.id, d.name)}
                  >
                    {d.name}
                  </button>
                  <button
                    className={styles.existingDocDownload}
                    title="הורדה"
                    onClick={() => downloadDocument(d.id, d.name)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
