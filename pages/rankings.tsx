import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

interface Ranking {
  rank: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email?: string;
  totalDuration: number;
  totalDurationFormatted: string;
  sessionCount: number;
}

interface RankingData {
  date: string;
  rankings: Ranking[];
  totalParticipants: number;
  computedAt: string;
  statistics?: any;
}

export default function PublicRankings() {
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // For initial page load
  const [rankingsLoading, setRankingsLoading] = useState(false); // For rankings section only
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(100); // Show 100 initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchAvailableDates();
  }, []);

  const fetchAvailableDates = async () => {
    setInitialLoading(true);
    try {
      const response = await fetch('/api/rankings/list?limit=30');
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        setAvailableDates(result.data);
        // Auto-select most recent date
        const mostRecent = result.data[0].date;
        setSelectedDate(mostRecent);
        await fetchRankings(mostRecent, true); // Pass true for initial load
      }
    } catch (err) {
      console.error('Failed to fetch dates:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRankings = async (date: string, isInitial: boolean = false) => {
    if (!date) return;

    if (!isInitial) {
      setRankingsLoading(true);
    }

    try {
      // Request reasonable amount of rankings initially
      const response = await fetch(`/api/rankings/daily?date=${date}&limit=500`);
      const result = await response.json();

      if (result.success) {
        setRankingData(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch rankings:', err);
    } finally {
      if (!isInitial) {
        setRankingsLoading(false);
      }
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchRankings(date);
    setSearchQuery('');
    setDisplayLimit(100); // Reset display limit when changing dates
  };

  const getDateLabel = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (date === today) return "Today's Ranking";
    if (date === yesterday) return "Yesterday's Ranking";
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDateButtonLabel = (date: string, index: number) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (date === today) return "Today";
    if (date === yesterday) return "Yesterday";
    return date;
  };

  const allFilteredRankings = rankingData?.rankings.filter(r => 
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Apply display limit only when not searching
  const filteredRankings = searchQuery 
    ? allFilteredRankings 
    : allFilteredRankings.slice(0, displayLimit);
  
  const hasMore = !searchQuery && allFilteredRankings.length > displayLimit;
  
  const loadMore = () => {
    setDisplayLimit(prev => prev + 100);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Layout title="Virtual Library Rankings" description="Daily study time rankings for Virtual Library members">
      {/* Hero Section */}
      <section className="relative w-full flex items-center justify-center overflow-hidden bg-[#6b21a8] pt-20 sm:pt-24 pb-6 sm:pb-8"
        style={{
          backgroundImage: "url('/img/banner-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#6b21a8]/95 via-[#6b21a8]/90 to-[#6b21a8]/80"></div>
        
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-white">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4">
            Daily Rankings
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-3xl mx-auto px-4 mb-6 sm:mb-8">
            Celebrating top performers dedicated to consistent study
          </p>
          
          <div className="flex items-center justify-center mt-4 sm:mt-6">
            <div className="bg-gradient-to-r from-white/20 via-white/15 to-white/20 backdrop-blur-md px-10 sm:px-14 py-6 sm:py-8 rounded-3xl border border-white/40 shadow-2xl">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                Want to join this club? 🚀
              </p>
              <p className="text-sm sm:text-base md:text-lg text-purple-100 text-center mt-3 font-medium">
                Study together, compete friendly, and rise to the top
              </p>
              <div className="flex justify-center mt-5 sm:mt-6">
                <a
                  href="/neet-pg"
                  className="bg-white hover:bg-gray-100 text-purple-700 font-bold text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Join Virtual Library
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Date Selector */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Select Date</h2>
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
              {availableDates.map((item, index) => {
                const isSelected = item.date === selectedDate;
                const label = getDateButtonLabel(item.date, index);
                
                return (
                  <button
                    key={item.date}
                    onClick={() => handleDateChange(item.date)}
                    className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all ${
                      isSelected
                        ? 'bg-purple-700 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                  >
                    <div className="text-xs sm:text-sm">{label}</div>
                    <div className="text-[10px] sm:text-xs opacity-75 mt-1">{item.totalParticipants} members</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Loading State - Full Page */}
          {initialLoading && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="animate-spin h-12 w-12 mx-auto text-purple-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-4 text-gray-600">Loading rankings...</p>
            </div>
          )}

          {/* Rankings Loading State - Only for date changes */}
          {rankingsLoading && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="animate-spin h-10 w-10 mx-auto text-purple-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="mt-3 text-gray-600 font-medium">Loading rankings...</p>
            </div>
          )}

          {/* Top 3 Podium */}
          {!initialLoading && !rankingsLoading && rankingData && rankingData.rankings.length >= 3 && !searchQuery && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-10 text-center">
                🏆 Top 3 Champions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-6 sm:mb-8 mt-6 sm:mt-8">
                {/* 2nd Place */}
                <div className="flex flex-col items-center justify-end order-2 md:order-1 mt-8 md:mt-0">
                  <div className="bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl w-full border-3 sm:border-4 border-slate-400">
                    <div className="text-4xl sm:text-6xl mb-2 sm:mb-3">🥈</div>
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">2nd Place</div>
                    <div className="font-bold text-base sm:text-xl text-gray-900 mb-2 sm:mb-3 min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-2">
                      {rankingData.rankings[1].fullName}
                    </div>
                    <div className="text-xl sm:text-3xl font-bold bg-white/50 rounded-xl py-2 text-purple-700">
                      {rankingData.rankings[1].totalDurationFormatted}
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center justify-end order-1 md:order-2">
                  <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center shadow-2xl w-full border-3 sm:border-4 border-yellow-600 transform md:scale-105">
                    <div className="text-5xl sm:text-7xl mb-2 sm:mb-3">🥇</div>
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-yellow-900 mb-2">1st Place</div>
                    <div className="font-bold text-lg sm:text-2xl text-gray-900 mb-3 sm:mb-4 min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-2">
                      {rankingData.rankings[0].fullName}
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold bg-white/50 rounded-xl py-2 sm:py-3 text-purple-800">
                      {rankingData.rankings[0].totalDurationFormatted}
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center justify-end order-3 mt-8 md:mt-0">
                  <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl w-full border-3 sm:border-4 border-orange-500">
                    <div className="text-4xl sm:text-6xl mb-2 sm:mb-3">🥉</div>
                    <div className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-orange-900 mb-2">3rd Place</div>
                    <div className="font-bold text-base sm:text-xl text-gray-900 mb-2 sm:mb-3 min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-2">
                      {rankingData.rankings[2].fullName}
                    </div>
                    <div className="text-xl sm:text-3xl font-bold bg-white/50 rounded-xl py-2 text-purple-700">
                      {rankingData.rankings[2].totalDurationFormatted}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          {!initialLoading && !rankingsLoading && filteredRankings.length > 0 && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                      {getDateLabel(selectedDate)}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {searchQuery ? (
                        `Showing ${filteredRankings.length} result${filteredRankings.length !== 1 ? 's' : ''}`
                      ) : (
                        hasMore 
                          ? `Showing ${filteredRankings.length} of ${allFilteredRankings.length} members`
                          : `Showing all ${filteredRankings.length} member${filteredRankings.length !== 1 ? 's' : ''}`
                      )}
                    </p>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 px-3 sm:px-4 py-2 rounded-lg border border-gray-200 flex-1 md:max-w-md">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-xs sm:text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-gray-400 hover:text-gray-600 text-[10px] sm:text-xs font-medium flex-shrink-0"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                
                {searchQuery && (
                  <p className="text-xs sm:text-sm text-purple-600 font-medium">
                    Found {filteredRankings.length} result{filteredRankings.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              {/* Mobile Card View (< 640px) */}
              <div className="block sm:hidden">
                {filteredRankings.map((ranking: Ranking) => (
                  <div 
                    key={ranking.rank}
                    className={`p-4 border-b border-gray-200 ${
                      ranking.rank <= 3 && !searchQuery ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`text-2xl font-bold flex-shrink-0 ${
                          ranking.rank === 1 ? 'text-yellow-600' :
                          ranking.rank === 2 ? 'text-gray-500' :
                          ranking.rank === 3 ? 'text-orange-600' :
                          'text-gray-900'
                        }`}>
                          {ranking.rank <= 3 && !searchQuery ? 
                            (ranking.rank === 1 ? '🥇' : ranking.rank === 2 ? '🥈' : '🥉') :
                            `#${ranking.rank}`
                          }
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base text-gray-900 truncate">
                            {ranking.fullName}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-purple-700">
                              {ranking.totalDurationFormatted}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View (>= 640px) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Study Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRankings.map((ranking: Ranking) => (
                      <tr 
                        key={ranking.rank} 
                        className={`hover:bg-purple-50 transition-colors ${
                          ranking.rank <= 3 && !searchQuery ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${
                              ranking.rank === 1 ? 'text-yellow-600' :
                              ranking.rank === 2 ? 'text-gray-500' :
                              ranking.rank === 3 ? 'text-orange-600' :
                              'text-gray-900'
                            }`}>
                              {ranking.rank <= 3 && !searchQuery ? 
                                (ranking.rank === 1 ? '🥇' : ranking.rank === 2 ? '🥈' : '🥉') :
                                `#${ranking.rank}`
                              }
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-base text-gray-900">{ranking.fullName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-lg font-semibold text-purple-700">
                              {ranking.totalDurationFormatted}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Load More Button */}
          {!initialLoading && !rankingsLoading && hasMore && !searchQuery && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? 'Loading...' : `Load More (${allFilteredRankings.length - displayLimit} remaining)`}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!initialLoading && !rankingsLoading && filteredRankings.length === 0 && rankingData && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? `No members found matching "${searchQuery}"` : 'No rankings available'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* No Data Available */}
          {!initialLoading && availableDates.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rankings yet</h3>
              <p className="text-gray-600">Rankings will appear here once data is uploaded.</p>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}

