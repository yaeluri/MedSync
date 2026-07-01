import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifySession, clearSession, loadSession, RoleMismatchError } from '../../api/auth';
import { RoleMismatchDialog } from '../RoleMismatchDialog/RoleMismatchDialog';

const VERIFY_INTERVAL_MS = 5000;

const AUTH_ROUTES = ['/login', '/register'];

export const AuthMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRoleTampered, setIsRoleTampered] = useState(false);

  const isAuthRoute = AUTH_ROUTES.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    if (isAuthRoute || isRoleTampered) return;

    let checking = false;
    const runCheck = async () => {
      if (checking) return;
      if (!loadSession()) return; // not logged in, nothing to verify
      checking = true;
      try {
        await verifySession();
      } catch (error) {
        if (error instanceof RoleMismatchError) {
          setIsRoleTampered(true);
        }
      } finally {
        checking = false;
      }
    };

    // No initial call: RequireRole already verifies on every route change.
    // AuthMonitor's job is only to catch DB-side changes during idle time.
    const interval = window.setInterval(runCheck, VERIFY_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [isAuthRoute, isRoleTampered]);

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
