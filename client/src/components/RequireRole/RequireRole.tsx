import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { loadSession, RoleName } from '../../api/auth';

export interface IRequireRoleProps {
  allow?: RoleName[];
}

export const RequireRole: React.FC<IRequireRoleProps> = ({ allow }) => {
  const location = useLocation();
  const session = loadSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow && !allow.includes(session.role)) {
    return <Navigate to={homeForRole(session.role)} replace />;
  }

  return <Outlet />;
};

export const homeForRole = (role: RoleName): string =>
  role === 'doctor' ? '/patients' : '/dashboard';

export default RequireRole;
