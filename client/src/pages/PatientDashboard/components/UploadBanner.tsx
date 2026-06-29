import { RefObject } from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DocumentUploadIllustration from '../../../assets/svg/document-upload-illustration.svg?react';

interface UploadBannerProps {
  onUploadClick: () => void;
  fileInputRef:  RefObject<HTMLInputElement | null>;
  onFileChange:  (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadBanner({ onUploadClick, fileInputRef, onFileChange }: UploadBannerProps) {
  return (
    <Box
      sx={{
        borderRadius: 4, p: 4, overflow: 'hidden', minHeight: 140,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexDirection: 'row-reverse',
        background: 'linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 100%)',
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mb: 0.5 }}>
          יש לך מסמך חדש?
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', mb: 2, maxWidth: 320 }}>
          העלה תוצאות בדיקות או הפניות לפני ביקור הבא.
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={onUploadClick}
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)', color: 'primary.main', fontWeight: 600,
            '&:hover': { bgcolor: '#fff', transform: 'translateY(-1px)' },
          }}
        >
          העלאת מסמך
        </Button>
        <input ref={fileInputRef} type="file" accept=".pdf,image/*" hidden onChange={onFileChange} />
      </Box>

      <Box sx={{ opacity: 0.7, display: { xs: 'none', sm: 'block' } }}>
        <DocumentUploadIllustration />
      </Box>
    </Box>
  );
}
