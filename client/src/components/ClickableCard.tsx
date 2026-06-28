import React, { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonBase } from '@mui/material';

interface ClickableCardProps {
  to?: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

/**
 * Accessible clickable card that supports keyboard navigation (Enter / Space).
 * Provide either `to` for navigation or `onClick` for custom behaviour.
 */
export const ClickableCard: React.FC<ClickableCardProps> = ({ to, onClick, className, children }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  return (
    <ButtonBase
      className={className}
      onClick={handleClick}
      focusRipple
      sx={{ display: 'block', width: '100%', textAlign: 'inherit' }}
    >
      {children}
    </ButtonBase>
  );
};

export default ClickableCard;
