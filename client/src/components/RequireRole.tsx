import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { loadSession, RoleName } from '../api/auth';

interface RequireRoleProps {
  /** Roles allowed to access the nested routes. Omit to allow any authenticated user. */
  allow?: RoleName[];
}

/**
 * Route guard. Redirects unauthenticated users to the login screen and
 * sends authenticated users to their home route when their role is not
 * permitted for the requested path.
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ allow }) => {
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

export function homeForRole(role: RoleName): string {
  return role === 'doctor' ? '/patients' : '/dashboard';
}

export default RequireRole;
