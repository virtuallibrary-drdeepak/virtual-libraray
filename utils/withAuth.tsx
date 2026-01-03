/**
 * Admin Authentication HOC
 * Protects admin routes - requires admin role
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export function useLogout() {
  const { logout } = useAuth();
  return logout;
}

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, openLoginModal } = useAuth();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          // Not logged in - open login modal
          openLoginModal();
          router.push('/');
        } else if (user?.role !== 'admin') {
          // Logged in but not admin
          router.push('/');
        } else {
          setIsChecking(false);
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading || isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
      return null;
    }

    return <Component {...props} />;
  };
}

export default withAuth;
