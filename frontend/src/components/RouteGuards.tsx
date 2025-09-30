import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';

export function PrivateRoute({ children }: { children: ReactNode }) {
  if (BYPASS_AUTH) return <>{children}</>;
  const { loading, user } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  if (BYPASS_AUTH) return <>{children}</>;
  const { loading, user, isAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function HRRoute({ children }: { children: ReactNode }) {
  if (BYPASS_AUTH) return <>{children}</>;
  const { loading, user, appUser } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!(appUser?.role === 'hr' || appUser?.role === 'admin')) return <Navigate to="/" replace />;
  return <>{children}</>;
}
