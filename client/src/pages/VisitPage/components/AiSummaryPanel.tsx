import React from 'react';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import StopIcon from '@mui/icons-material/Stop';
import { AiPanel, SummarySectionCard } from '../styled';
import { SUMMARY_SECTIONS, formatRecordingTime } from '../constants';
import type { VisitFormState } from '../hooks/useVisitForm';

interface AiSummaryPanelProps {
  form: VisitFormState;
}

export const AiSummaryPanel: React.FC<AiSummaryPanelProps> = ({ form }) => {
  const { isProcessing, isReadOnly, isRecording, isStarting, isSummarizing, liveSummary, timer, handleRecord } = form;

  return (
    <AiPanel>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', px: 2.5, borderBottom: '1px solid #e9ecef', height: 48, alignItems: 'flex-end' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#3b5bdb', borderBottom: '2px solid #3b5bdb', pb: 1.5 }}>
          סיכום בינה מלאכותית
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        {isProcessing ? (
          <Typography sx={{ fontSize: 14, color: '#868e96', textAlign: 'center', mt: 5 }}>מנתח ביקור...</Typography>
        ) : (
          <Paper elevation={0} sx={{ borderRadius: 3, p: 1.75, background: '#f8f9fa', border: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: '#eef2ff', color: '#3b5bdb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isSummarizing ? <CircularProgress size={14} sx={{ color: '#3b5bdb' }} /> : <AutoAwesomeIcon sx={{ fontSize: 14 }} />}
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>
                תובנה MedSync
                {isSummarizing && <Typography component="span" sx={{ fontWeight: 500, color: '#3b5bdb', fontSize: 11 }}> · מעדכן…</Typography>}
              </Typography>
            </Stack>
            {liveSummary ? (
              <Stack sx={{ gap: 1 }}>
                {SUMMARY_SECTIONS.map(({ key, label, icon, color, bg }) => (
                  <SummarySectionCard key={key}>
                    <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 22, height: 22, borderRadius: '6px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {icon}
                      </Box>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>
                        {label}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 13, color: '#495057', lineHeight: 1.55, textAlign: 'right', direction: 'rtl', pl: 3.75 }}>
                      {liveSummary[key] || 'Not documented.'}
                    </Typography>
                  </SummarySectionCard>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ fontSize: 13, color: '#adb5bd', textAlign: 'center', lineHeight: 1.5 }}>
                רשום או הקלט ביקור כדי לקבל סיכום.
              </Typography>
            )}
          </Paper>
        )}
      </Box>
      {!isReadOnly && (
        <Box sx={{ p: 2 }}>
          <Button fullWidth
            variant={isRecording ? 'contained' : 'outlined'}
            color={isRecording ? 'error' : 'primary'}
            startIcon={isStarting ? <CircularProgress size={16} color="inherit" /> : isRecording ? <StopIcon /> : <KeyboardVoiceIcon />}
            onClick={handleRecord}
            disabled={isProcessing || isStarting}
            sx={{
              borderRadius: '10px', fontWeight: 600, fontSize: 14, py: 1.375,
              ...(isRecording ? {} : { borderColor: '#3b5bdb', color: '#3b5bdb', '&:hover': { background: '#eef2ff', borderColor: '#3b5bdb' } }),
              ...(isStarting ? { opacity: 0.8, background: '#edf2ff' } : {}),
            }}>
            {isStarting
              ? 'מפעיל הקלטה...'
              : isRecording
                ? `עצור הקלטה  ${formatRecordingTime(timer)}`
                : 'הקלט שמע לביקור'}
          </Button>
          <Typography sx={{ mt: 1, fontSize: 12, color: '#495057', textAlign: 'right', direction: 'rtl', lineHeight: 1.45 }}>
            שים לב: יש להפעיל את ההקלטה מתחילת הפגישה ועד סופה כדי להבטיח תיעוד מלא ומדויק.
          </Typography>
        </Box>
      )}
    </AiPanel>
  );
};

export default AiSummaryPanel;
