import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../src/context/AuthContext';
import type { Role } from '../../../src/types/index';

interface RoleRouteProps {
  allowedRoles: Role[];
}

export default function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
