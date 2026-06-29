import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { loadSession, verifySession, clearSession, getEffectiveRole, RoleMismatchError, RoleName } from '../../api/auth';
import { RoleMismatchDialog } from '../RoleMismatchDialog/RoleMismatchDialog';

export interface IRequireRoleProps {
  allow?: RoleName[];
}

export const RequireRole: React.FC<IRequireRoleProps> = ({ allow }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(loadSession);
  const [verified, setVerified] = useState(false);
  const [isRoleTampered, setIsRoleTampered] = useState(false);

  useEffect(() => {
    let active = true;
    setVerified(false);
    verifySession()
      .then(result => {
        if (!active) return;
        setSession(result);
        setVerified(true);
      })
      .catch(error => {
        if (!active) return;
        if (error instanceof RoleMismatchError) {
          setIsRoleTampered(true);
        }
        setSession(null);
        setVerified(true);
      });
    return () => { active = false; };
  }, [location.pathname]);

  const handleConfirmRelogin = () => {
    clearSession();
    setIsRoleTampered(false);
    navigate('/login', { replace: true });
  };

  if (isRoleTampered) {
    return <RoleMismatchDialog open onConfirm={handleConfirmRelogin} />;
  }

  if (!verified) return null;

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const effectiveRole = getEffectiveRole() ?? session.role;

  if (allow && !allow.includes(effectiveRole)) {
    return <Navigate to={homeForRole(effectiveRole)} replace />;
  }

  return <Outlet />;
};

export const homeForRole = (role: RoleName): string =>
  role === 'doctor' ? '/patients' : '/dashboard';

export default RequireRole;
