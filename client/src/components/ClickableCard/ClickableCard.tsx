import React, { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonBase } from '@mui/material';

export interface IClickableCardProps {
  to?: string;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

export const ClickableCard: React.FC<IClickableCardProps> = ({ to, onClick, className, children }) => {
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
