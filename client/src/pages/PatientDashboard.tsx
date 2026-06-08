import { useRef, useState, useEffect, useCallback } from 'react';
import styles from './PatientDashboard.module.css';

const mockUser = { name: 'Israel Israeli', initials: 'II' };

const initialDocuments = [
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

type Doc = { id: number; name: string; date: string | null; status: string; type: string };
type Toast = { status: 'success' | 'error'; message: string } | null;

export default function PatientDashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [documents, setDocuments] = useState<Doc[]>(initialDocuments);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const firstName = mockUser.name.split(' ')[0];

  // Stop camera stream helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraMode(false);
    setCameraError(null);
  }, []);

  // Start camera when cameraMode becomes true
  useEffect(() => {
    if (!cameraMode) return;
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch(() => {
        if (!cancelled) setCameraError('Camera access denied. Please allow camera permissions.');
      });
    return () => { cancelled = true; stopCamera(); };
  }, [cameraMode, stopCamera]);

  const showToast = (status: 'success' | 'error', message: string) => {
    setToast({ status, message });
    setTimeout(() => setToast(null), 4000);
  };

  const closeModal = () => {
    stopCamera();
    setShowUploadModal(false);
  };

  const handleTakePhoto = () => {
    setCameraError(null);
    setCameraMode(true);
  };

  const simulateUpload = (name: string, type: 'image' | 'pdf') => {
    setUploading(true);
    closeModal();
    // Immediately add as processing
    const newDoc: Doc = {
      id: Date.now(),
      name,
      date: null,
      status: 'processing',
      type,
    };
    setDocuments(prev => [newDoc, ...prev]);
    // Simulate network delay
    setTimeout(() => {
      const success = Math.random() > 0.15; // 85% success rate
      setUploading(false);
      if (success) {
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        setDocuments(prev =>
          prev.map(d => d.id === newDoc.id ? { ...d, status: 'done', date: today } : d)
        );
        showToast('success', `"${name}" uploaded successfully.`);
      } else {
        setDocuments(prev => prev.filter(d => d.id !== newDoc.id));
        showToast('error', `Failed to upload "${name}". Please try again.`);
      }
    }, 2000);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    stopCamera();
    simulateUpload('photo_' + Date.now() + '.jpg', 'image');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith('image/') ? 'image' : 'pdf';
    simulateUpload(file.name, type);
    e.target.value = '';
  };

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
              onClick={() => setShowUploadModal(true)}
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
              onChange={handleFileChange}
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
              {documents.map(doc => (
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

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeModal}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {!cameraMode ? (
              /* ── Choice screen ── */
              <>
                <div className={styles.modalIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16"/>
                    <line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                </div>
                <h2 className={styles.modalTitle}>Upload Document</h2>
                <p className={styles.modalSub}>Take a photo or choose a file</p>

                <button className={styles.modalBtnPrimary} onClick={handleTakePhoto}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Take Photo
                </button>

                <button className={styles.modalBtnSecondary} onClick={() => fileInputRef.current?.click()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Choose from Gallery
                </button>
              </>
            ) : (
              /* ── Camera screen ── */
              <>
                <h2 className={styles.modalTitle}>Take Photo</h2>
                {cameraError ? (
                  <p className={styles.cameraError}>{cameraError}</p>
                ) : (
                  <video ref={videoRef} className={styles.cameraPreview} autoPlay playsInline muted />
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className={styles.cameraActions}>
                  <button className={styles.modalBtnSecondary} onClick={stopCamera}>Back</button>
                  {!cameraError && (
                    <button className={styles.captureBtn} onClick={handleCapture}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      Capture
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`${styles.toast} ${toast.status === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.status === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* uploading indicator in banner area */}
      {uploading && (
        <div className={styles.uploadingBar}>
          <div className={styles.uploadingBarFill} />
        </div>
      )}
    </div>
  );
}
