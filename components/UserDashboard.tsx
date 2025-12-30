/**
 * User Dashboard Component
 * Shows personalized content for logged-in users
 */

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function UserDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section className="pt-28 pb-12 bg-gradient-to-br from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Welcome Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-gray-600">
            Here's your study dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Current Streak */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🔥</div>
              {user.isPremium && (
                <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  Premium
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {user.currentStreak} days
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
            <div className="mt-3 text-xs text-gray-500">
              Longest: {user.longestStreak} days
            </div>
          </div>

          {/* Total Points */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="text-4xl mb-4">⭐</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {user.totalPoints}
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
            <div className="mt-3 text-xs text-purple-600 font-medium">
              Keep learning to earn more!
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="text-4xl mb-4">
              {user.isPremium ? '👑' : '📚'}
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1">
              {user.isPremium ? 'Premium Member' : 'Free Member'}
            </div>
            <div className="text-sm text-gray-600">Account Status</div>
            {user.isPremium && user.examType && (
              <div className="mt-3 text-xs text-gray-500">
                Exam: {user.examType.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/rankings"
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition group"
            >
              <div className="text-2xl">🏆</div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-purple-700">
                  View Rankings
                </div>
                <div className="text-xs text-gray-600">Check your rank</div>
              </div>
            </Link>

            {!user.isPremium && (
              <Link
                href="/neet-pg"
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 transition text-white group"
              >
                <div className="text-2xl">👑</div>
                <div>
                  <div className="font-semibold">Upgrade to Premium</div>
                  <div className="text-xs opacity-90">Get full access</div>
                </div>
              </Link>
            )}

            <Link
              href="#Community"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition group"
            >
              <div className="text-2xl">👥</div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                  Join Community
                </div>
                <div className="text-xs text-gray-600">Connect with peers</div>
              </div>
            </Link>

            <Link
              href="#meet"
              className="flex items-center gap-3 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition group"
            >
              <div className="text-2xl">📹</div>
              <div>
                <div className="font-semibold text-gray-900 group-hover:text-green-700">
                  Join Study Room
                </div>
                <div className="text-xs text-gray-600">24/7 available</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        {user.lastActiveDate && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Account Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {user.email || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {user.phone || 'Not provided'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Member since:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pro Tip */}
        <div className="mt-6 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Pro Tip!</h4>
              <p className="text-purple-100 text-sm">
                Login daily to maintain your streak and earn points. Check the rankings page to see how you compare with other students!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

