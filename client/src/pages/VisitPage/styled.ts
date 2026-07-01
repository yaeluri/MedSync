import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageRoot = styled(Box)({
  display: 'flex', flexDirection: 'column', flex: 1,
  overflow: 'hidden', background: '#f8f9fa', direction: 'rtl',
});

export const PatientInfoBarRoot = styled(Box)({
  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  padding: '8px 28px', background: '#f8f9fa',
  borderBottom: '1px solid #e9ecef', flexShrink: 0,
});

export const FormColumn = styled(Box)({
  display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: 24, gap: 16,
});

export const FormCard = styled(Paper)({
  borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column',
  gap: 14, position: 'relative', overflow: 'visible',
  border: '1px solid #e9ecef', boxShadow: 'none',
});
