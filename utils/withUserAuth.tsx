/**
 * Higher-Order Component for Protected Routes
 * Redirects to login if user is not authenticated
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requirePremium?: boolean;
    redirectTo?: string;
  }
) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading, user, openLoginModal } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          // Not logged in - open login modal
          openLoginModal();
          if (options?.redirectTo) {
            router.push(options.redirectTo);
          }
        } else if (options?.requirePremium && !user?.isPremium) {
          // Logged in but not premium
          router.push('/neet-pg'); // Redirect to pricing page
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Show nothing if not authenticated (modal will show)
    if (!isAuthenticated) {
      return null;
    }

    // Show nothing if premium required but user is not premium
    if (options?.requirePremium && !user?.isPremium) {
      return null;
    }

    // Render the protected component
    return <Component {...props} />;
  };
}
