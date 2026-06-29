import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifySession, clearSession, loadSession, RoleMismatchError } from '../../api/auth';
import { RoleMismatchDialog } from '../RoleMismatchDialog/RoleMismatchDialog';

const VERIFY_INTERVAL_MS = 5000;

const AUTH_ROUTES = ['/login', '/register'];

export const AuthMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRoleTampered, setIsRoleTampered] = useState(false);
  const checking = useRef(false);

  const isAuthRoute = AUTH_ROUTES.some(route => location.pathname.startsWith(route));

  const runCheck = useCallback(async () => {
    if (checking.current) return;
    if (!loadSession()) return;        // not logged in, nothing to verify
    checking.current = true;
    try {
      await verifySession();
    } catch (error) {
      if (error instanceof RoleMismatchError) {
        setIsRoleTampered(true);
      }
    } finally {
      checking.current = false;
    }
  }, []);

  useEffect(() => {
    if (isAuthRoute || isRoleTampered) return;

    runCheck();
    const interval = window.setInterval(runCheck, VERIFY_INTERVAL_MS);
    const onFocus = () => runCheck();
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthRoute, isRoleTampered, runCheck]);

  const handleConfirmRelogin = () => {
    clearSession();
    setIsRoleTampered(false);
    navigate('/login', { replace: true });
  };

  return (
    <>
      {children}
      <RoleMismatchDialog open={isRoleTampered} onConfirm={handleConfirmRelogin} />
    </>
  );
};

export default AuthMonitor;
