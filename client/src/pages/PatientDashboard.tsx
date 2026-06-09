import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Avatar, IconButton, Tooltip,
  Dialog, DialogContent, LinearProgress, Snackbar, Alert,
  Paper, Stack, Grid,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PhoneIcon from '@mui/icons-material/Phone';

// ─── Types & mock data ───────────────────────────────────

type Doc = { id: number; name: string; date: string | null; status: 'processing' | 'done'; type: 'image' | 'pdf' };
type ToastState = { severity: 'success' | 'error'; message: string } | null;

const mockUser = { name: 'Israel Israeli', initials: 'II' };

const initialDocuments: Doc[] = [
  { id: 1, name: 'Referral_Letter.jpg', date: null,           status: 'processing', type: 'image' },
  { id: 2, name: 'Blood_Test.pdf',      date: 'Oct 20, 2025', status: 'done',       type: 'pdf'   },
];

const mockVisits = [
  { id: 1, doctor: 'Dr. Rotem Philipp', specialty: 'Cardiology',       date: 'Dec 01, 2025', type: 'Follow-up' },
  { id: 2, doctor: 'Dr. Amir Cohen',    specialty: 'General Practice', date: 'Nov 14, 2025', type: 'Checkup'   },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// ─── Component ───────────────────────────────────────────

export default function PatientDashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const streamRef    = useRef<MediaStream | null>(null);

  const [documents,       setDocuments]       = useState<Doc[]>(initialDocuments);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [cameraMode,      setCameraMode]      = useState(false);
  const [cameraError,     setCameraError]     = useState<string | null>(null);
  const [uploading,       setUploading]       = useState(false);
  const [toast,           setToast]           = useState<ToastState>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraMode(false);
    setCameraError(null);
  }, []);

  useEffect(() => {
    if (!cameraMode) return;
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      })
      .catch(() => { if (!cancelled) setCameraError('Camera access denied. Please allow camera permissions.'); });
    return () => { cancelled = true; stopCamera(); };
  }, [cameraMode, stopCamera]);

  const closeModal = () => { stopCamera(); setShowUploadModal(false); };

  const simulateUpload = (name: string, type: 'image' | 'pdf') => {
    setUploading(true);
    closeModal();
    const newDoc: Doc = { id: Date.now(), name, date: null, status: 'processing', type };
    setDocuments(prev => [newDoc, ...prev]);
    setTimeout(() => {
      const success = Math.random() > 0.15;
      setUploading(false);
      if (success) {
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'done', date: today } : d));
        setToast({ severity: 'success', message: `"${name}" uploaded successfully.` });
      } else {
        setDocuments(prev => prev.filter(d => d.id !== newDoc.id));
        setToast({ severity: 'error', message: `Failed to upload "${name}". Please try again.` });
      }
    }, 2000);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const { videoWidth: w, videoHeight: h } = videoRef.current;
    canvasRef.current.width = w;
    canvasRef.current.height = h;
    canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    stopCamera();
    simulateUpload(`photo_${Date.now()}.jpg`, 'image');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    simulateUpload(file.name, file.type.startsWith('image/') ? 'image' : 'pdf');
    e.target.value = '';
  };

  const firstName = mockUser.name.split(' ')[0];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
      {uploading && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300 }} />}

      {/* Header */}
      <Box
        component="header"
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 4, height: 68, borderBottom: '1px solid #e9ecef', bgcolor: '#fff', flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a2e' }}>
            {getGreeting()}, {firstName} 👋
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Here is your health overview.</Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{mockUser.name}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Patient View</Typography>
          </Box>
          <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38, fontSize: 13, fontWeight: 700 }}>
            {mockUser.initials}
          </Avatar>
        </Stack>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3.5, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Upload Banner */}
        <Box
          sx={{
            borderRadius: 4, p: 4, overflow: 'hidden', minHeight: 140,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 100%)',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>Have a new document?</Typography>
            <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', mb: 2, maxWidth: 320 }}>
              Upload test results or referrals before your next visit.
            </Typography>
            <Button
              variant="contained" startIcon={<CloudUploadIcon />}
              onClick={() => setShowUploadModal(true)}
              sx={{ bgcolor: 'rgba(255,255,255,0.95)', color: 'primary.main', fontWeight: 600,
                    '&:hover': { bgcolor: '#fff', transform: 'translateY(-1px)' } }}
            >
              Upload Document
            </Button>
            <input ref={fileInputRef} type="file" accept=".pdf,image/*" hidden onChange={handleFileChange} />
          </Box>
          <Box sx={{ opacity: 0.7, display: { xs: 'none', sm: 'block' } }}>
            <svg width="90" height="110" viewBox="0 0 90 110" fill="none">
              <rect x="10" y="10" width="60" height="80" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
              <rect x="20" y="30" width="40" height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
              <rect x="20" y="42" width="30" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
              <rect x="20" y="54" width="35" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
              <path d="M55 8L75 8L75 30L55 30Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
              <path d="M55 8L75 30" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
            </svg>
          </Box>
        </Box>

        {/* Middle row */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e9ecef', borderLeft: '4px solid #3b5bdb', height: '100%' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>AI Health Summary</Typography>
              </Stack>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.65 }}>
                "Based on your recent uploads, your <strong>Blood Pressure</strong> trends are stable.
                Dr. Cohen noted an improvement in your headaches. Remember to bring your latest blood
                work results to the next checkup."
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e9ecef', height: '100%' }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>Recent Documents</Typography>
              <Stack spacing={1}>
                {documents.map(doc => (
                  <Stack key={doc.id} direction="row" spacing={1.5}
                    sx={{ p: 1, borderRadius: 2, bgcolor: '#f8f9fa', cursor: 'pointer', alignItems: 'center', '&:hover': { bgcolor: '#f1f3f5' } }}
                  >
                    <Avatar sx={{ width: 36, height: 36, borderRadius: 2,
                                  bgcolor: doc.type === 'image' ? '#fff3e6' : '#e8f4fd',
                                  color:  doc.type === 'image' ? '#e8590c' : '#1c7ed6' }}>
                      {doc.type === 'image' ? <ImageIcon fontSize="small" /> : <PictureAsPdfIcon fontSize="small" />}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>{doc.name}</Typography>
                      {doc.status === 'processing'
                        ? <Typography sx={{ fontSize: 12, color: '#e8590c', fontWeight: 500 }}>Processing...</Typography>
                        : <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{doc.date}</Typography>
                      }
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Visits */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e9ecef' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>Recent Visits</Typography>
          <Stack spacing={1.5}>
            {mockVisits.map(visit => (
              <Stack key={visit.id} direction="row" spacing={2}
                sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8f9fa', cursor: 'pointer', alignItems: 'center', '&:hover': { bgcolor: '#f1f3f5' } }}
              >
                <Avatar sx={{ bgcolor: '#d3f9d8', color: '#2f9e44', width: 42, height: 42 }}>
                  <PhoneIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{visit.doctor} ({visit.specialty})</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{visit.date} • {visit.type}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Box>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onClose={closeModal} slotProps={{ paper: { sx: { borderRadius: 4, p: 1, width: 420 } } }}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 4 }}>
          <Tooltip title="Close">
            <IconButton onClick={closeModal} sx={{ position: 'absolute', top: 12, right: 12 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {!cameraMode ? (
            <>
              <Avatar sx={{ bgcolor: '#eef2ff', color: 'primary.main', width: 64, height: 64, mb: 0.5 }}>
                <CloudUploadIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Upload Document</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 1 }}>Take a photo or choose a file</Typography>

              <Button fullWidth variant="outlined" startIcon={<CameraAltIcon />}
                onClick={() => setCameraMode(true)}
                sx={{ py: 1.5, borderStyle: 'dashed', borderRadius: 3 }}
              >
                Take Photo
              </Button>
              <Button fullWidth variant="outlined" color="inherit" startIcon={<PhotoLibraryIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ py: 1.5, borderRadius: 3, color: '#1a1a2e', borderColor: '#e9ecef' }}
              >
                Choose from Gallery
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Take Photo</Typography>
              {cameraError
                ? <Typography color="error" sx={{ fontSize: 14, textAlign: 'center' }}>{cameraError}</Typography>
                : <Box component="video" ref={videoRef} autoPlay playsInline muted
                    sx={{ width: '100%', maxHeight: 300, borderRadius: 3, bgcolor: '#000', objectFit: 'cover' }} />
              }
              <canvas ref={canvasRef} hidden />
              <Stack direction="row" spacing={1.5} sx={{ width: '100%', mt: 1 }}>
                <Button fullWidth variant="outlined" color="inherit" onClick={stopCamera}
                  sx={{ borderColor: '#e9ecef', color: '#1a1a2e' }}>
                  Back
                </Button>
                {!cameraError && (
                  <Button fullWidth variant="contained" startIcon={<CameraAltIcon />} onClick={handleCapture} sx={{ flex: 2 }}>
                    Capture
                  </Button>
                )}
              </Stack>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={!!toast} autoHideDuration={4000} onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
