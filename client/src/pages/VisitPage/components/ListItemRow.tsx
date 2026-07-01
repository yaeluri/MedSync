import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface IListItemRowProps {
  primaryText: string;
  primaryColor: string;
  secondaryText: string;
  isReadOnly: boolean;
  onRemove: () => void;
}

export const ListItemRow: React.FC<IListItemRowProps> = ({
  primaryText, primaryColor, secondaryText, isReadOnly, onRemove,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, py: 0.75, background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px' }}>
    <Typography sx={{ fontWeight: 700, color: primaryColor, fontSize: 13, whiteSpace: 'nowrap' }}>{primaryText}</Typography>
    <Typography sx={{ flex: 1, color: '#495057', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{secondaryText}</Typography>
    {!isReadOnly && (
      <Button size="small" onClick={onRemove} sx={{ minWidth: 0, p: 0.25, color: '#adb5bd', '&:hover': { color: '#e03131' } }}>
        <CloseIcon sx={{ fontSize: 16 }} />
      </Button>
    )}
  </Box>
);

export default ListItemRow;
