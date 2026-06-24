import { useEffect, useState } from 'react';
import { getDocumentSummary } from '../api/documents';
import styles from './DocumentSummaryModal.module.css';

interface Props {
  docId: string;
  docName: string;
  onClose: () => void;
}

export default function DocumentSummaryModal({ docId, docName, onClose }: Props) {
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getDocumentSummary(docId)
      .then(r => { if (active) setSummaryText(r.summaryText || 'אין סיכום זמין.'); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [docId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrap}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <polyline points="9 15 11 17 15 13"/>
              </svg>
            </div>
            <div>
              <div className={styles.title}>סיכום בינה מלאכותית</div>
              <div className={styles.subtitle}>{docName}</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="סגור">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {loading && (
            <div className={styles.loadingWrap}>
              <span className={styles.spinner} />
              <span>טוען סיכום...</span>
            </div>
          )}
          {!loading && error && (
            <p className={styles.errorText}>שגיאה בטעינת הסיכום. נסה שנית.</p>
          )}
          {!loading && !error && (
            <p className={styles.summaryText}>{summaryText}</p>
          )}
        </div>
      </div>
    </div>
  );
}
