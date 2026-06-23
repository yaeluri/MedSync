import { RefObject } from 'react';
import {
  Avatar, Box, Button, Dialog, DialogContent,
  IconButton, Stack, Tooltip, Typography,
} from '@mui/material';
import CameraAltIcon    from '@mui/icons-material/CameraAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloudUploadIcon  from '@mui/icons-material/CloudUpload';
import CloseIcon        from '@mui/icons-material/Close';

interface UploadModalProps {
  open:          boolean;
  onClose:       () => void;
  cameraMode:    boolean;
  onStartCamera: () => void;
  onStopCamera:  () => void;
  cameraError:   string | null;
  videoRef:      RefObject<HTMLVideoElement | null>;
  canvasRef:     RefObject<HTMLCanvasElement | null>;
  onCapture:     () => void;
  onChooseFile:  () => void;
}

export function UploadModal({
  open, onClose, cameraMode, onStartCamera, onStopCamera,
  cameraError, videoRef, canvasRef, onCapture, onChooseFile,
}: UploadModalProps) {
  return (
    <Dialog open={open} onClose={onClose} slotProps={{ paper: { sx: { borderRadius: 4, p: 1, width: 420 } } }}>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, pt: 4 }}>
        <Tooltip title="Close">
          <IconButton onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {!cameraMode ? (
          <>
            <Avatar sx={{ bgcolor: '#eef2ff', color: 'primary.main', width: 64, height: 64, mb: 0.5 }}>
              <CloudUploadIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>העלאת מסמך</Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 1 }}>
              צלם או בחר קובץ
            </Typography>

            <Button fullWidth variant="outlined" startIcon={<CameraAltIcon />}
              onClick={onStartCamera}
              sx={{ py: 1.5, borderStyle: 'dashed', borderRadius: 3 }}
            >
              צלם
            </Button>
            <Button fullWidth variant="outlined" color="inherit" startIcon={<PhotoLibraryIcon />}
              onClick={onChooseFile}
              sx={{ py: 1.5, borderRadius: 3, color: '#1a1a2e', borderColor: '#e9ecef' }}
            >
בחר מסמך            </Button>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>צלם</Typography>
            {cameraError
              ? <Typography color="error" sx={{ fontSize: 14, textAlign: 'center' }}>{cameraError}</Typography>
              : <Box component="video" ref={videoRef} autoPlay playsInline muted
                  sx={{ width: '100%', maxHeight: 300, borderRadius: 3, bgcolor: '#000', objectFit: 'cover' }} />
            }
            <canvas ref={canvasRef} hidden />
            <Stack direction="row" spacing={1.5} sx={{ width: '100%', mt: 1 }}>
              <Button fullWidth variant="outlined" color="inherit" onClick={onStopCamera}
                sx={{ borderColor: '#e9ecef', color: '#1a1a2e' }}>
                חזר
              </Button>
              {!cameraError && (
                <Button fullWidth variant="contained" startIcon={<CameraAltIcon />}
                  onClick={onCapture} sx={{ flex: 2 }}>
                  צלם
                </Button>
              )}
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
