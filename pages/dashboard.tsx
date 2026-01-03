/**
 * User Dashboard Page
 * Protected route - shows dashboard based on user role
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import UserDashboard from '@/components/UserDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, openLoginModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect to home and open login
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      openLoginModal();
    }
  }, [isLoading, isAuthenticated, router, openLoginModal]);

  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Show appropriate dashboard based on role
  return (
    <Layout>
      {user?.role === UserRole.ADMIN ? <AdminDashboard /> : <UserDashboard />}
    </Layout>
  );
}

