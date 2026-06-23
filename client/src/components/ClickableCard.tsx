import type { ReactNode, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

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
export default function ClickableCard({ to, onClick, className, children }: ClickableCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
