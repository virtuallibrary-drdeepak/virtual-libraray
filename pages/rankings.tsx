import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MeetRanking {
  rank: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email?: string;
  totalDuration: number;
  totalDurationFormatted: string;
  sessionCount: number;
}

interface MeetRankingData {
  date: string;
  rankings: MeetRanking[];
  totalParticipants: number;
  computedAt: string;
}

interface ForestRankingEntry {
  rank: number;
  name: string;
  totalDuration: number;
  totalDurationFormatted: string;
}

interface ForestRankingData {
  date: string;
  rankings: ForestRankingEntry[];
  totalParticipants: number;
  uploadedAt: string;
}

type AppLeaderboardPeriod = 'daily' | 'weekly' | 'monthly';
type AppLeaderboardPeriodResponse = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface PublicRankingEntry {
  userId: string;
  scoreSeconds: number;
  rank: number;
  name: string | null;
  avatarUrl: string | null;
}

interface PublicRankingResponse {
  period: AppLeaderboardPeriodResponse;
  scope: 'ALL';
  date?: string;
  asOfDate?: string;
  startsOn?: string;
  endsOn?: string;
  totalCount: number;
  cursor: string | null;
  nextCursor: string | null;
  offset: number;
  limit: number;
  entries: PublicRankingEntry[];
  requestingUserRank: number | null;
  requestingUserEntry: PublicRankingEntry | null;
}

interface RankingTableRow {
  key: string;
  rank: number;
  name: string;
  time: string;
  avatarUrl?: string | null;
}

type Tab = 'app' | 'meet' | 'forest';
type RankingTheme = Tab;

class RankingRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const APP_RANKING_LIMIT = 20;
const EVENT_API_BASE = 'http://localhost:4001';

const APP_PERIODS: Array<{ value: AppLeaderboardPeriod; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function getLocalDateInputValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
}

function getDateLabel(date: string) {
  const today = getLocalDateInputValue();
  const yesterday = getLocalDateInputValue(new Date(Date.now() - 86400000));
  if (date === today) return "Today's Ranking";
  if (date === yesterday) return "Yesterday's Ranking";
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function getDateButtonLabel(date: string) {
  const today = getLocalDateInputValue();
  const yesterday = getLocalDateInputValue(new Date(Date.now() - 86400000));
  if (date === today) return 'Today';
  if (date === yesterday) return 'Yesterday';
  return date;
}

function getThemeTokens(theme: RankingTheme) {
  if (theme === 'forest') {
    return {
      accentBg: 'bg-green-700',
      accentHoverBg: 'hover:bg-green-800',
      accentText: 'text-green-700',
      accentStrongText: 'text-green-800',
      rowHover: 'hover:bg-green-50',
      theadBg: 'bg-green-50',
      clockColor: 'text-green-600',
      softBg: 'bg-green-50',
      softText: 'text-green-700',
      ring: 'ring-green-100',
      border: 'border-green-100',
    };
  }

  if (theme === 'app') {
    return {
      accentBg: 'bg-[#2563eb]',
      accentHoverBg: 'hover:bg-[#1d4ed8]',
      accentText: 'text-[#2563eb]',
      accentStrongText: 'text-[#1d4ed8]',
      rowHover: 'hover:bg-blue-50',
      theadBg: 'bg-blue-50',
      clockColor: 'text-cyan-600',
      softBg: 'bg-blue-50',
      softText: 'text-[#1d4ed8]',
      ring: 'ring-blue-100',
      border: 'border-blue-100',
    };
  }

  return {
    accentBg: 'bg-purple-700',
    accentHoverBg: 'hover:bg-purple-800',
    accentText: 'text-purple-700',
    accentStrongText: 'text-purple-800',
    rowHover: 'hover:bg-purple-50',
    theadBg: 'bg-purple-50',
    clockColor: 'text-purple-600',
    softBg: 'bg-purple-50',
    softText: 'text-purple-700',
    ring: 'ring-purple-100',
    border: 'border-purple-100',
  };
}

function formatFocusTime(scoreSeconds: number) {
  const totalMinutes = Math.floor(Math.max(0, scoreSeconds) / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
  if (hours > 0) return `${hours} hr`;
  return `${minutes} min`;
}

function formatShortDate(date?: string) {
  if (!date) return '';

  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'VL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getAppLeaderboardTitle(data: PublicRankingResponse | null, period: AppLeaderboardPeriod, selectedDate: string) {
  if (period === 'daily') {
    const dailyLabel = getDateLabel(data?.date || selectedDate || getLocalDateInputValue());
    return dailyLabel.includes('Ranking') ? dailyLabel.replace('Ranking', 'App Ranking') : `${dailyLabel} App Ranking`;
  }

  const periodLabel = period === 'weekly' ? 'Weekly' : 'Monthly';
  if (data?.startsOn && data.endsOn) {
    return `${periodLabel} App Ranking`;
  }

  return selectedDate ? `${periodLabel} App Ranking` : `Current ${periodLabel} App Ranking`;
}

function getAppLeaderboardSummary(data: PublicRankingResponse | null, loadedCount: number, searchQuery: string) {
  if (!data) return 'Loading public app rankings';

  const range = data.startsOn && data.endsOn
    ? `${formatShortDate(data.startsOn)} - ${formatShortDate(data.endsOn)}`
    : data.date
      ? formatShortDate(data.date)
      : data.asOfDate
        ? `As of ${formatShortDate(data.asOfDate)}`
        : '';
  const countLabel = searchQuery
    ? `${loadedCount} matching user${loadedCount !== 1 ? 's' : ''}`
    : `${loadedCount} of ${data.totalCount} user${data.totalCount !== 1 ? 's' : ''}`;

  return range ? `${range} · ${countLabel}` : countLabel;
}

async function fetchPublicRankings(params: {
  period: AppLeaderboardPeriod;
  date?: string;
  cursor?: string | null;
  limit?: number;
  q?: string;
}) {
  const query = new URLSearchParams();

  if (params.date) {
    query.set('date', params.date);
  }
  if (params.cursor) query.set('cursor', params.cursor);
  query.set('limit', String(params.limit ?? APP_RANKING_LIMIT));
  if (params.q?.trim()) query.set('q', params.q.trim());

  const response = await fetch(
    `${EVENT_API_BASE}/public/leaderboard/${params.period}?${query.toString()}`,
    {
      method: 'GET',
      credentials: 'omit',
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new RankingRequestError(data?.message || 'Failed to fetch rankings', response.status);
  }

  return data as PublicRankingResponse;
}

function getAppErrorMessage(error: RankingRequestError, period: AppLeaderboardPeriod) {
  if (error.status === 400 && /invalid date format/i.test(error.message)) {
    return 'The selected date was invalid. The picker has been reset.';
  }

  if (error.status === 400 && /future/i.test(error.message)) {
    return 'Future dates are not available for rankings.';
  }

  if (error.status === 404 && period === 'weekly') {
    return 'Weekly rankings are being prepared.';
  }

  if (error.status === 404 && period === 'monthly') {
    return 'Monthly rankings are being prepared.';
  }

  if (error.status === 404) {
    return 'No app rankings are available for this date.';
  }

  if (error.status >= 500) {
    return 'Unable to load app rankings right now.';
  }

  return error.message || 'Failed to fetch rankings.';
}

function mapMeetRows(rankings: MeetRanking[]): RankingTableRow[] {
  return rankings.map((ranking) => ({
    key: `${ranking.rank}-${ranking.fullName}`,
    rank: ranking.rank,
    name: ranking.fullName,
    time: ranking.totalDurationFormatted,
  }));
}

function mapForestRows(rankings: ForestRankingEntry[]): RankingTableRow[] {
  return rankings.map((ranking) => ({
    key: `${ranking.rank}-${ranking.name}`,
    rank: ranking.rank,
    name: ranking.name,
    time: ranking.totalDurationFormatted,
  }));
}

function mapAppRows(entries: PublicRankingEntry[]): RankingTableRow[] {
  return entries.map((entry, index) => {
    const name = entry.name?.trim() || 'Virtual Library User';

    return {
      key: entry.userId || `${entry.rank}-${index}`,
      rank: entry.rank,
      name,
      time: formatFocusTime(entry.scoreSeconds),
      avatarUrl: entry.avatarUrl,
    };
  });
}

// ─── Podium ──────────────────────────────────────────────────────────────────

function Podium({
  first,
  second,
  third,
  theme,
}: {
  first: { name: string; time: string };
  second: { name: string; time: string };
  third: { name: string; time: string };
  theme: RankingTheme;
}) {
  const tokens = getThemeTokens(theme);

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-10 text-center">
        🏆 Top 3 Champions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-6 sm:mb-8 mt-6 sm:mt-8">
        {/* 2nd Place */}
        <div className="flex flex-col items-center justify-end order-2 md:order-1 mt-8 md:mt-0">
          <div className="bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl w-full border-4 border-slate-400">
            <div className="text-4xl sm:text-6xl mb-2 sm:mb-3">🥈</div>
            <div className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">2nd Place</div>
            <div className="font-bold text-base sm:text-xl text-gray-900 mb-2 sm:mb-3 min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-2">
              {second.name}
            </div>
            <div className={`text-xl sm:text-3xl font-bold bg-white/50 rounded-xl py-2 ${tokens.accentText}`}>
              {second.time}
            </div>
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center justify-end order-1 md:order-2">
          <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center shadow-2xl w-full border-4 border-yellow-600 transform md:scale-105">
            <div className="text-5xl sm:text-7xl mb-2 sm:mb-3">🥇</div>
            <div className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-yellow-900 mb-2">1st Place</div>
            <div className="font-bold text-lg sm:text-2xl text-gray-900 mb-3 sm:mb-4 min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-2">
              {first.name}
            </div>
            <div className={`text-2xl sm:text-4xl font-bold bg-white/50 rounded-xl py-2 sm:py-3 ${tokens.accentStrongText}`}>
              {first.time}
            </div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center justify-end order-3 mt-8 md:mt-0">
          <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-2xl w-full border-4 border-orange-500">
            <div className="text-4xl sm:text-6xl mb-2 sm:mb-3">🥉</div>
            <div className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-orange-900 mb-2">3rd Place</div>
            <div className="font-bold text-base sm:text-xl text-gray-900 mb-2 sm:mb-3 min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center px-2">
              {third.name}
            </div>
            <div className={`text-xl sm:text-3xl font-bold bg-white/50 rounded-xl py-2 ${tokens.accentText}`}>
              {third.time}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ label = 'Loading rankings...' }: { label?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
      <svg className="animate-spin h-12 w-12 mx-auto text-purple-700" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="mt-4 text-gray-600">{label}</p>
    </div>
  );
}

// ─── App Rankings Panel ──────────────────────────────────────────────────────

function AppRankingsPanel() {
  const [period, setPeriod] = useState<AppLeaderboardPeriod>('daily');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [rankingData, setRankingData] = useState<PublicRankingResponse | null>(null);
  const [entries, setEntries] = useState<PublicRankingEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<RankingRequestError | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    let isCurrent = true;

    async function loadFirstPage() {
      setLoading(true);
      setError(null);
      setEntries([]);
      setNextCursor(null);

      try {
        const data = await fetchPublicRankings({
          period,
          date: selectedDate || undefined,
          limit: APP_RANKING_LIMIT,
          q: debouncedSearch,
        });

        if (!isCurrent) return;

        setRankingData(data);
        setEntries(data.entries || []);
        setNextCursor(data.nextCursor);
      } catch (err) {
        if (!isCurrent) return;

        const requestError = err instanceof RankingRequestError
          ? err
          : new RankingRequestError('Failed to fetch rankings', 500);

        if (requestError.status === 400 && /invalid date format/i.test(requestError.message) && selectedDate) {
          setSelectedDate('');
        }

        setRankingData(null);
        setError(requestError);
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadFirstPage();

    return () => {
      isCurrent = false;
    };
  }, [period, selectedDate, debouncedSearch, refreshKey]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const data = await fetchPublicRankings({
        period,
        date: selectedDate || undefined,
        cursor: nextCursor,
        limit: APP_RANKING_LIMIT,
        q: debouncedSearch,
      });

      setRankingData(data);
      setEntries((current) => [...current, ...(data.entries || [])]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      const requestError = err instanceof RankingRequestError
        ? err
        : new RankingRequestError('Failed to fetch rankings', 500);
      setError(requestError);
    } finally {
      setLoadingMore(false);
    }
  };

  const rows = mapAppRows(entries);
  const isSearching = Boolean(searchQuery.trim() || debouncedSearch);
  const title = getAppLeaderboardTitle(rankingData, period, selectedDate);
  const summary = error && rows.length === 0
    ? getAppErrorMessage(error, period)
    : getAppLeaderboardSummary(rankingData, rows.length, debouncedSearch);
  const showRetry = error && error.status >= 500;
  const maxDate = getLocalDateInputValue();

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-blue-100 bg-white p-4 shadow-md sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-[#2563eb]">App Rankings</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{summary}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-[auto_220px_minmax(220px,320px)] md:items-end">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Period</label>
              <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1 md:w-auto">
                {APP_PERIODS.map((item) => {
                  const isSelected = item.value === period;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPeriod(item.value)}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition md:flex-none ${isSelected
                        ? 'bg-[#2563eb] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-white hover:text-[#1d4ed8]'
                        }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="app-ranking-date" className="mb-2 block text-sm font-semibold text-slate-700">
                {period === 'daily' ? 'Date' : 'As of'}
              </label>
              <div className="flex gap-2">
                <input
                  id="app-ranking-date"
                  type="date"
                  value={selectedDate}
                  max={maxDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
                />
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate('')}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:text-[#1d4ed8]"
                  >
                    Today
                  </button>
                )}
              </div>
            </div>

            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              theme="app"
            />
          </div>
        </div>
      </div>

      {loading && <Spinner label="Loading app rankings..." />}

      {!loading && error && rows.length === 0 && (
        <RankingErrorState
          message={getAppErrorMessage(error, period)}
          showRetry={Boolean(showRetry)}
          onRetry={() => setRefreshKey((current) => current + 1)}
        />
      )}

      {!loading && rows.length >= 3 && !isSearching && (
        <Podium
          theme="app"
          first={{ name: rows[0].name, time: rows[0].time }}
          second={{ name: rows[1].name, time: rows[1].time }}
          third={{ name: rows[2].name, time: rows[2].time }}
        />
      )}

      {!loading && rows.length > 0 && (
        <RankingsTable
          title={title}
          summary={summary}
          rows={rows}
          allCount={rankingData?.totalCount || rows.length}
          searchQuery={debouncedSearch}
          hasMore={Boolean(nextCursor)}
          onLoadMore={handleLoadMore}
          theme="app"
          showSearch={false}
          showAvatar
          loadingMore={loadingMore}
        />
      )}

      {!loading && error && rows.length > 0 && (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-white p-4 text-sm text-slate-700 shadow-md">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getAppErrorMessage(error, period)}</span>
            {showRetry && (
              <button
                type="button"
                onClick={handleLoadMore}
                className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && rows.length === 0 && rankingData && (
        isSearching ? (
          <EmptySearch query={searchQuery || debouncedSearch} onClear={() => setSearchQuery('')} />
        ) : (
          <NoData message="App rankings will appear here once members start logging focus time." />
        )
      )}
    </div>
  );
}

// ─── Google Meet Rankings Panel ───────────────────────────────────────────────

function MeetRankingsPanel() {
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [rankingData, setRankingData] = useState<MeetRankingData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(100);

  useEffect(() => {
    fetchDates();
  }, []);

  const fetchDates = async () => {
    setInitialLoading(true);
    try {
      const res = await fetch('/api/rankings/list?limit=30');
      const result = await res.json();
      if (result.success && result.data.length > 0) {
        setAvailableDates(result.data);
        const most = result.data[0].date;
        setSelectedDate(most);
        await fetchRankings(most, true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRankings = async (date: string, isInitial = false) => {
    if (!date) return;
    if (!isInitial) setRankingsLoading(true);
    try {
      const res = await fetch(`/api/rankings/daily?date=${date}&limit=500`);
      const result = await res.json();
      if (result.success) setRankingData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isInitial) setRankingsLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchRankings(date);
    setSearchQuery('');
    setDisplayLimit(100);
  };

  const allFiltered = rankingData?.rankings.filter(r =>
    (r.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (r.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ) || [];

  const filtered = searchQuery ? allFiltered : allFiltered.slice(0, displayLimit);
  const hasMore = !searchQuery && allFiltered.length > displayLimit;

  if (initialLoading) return <Spinner />;

  return (
    <div>
      {/* Date Selector */}
      {availableDates.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Select Date</h2>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {availableDates.map((item) => {
              const isSelected = item.date === selectedDate;
              return (
                <button
                  key={item.date}
                  onClick={() => handleDateChange(item.date)}
                  className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all ${isSelected
                    ? 'bg-purple-700 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                    }`}
                >
                  <div className="text-xs sm:text-sm">{getDateButtonLabel(item.date)}</div>
                  <div className="text-[10px] sm:text-xs opacity-75 mt-1">{item.totalParticipants} members</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {rankingsLoading && <Spinner label="Loading rankings..." />}

      {/* Podium */}
      {!rankingsLoading && rankingData && rankingData.rankings.length >= 3 && !searchQuery && (
        <Podium
          theme="meet"
          first={{ name: rankingData.rankings[0].fullName, time: rankingData.rankings[0].totalDurationFormatted }}
          second={{ name: rankingData.rankings[1].fullName, time: rankingData.rankings[1].totalDurationFormatted }}
          third={{ name: rankingData.rankings[2].fullName, time: rankingData.rankings[2].totalDurationFormatted }}
        />
      )}

      {/* Table */}
      {!rankingsLoading && filtered.length > 0 && (
        <RankingsTable
          title={getDateLabel(selectedDate)}
          rows={mapMeetRows(filtered)}
          allCount={allFiltered.length}
          searchQuery={searchQuery}
          hasMore={hasMore}
          onSearch={setSearchQuery}
          onLoadMore={() => setDisplayLimit(p => p + 100)}
          theme="meet"
        />
      )}

      {/* No data */}
      {!rankingsLoading && availableDates.length === 0 && (
        <NoData message="Rankings will appear here once data is uploaded." />
      )}

      {!rankingsLoading && filtered.length === 0 && rankingData && (
        <EmptySearch query={searchQuery} onClear={() => setSearchQuery('')} />
      )}
    </div>
  );
}

// ─── Forest Rankings Panel ────────────────────────────────────────────────────

function ForestRankingsPanel() {
  const [availableDates, setAvailableDates] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [rankingData, setRankingData] = useState<ForestRankingData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(100);

  useEffect(() => {
    fetchDates();
  }, []);

  const fetchDates = async () => {
    setInitialLoading(true);
    try {
      const res = await fetch('/api/forest-rankings/list?limit=30');
      const result = await res.json();
      if (result.success && result.data.length > 0) {
        setAvailableDates(result.data);
        const most = result.data[0].date;
        setSelectedDate(most);
        await fetchRankings(most, true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchRankings = async (date: string, isInitial = false) => {
    if (!date) return;
    if (!isInitial) setRankingsLoading(true);
    try {
      const res = await fetch(`/api/forest-rankings/daily?date=${date}`);
      const result = await res.json();
      if (result.success) setRankingData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isInitial) setRankingsLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchRankings(date);
    setSearchQuery('');
    setDisplayLimit(100);
  };

  const allFiltered = rankingData?.rankings.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filtered = searchQuery ? allFiltered : allFiltered.slice(0, displayLimit);
  const hasMore = !searchQuery && allFiltered.length > displayLimit;

  if (initialLoading) return <Spinner />;

  return (
    <div>
      {/* Date Selector */}
      {availableDates.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Select Date</h2>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {availableDates.map((item) => {
              const isSelected = item.date === selectedDate;
              return (
                <button
                  key={item.date}
                  onClick={() => handleDateChange(item.date)}
                  className={`flex-shrink-0 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all ${isSelected
                    ? 'bg-green-700 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-green-50 hover:text-green-700'
                    }`}
                >
                  <div className="text-xs sm:text-sm">{getDateButtonLabel(item.date)}</div>
                  <div className="text-[10px] sm:text-xs opacity-75 mt-1">{item.totalParticipants} members</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {rankingsLoading && <Spinner label="Loading rankings..." />}

      {/* Podium */}
      {!rankingsLoading && rankingData && rankingData.rankings.length >= 3 && !searchQuery && (
        <Podium
          theme="forest"
          first={{ name: rankingData.rankings[0].name, time: rankingData.rankings[0].totalDurationFormatted }}
          second={{ name: rankingData.rankings[1].name, time: rankingData.rankings[1].totalDurationFormatted }}
          third={{ name: rankingData.rankings[2].name, time: rankingData.rankings[2].totalDurationFormatted }}
        />
      )}

      {/* Table */}
      {!rankingsLoading && filtered.length > 0 && (
        <RankingsTable
          title={getDateLabel(selectedDate)}
          rows={mapForestRows(filtered)}
          allCount={allFiltered.length}
          searchQuery={searchQuery}
          hasMore={hasMore}
          onSearch={setSearchQuery}
          onLoadMore={() => setDisplayLimit(p => p + 100)}
          theme="forest"
        />
      )}

      {/* No data */}
      {!rankingsLoading && availableDates.length === 0 && (
        <NoData message="Forest rankings will appear here once data is uploaded by admin." />
      )}

      {!rankingsLoading && filtered.length === 0 && rankingData && (
        <EmptySearch query={searchQuery} onClear={() => setSearchQuery('')} />
      )}
    </div>
  );
}

// ─── Shared Table Component ───────────────────────────────────────────────────

function RankingsTable({
  title,
  summary,
  rows,
  allCount,
  searchQuery,
  hasMore,
  onSearch,
  onLoadMore,
  theme,
  showSearch = true,
  showAvatar = false,
  loadingMore = false,
}: {
  title: string;
  summary?: string;
  rows: RankingTableRow[];
  allCount: number;
  searchQuery: string;
  hasMore: boolean;
  onSearch?: (q: string) => void;
  onLoadMore: () => void;
  theme: RankingTheme;
  showSearch?: boolean;
  showAvatar?: boolean;
  loadingMore?: boolean;
}) {
  const tokens = getThemeTokens(theme);
  const remainingCount = Math.max(allCount - rows.length, 0);
  const computedSummary = summary || (
    searchQuery
      ? `Showing ${rows.length} result${rows.length !== 1 ? 's' : ''}`
      : hasMore
        ? `Showing ${rows.length} of ${allCount} members`
        : `Showing all ${rows.length} member${rows.length !== 1 ? 's' : ''}`
  );

  return (
    <>
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {computedSummary}
              </p>
            </div>

            {showSearch && onSearch && (
              <SearchBox
                value={searchQuery}
                onChange={onSearch}
                onClear={() => onSearch('')}
                theme={theme}
                className="md:max-w-md"
              />
            )}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {rows.map((row) => (
            <div key={row.key} className={`p-4 border-b border-gray-200 ${row.rank <= 3 && !searchQuery ? 'bg-yellow-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`text-2xl font-bold flex-shrink-0 ${row.rank === 1 ? 'text-yellow-600' : row.rank === 2 ? 'text-gray-500' : row.rank === 3 ? 'text-orange-600' : 'text-gray-900'}`}>
                    {row.rank <= 3 && !searchQuery ? (row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : '🥉') : `#${row.rank}`}
                  </span>
                  {showAvatar && <RankingAvatar name={row.name} avatarUrl={row.avatarUrl} theme={theme} />}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-gray-900 truncate">{row.name}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className={`w-4 h-4 ${tokens.clockColor} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`text-sm font-semibold ${tokens.accentText}`}>{row.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className={tokens.theadBg}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Study Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row) => (
                <tr key={row.key} className={`${tokens.rowHover} transition-colors ${row.rank <= 3 && !searchQuery ? 'bg-yellow-50' : ''}`}>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-bold ${row.rank === 1 ? 'text-yellow-600' : row.rank === 2 ? 'text-gray-500' : row.rank === 3 ? 'text-orange-600' : 'text-gray-900'}`}>
                      {row.rank <= 3 && !searchQuery ? (row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : '🥉') : `#${row.rank}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {showAvatar && <RankingAvatar name={row.name} avatarUrl={row.avatarUrl} theme={theme} />}
                      <div className="font-medium text-base text-gray-900">{row.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${tokens.clockColor} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`text-lg font-semibold ${tokens.accentText}`}>{row.time}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className={`${tokens.accentBg} ${tokens.accentHoverBg} text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none`}
          >
            {loadingMore ? 'Loading...' : `Load More${remainingCount > 0 ? ` (${remainingCount} remaining)` : ''}`}
          </button>
        </div>
      )}
    </>
  );
}

// ─── Empty / No-data helpers ──────────────────────────────────────────────────

function SearchBox({
  value,
  onChange,
  onClear,
  theme,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  theme: RankingTheme;
  className?: string;
}) {
  const tokens = getThemeTokens(theme);

  return (
    <div className={`flex h-11 items-center gap-2 rounded-xl border ${tokens.border} bg-gray-50 px-3 transition focus-within:bg-white focus-within:ring-2 ${tokens.ring} ${className}`}>
      <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Search by name..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent px-0 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-slate-400 transition hover:text-slate-700"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function RankingAvatar({
  name,
  avatarUrl,
  theme,
}: {
  name: string;
  avatarUrl?: string | null;
  theme: RankingTheme;
}) {
  const tokens = getThemeTokens(theme);

  return (
    <div className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ${tokens.softBg}`}>
      <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${tokens.softText}`}>
        {getInitials(name)}
      </div>
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      )}
    </div>
  );
}

function RankingErrorState({
  message,
  showRetry,
  onRetry,
}: {
  message: string;
  showRetry: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-lg">
      <svg className="mx-auto mb-4 h-12 w-12 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <h3 className="text-xl font-semibold text-slate-950">Rankings unavailable</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">{message}</p>
      {showRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1d4ed8]"
        >
          Retry
        </button>
      )}
    </div>
  );
}

function NoData({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No rankings yet</h3>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
      <p className="text-gray-600 mb-6">{query ? `No members found matching "${query}"` : 'No rankings available'}</p>
      {query && (
        <button onClick={onClear} className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors">
          Clear Search
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicRankings() {
  const [activeTab, setActiveTab] = useState<Tab>('app');

  return (
    <Layout title="Virtual Library Rankings" description="Daily study time rankings for Virtual Library members">
      {/* Hero */}
      <section
        className="relative w-full flex items-center justify-center overflow-hidden bg-[#6b21a8] pt-20 sm:pt-24 pb-6 sm:pb-8"
        style={{ backgroundImage: "url('/img/banner-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#6b21a8]/95 via-[#6b21a8]/90 to-[#6b21a8]/80" />
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-white">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4">Virtual Library Rankings</h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-3xl mx-auto px-4 mb-6 sm:mb-8">
            App, Google Meet, and Forest leaderboards for consistent study time
          </p>
          <div className="flex items-center justify-center mt-4 sm:mt-6">
            <div className="bg-gradient-to-r from-white/20 via-white/15 to-white/20 backdrop-blur-md px-10 sm:px-14 py-6 sm:py-8 rounded-3xl border border-white/40 shadow-2xl">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">Want to join this club? 🚀</p>
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

          {/* Tab Switcher */}
          <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 bg-white rounded-2xl p-2 shadow-md w-full sm:w-auto sm:inline-flex">
            <button
              onClick={() => setActiveTab('app')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base ${activeTab === 'app'
                ? 'bg-[#2563eb] text-white shadow-lg'
                : 'text-gray-600 hover:bg-blue-50 hover:text-[#1d4ed8]'
                }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M9 2h6a2 2 0 012 2v16a2 2 0 01-2 2H9a2 2 0 01-2-2V4a2 2 0 012-2z" strokeWidth="2" />
                <path d="M11 18h2" strokeLinecap="round" strokeWidth="2" />
              </svg>
              <span>App</span>
            </button>

            <button
              onClick={() => setActiveTab('meet')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base ${activeTab === 'meet'
                ? 'bg-purple-700 text-white shadow-lg'
                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
                }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
              </svg>
              <span>Google Meet</span>
            </button>

            <button
              onClick={() => setActiveTab('forest')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base ${activeTab === 'forest'
                ? 'bg-green-700 text-white shadow-lg'
                : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                }`}
            >
              <span className="text-base sm:text-lg">🌲</span>
              <span>Forest</span>
            </button>
          </div>

          {/* Panel */}
          {activeTab === 'app' && <AppRankingsPanel />}
          {activeTab === 'meet' && <MeetRankingsPanel />}
          {activeTab === 'forest' && <ForestRankingsPanel />}

        </div>
      </div>
    </Layout>
  );
}
