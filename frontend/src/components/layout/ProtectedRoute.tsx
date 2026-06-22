import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading: isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-ip-surface">
      <Loader2 className="w-8 h-8 animate-spin text-ip-primary" />
    </div>
  );

  if (!isLoading && !user) return <Navigate to="/login" replace />;

  if (user?.isFirstLogin && window.location.pathname !== '/force-password-reset') {
    return <Navigate to="/force-password-reset" replace />;
  }

  return <Outlet />;
}