import { useAuth } from '@/lib/AuthContext';
import { Outlet } from 'react-router-dom';

export default function ProtectedRoute({ unauthenticatedElement }) {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (!user) return unauthenticatedElement;
  return <Outlet />;
}
