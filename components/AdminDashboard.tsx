/**
 * Admin Dashboard Component
 * Shows admin-specific content and controls
 */

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PaymentDTO, PaymentStats, RevenueData } from '@/types';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    successful: 0,
    abandoned: 0,
    totalRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [chartRange, setChartRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState('last7days');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [currentPage, dateRange, itemsPerPage, statusFilter, searchQuery]);

  useEffect(() => {
    fetchRevenueData();
  }, [chartRange]);

  const fetchRevenueData = async () => {
    setRevenueLoading(true);
    try {
      const response = await fetch(`/api/admin/revenue-chart?range=${chartRange}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        setRevenueData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setRevenueLoading(false);
    }
  };

  const getDateFilter = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'last90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        return '';
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    return `&startDate=${startDate.toISOString()}`;
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const dateFilter = getDateFilter();
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      
      const response = await fetch(
        `/api/admin/payments?page=${currentPage}&limit=${itemsPerPage}${dateFilter}${statusParam}${searchParam}`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const result = await response.json();
        setPayments(result.data.payments || []);
        setStats(result.data.stats || stats);
        setTotalPages(result.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openWhatsApp = (phone: string, name: string) => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // If phone doesn't start with country code, add India code (91)
    const phoneWithCountryCode = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    
    // Create WhatsApp URL with pre-filled message
    const message = encodeURIComponent(`Hi ${name}, thank you for your payment at Virtual Library!`);
    const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${message}`;
    
    // Open in new tab
    window.open(whatsappUrl, '_blank');
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <section className="pt-28 pb-12 bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Welcome Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span>🛡️</span>
            <span>Admin Dashboard</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-gray-600">
            Manage your Virtual Library platform
          </p>
        </div>

        {/* Main Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* View Rankings */}
          <Link
            href="/admin/rankings"
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-indigo-200 transition group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
            <div className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
              View Rankings
            </div>
            <div className="text-sm text-gray-600">
              See all daily rankings and user analytics
            </div>
          </Link>

          {/* Upload Rankings */}
          <Link
            href="/admin/rankings/upload"
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-purple-200 transition group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📤</div>
            <div className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition">
              Upload Rankings
            </div>
            <div className="text-sm text-gray-600">
              Upload PDF or Excel files with new rankings
            </div>
          </Link>

          {/* Public View */}
          <Link
            href="/rankings"
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-blue-200 transition group"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🌐</div>
            <div className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
              Public View
            </div>
            <div className="text-sm text-gray-600">
              See rankings page as users see it
            </div>
          </Link>

          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-4xl mb-4">⚙️</div>
            <div className="text-xl font-bold text-gray-900 mb-2">
              System Status
            </div>
            <div className="text-sm text-green-600 font-medium">
              ✓ All systems operational
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-10 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-600">TOTAL EARNINGS</h3>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {revenueLoading ? (
                <div className="h-12 w-48 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ₹{((revenueData?.totalRevenue || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  {revenueData && (
                    <div className="flex items-center gap-2 text-sm">
                      {revenueData.growthPercentage === null ? (
                        <span className="text-blue-600 font-medium">
                          🆕 New Period
                        </span>
                      ) : (
                        <>
                          <span className={`flex items-center gap-1 font-medium ${
                            revenueData.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {revenueData.growthPercentage >= 0 ? '↗' : '↘'}
                            {Math.abs(revenueData.growthPercentage)}%
                            {Math.abs(revenueData.growthPercentage) >= 999 && '+'}
                          </span>
                          <span className="text-gray-500">v/s Previous Period</span>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="mt-4 md:mt-0">
              <select
                value={chartRange}
                onChange={(e) => setChartRange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            {revenueLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : revenueData && revenueData.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      if (chartRange === '1year' || chartRange === 'lifetime') {
                        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                      }
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 100).toLocaleString('en-IN', { notation: 'compact' })}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`₹${(value / 100).toLocaleString('en-IN')}`, 'Revenue']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString('en-IN', { 
                        day: 'numeric',
                        month: 'short', 
                        year: 'numeric' 
                      });
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No revenue data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium text-green-100 mb-1">Total Revenue</div>
            <div className="text-3xl font-bold">{formatAmount(stats.totalRevenue)}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">Total Payments</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">Successful</div>
            <div className="text-3xl font-bold text-green-600">{stats.successful}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">Abandoned</div>
            <div className="text-3xl font-bold text-orange-600">{stats.abandoned}</div>
          </div>
        </div>

        {/* Payment Management */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
          {/* Header with Quick Filters */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Payment Transactions</h3>
              <p className="text-sm text-gray-600">
                {stats.total} transactions
              </p>
            </div>

            {/* Quick Status Filters */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-600">Quick filters:</span>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => {
                  setStatusFilter('success');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'success'
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✓ Successful ({stats.successful})
              </button>
              <button
                onClick={() => {
                  setStatusFilter('abandoned');
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === 'abandoned'
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⚠ Abandoned ({stats.abandoned})
              </button>
            </div>

            {/* Search and Advanced Filters Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or payment ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              
              {/* Date Range and Other Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Range Filter */}
                <div className="relative">
                  <select
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last7days">Last 7 days</option>
                    <option value="last30days">Last 30 days</option>
                    <option value="last90days">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>

                {/* Items per page */}
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>

                {/* Clear Filters */}
                {(searchQuery || statusFilter !== 'all' || dateRange !== 'last7days') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setDateRange('last7days');
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                  >
                    ✕ Clear Filters
                  </button>
                )}

                {/* Refresh Button */}
                <button
                  onClick={fetchPayments}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">💳</div>
              No payments yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {payment.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.name}
                            </div>
                            {payment.user && (
                              <div className="text-xs text-green-600">
                                ✓ Linked Account
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{payment.email}</div>
                        <div className="text-xs text-gray-500">{payment.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatAmount(payment.amount)}
                        </div>
                        {payment.couponCode && (
                          <div className="text-xs text-purple-600">
                            {payment.couponCode} ({payment.discountPercentage}% off)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.paidAt || payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.phone ? (
                          <button
                            onClick={() => openWhatsApp(payment.phone, payment.name)}
                            className="inline-flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                            title={`Message ${payment.name} on WhatsApp`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">No phone</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && payments.length > 0 && (
            <div className="p-6 border-t border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* First Page */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    ⏮️ First
                  </button>
                  
                  {/* Previous */}
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    ← Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Next →
                  </button>
                  
                  {/* Last Page */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    ⏭️ Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Info Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🛡️</div>
              <div>
                <h3 className="text-xl font-bold mb-1">Administrator Account</h3>
                <p className="text-indigo-100 text-sm">
                  {user.email || 'No email provided'} • Full Access
                </p>
              </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-xs text-indigo-200 mb-1">Status</div>
              <div className="text-sm font-semibold">Active & Verified ✓</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

