import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { withAuth, useLogout } from '@/utils/withAuth';
import { generateRankingsPDF } from '@/utils/pdfGenerator';

function AdminRankings() {
  const router = useRouter();
  const logout = useLogout();
  const [selectedDate, setSelectedDate] = useState('');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState<any>(null);
  const [availableDates, setAvailableDates] = useState<any[]>([]);

  // Fetch available dates
  useEffect(() => {
    fetchAvailableDates();
  }, []);

  const fetchAvailableDates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rankings/list?limit=30');
      const result = await response.json();
      if (result.success) {
        setAvailableDates(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch dates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async (date: string) => {
    if (!date) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/rankings/daily?date=${date}`);
      const result = await response.json();

      if (result.success) {
        setRankings(result.data.rankings);
        setStatistics(result.data.statistics);
      } else {
        setError(result.error || 'Failed to fetch rankings');
        setRankings([]);
        setStatistics(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rankings');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchRankings(date);
  };

  const handleDelete = async (date: string) => {
    if (!confirm(`Are you sure you want to delete rankings for ${date}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/rankings/delete?date=${date}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        alert('Rankings deleted successfully');
        setRankings([]);
        setStatistics(null);
        setSelectedDate('');
        fetchAvailableDates();
      } else {
        alert(result.error || 'Failed to delete');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleDownloadPDF = () => {
    if (!selectedDate || !rankings.length || !statistics) {
      alert('Please select a date with rankings first');
      return;
    }

    try {
      generateRankingsPDF({
        date: selectedDate,
        rankings,
        statistics,
      });
    } catch (err: any) {
      alert('Failed to generate PDF: ' + err.message);
    }
  };

  return (
    <Layout title="Admin - Rankings Dashboard">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Rankings Dashboard
              </h1>
              <p className="text-slate-600">
                View and manage daily Virtual Library rankings
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/rankings/upload')}
              className="mt-4 md:mt-0 bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
            >
              Upload New File →
            </button>
          </div>

          {/* Date Selector Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {selectedDate && rankings.length > 0 && (
                <>
                  <div className="flex items-end">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </button>
                  </div>
                <div className="flex items-end">
                  <button
                    onClick={() => handleDelete(selectedDate)}
                    className="w-full bg-red-100 text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                  >
                    Delete This Day's Data
                  </button>
                </div>
                </>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Total Participants</div>
                <div className="text-3xl font-bold text-purple-700">{statistics.totalParticipants}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Top Duration</div>
                <div className="text-3xl font-bold text-indigo-700">{formatDuration(statistics.topDuration)}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Average Duration</div>
                <div className="text-3xl font-bold text-blue-700">{formatDuration(statistics.averageDuration)}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Median Duration</div>
                <div className="text-3xl font-bold text-cyan-700">{formatDuration(statistics.medianDuration)}</div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="animate-spin h-12 w-12 mx-auto text-purple-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-4 text-gray-600">Loading rankings...</p>
            </div>
          )}

          {/* Rankings Table */}
          {!loading && rankings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Rankings for {selectedDate}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sessions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rankings.map((ranking: any, index: number) => (
                      <tr 
                        key={ranking.rank} 
                        className={`hover:bg-purple-50 transition-colors ${
                          index < 3 ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`text-lg font-bold ${
                              ranking.rank === 1 ? 'text-yellow-600' :
                              ranking.rank === 2 ? 'text-gray-500' :
                              ranking.rank === 3 ? 'text-orange-600' :
                              'text-gray-900'
                            }`}>
                              {ranking.rank === 1 ? '🥇' : ranking.rank === 2 ? '🥈' : ranking.rank === 3 ? '🥉' : `#${ranking.rank}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {ranking.fullName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {ranking.email || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-purple-700">
                          {ranking.totalDurationFormatted}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {ranking.sessionCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Uploads */}
          {availableDates.length > 0 && !selectedDate && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Uploads</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableDates.slice(0, 9).map((item: any) => (
                  <button
                    key={item.date}
                    onClick={() => handleDateChange(item.date)}
                    className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                  >
                    <div className="text-sm text-gray-600 mb-1">Date</div>
                    <div className="text-lg font-bold text-gray-900 mb-2">{item.date}</div>
                    <div className="text-sm text-gray-600">
                      {item.totalParticipants} participants
                    </div>
                    {item.topRanking && (
                      <div className="text-xs text-purple-700 mt-2">
                        🏆 {item.topRanking.fullName}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && selectedDate && rankings.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rankings found</h3>
              <p className="text-gray-600 mb-6">No data available for {selectedDate}</p>
              <button
                onClick={() => router.push('/admin/rankings/upload')}
                className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
              >
                Upload Data →
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(AdminRankings);
