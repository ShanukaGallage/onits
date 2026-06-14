import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading: isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  if (!isLoading && !user) return <Navigate to="/login" replace />;

  return <Outlet />;
}