/**
 * Ranking Service
 * Business logic for calculating and managing rankings
 */

import {
  ParsedAttendanceEntry,
  AggregatedAttendee,
  AttendeeIdentifier,
  RankingOptions,
  DurationFormat,
} from '@/types/ranking.types';
import { IRankingEntry } from '@/models/DailyRanking';
import { RANKING } from '@/config/constants';

export class RankingService {
  /**
   * Format name to Title Case (capitalize first letter of each word)
   */
  static formatNameToTitleCase(name: string): string {
    if (!name) return name;
    
    return name
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  /**
   * Google Meet attendance exports often mask emails (e.g. shru**********@***.com).
   * Masked values are not unique identities and can merge different people.
   */
  static isMaskedEmail(email?: string): boolean {
    if (!email) return false;
    return email.includes('*');
  }

  /**
   * Normalize name parts so "Shruti Poddar" and firstName=Shruti/lastName=Poddar
   * resolve to the same identity key.
   */
  static getNormalizedNameParts(
    firstName: string,
    lastName: string = ''
  ): { firstName: string; lastName: string; fullNameKey: string } {
    const parts = `${firstName || ''} ${lastName || ''}`
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return { firstName: '', lastName: '', fullNameKey: '' };
    }

    if (parts.length === 1) {
      return {
        firstName: parts[0],
        lastName: '',
        fullNameKey: parts[0].toLowerCase(),
      };
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
      fullNameKey: parts.map(part => part.toLowerCase()).join('_'),
    };
  }

  /**
   * Prefer a usable email when merging sessions. Masked emails are kept only
   * as a fallback display value.
   */
  private static pickPreferredEmail(
    current?: string,
    incoming?: string
  ): string | undefined {
    const currentUsable =
      current && !this.isMaskedEmail(current) ? current : undefined;
    const incomingUsable =
      incoming && !this.isMaskedEmail(incoming) ? incoming : undefined;

    return incomingUsable || currentUsable || incoming || current;
  }

  /**
   * Aggregate attendance entries by attendee
   * Combines multiple sessions for the same person
   */
  static aggregateAttendees(
    entries: ParsedAttendanceEntry[],
    excludeNames: string[] = [...RANKING.EXCLUDED_NAMES]
  ): AggregatedAttendee[] {
    const attendeeMap = new Map<string, AggregatedAttendee>();

    for (const entry of entries) {
      const fullName = `${entry.firstName} ${entry.lastName}`.trim();

      // Skip excluded names
      if (excludeNames.some(excluded => 
        fullName.toLowerCase().includes(excluded.toLowerCase())
      )) {
        continue;
      }

      // Create unique key for attendee
      // Priority: unmasked email > normalized full name
      const key = this.createAttendeeKey(entry);
      const normalizedName = this.getNormalizedNameParts(
        entry.firstName,
        entry.lastName
      );

      if (attendeeMap.has(key)) {
        const existing = attendeeMap.get(key)!;
        existing.totalDuration += entry.duration;
        existing.sessions.push({
          duration: entry.duration,
          timeJoined: entry.timeJoined,
          timeExited: entry.timeExited,
        });
        // Prefer a split last name when an earlier row stuffed the full name into firstName
        if (!existing.identifier.lastName && normalizedName.lastName) {
          existing.identifier.firstName = normalizedName.firstName;
          existing.identifier.lastName = normalizedName.lastName;
        }
        existing.identifier.email = this.pickPreferredEmail(
          existing.identifier.email,
          entry.email
        );
      } else {
        attendeeMap.set(key, {
          identifier: {
            firstName: normalizedName.firstName,
            lastName: normalizedName.lastName,
            email: entry.email,
          },
          totalDuration: entry.duration,
          sessions: [
            {
              duration: entry.duration,
              timeJoined: entry.timeJoined,
              timeExited: entry.timeExited,
            },
          ],
        });
      }
    }

    return Array.from(attendeeMap.values());
  }

  /**
   * Create unique key for attendee identification
   * Rules:
   * 1. If a real (unmasked) email exists, use email (case-insensitive)
   * 2. Otherwise use normalized full name (handles "Shruti Poddar" vs Shruti/Poddar)
   * 3. Masked emails like shru**********@***.com are ignored as identity keys
   */
  private static createAttendeeKey(entry: ParsedAttendanceEntry): string {
    const email = entry.email?.trim();

    // Priority 1: Real email only — masked Meet exports collide across people
    if (email && !this.isMaskedEmail(email)) {
      return `email:${email.toLowerCase()}`;
    }

    const { fullNameKey } = this.getNormalizedNameParts(
      entry.firstName,
      entry.lastName
    );
    return `name:${fullNameKey}`;
  }

  /**
   * Calculate rankings from aggregated attendees
   */
  static calculateRankings(
    aggregatedAttendees: AggregatedAttendee[],
    options: RankingOptions = {}
  ): IRankingEntry[] {
    const maxRank = options.maxRank || RANKING.MAX_TOP_RANKS;

    // Sort by total duration (descending)
    const sorted = [...aggregatedAttendees].sort(
      (a, b) => b.totalDuration - a.totalDuration
    );

    // Take top N and assign ranks
    return sorted.slice(0, maxRank).map((attendee, index) => {
      // Build full name - handle cases with no last name
      const fullName = attendee.identifier.lastName
        ? `${attendee.identifier.firstName} ${attendee.identifier.lastName}`.trim()
        : attendee.identifier.firstName;

      return {
        rank: index + 1,
        fullName: this.formatNameToTitleCase(fullName),
        firstName: this.formatNameToTitleCase(attendee.identifier.firstName),
        lastName: this.formatNameToTitleCase(attendee.identifier.lastName || ''),
        email: attendee.identifier.email,
        totalDuration: attendee.totalDuration,
        totalDurationFormatted: this.formatDuration(attendee.totalDuration),
        sessionCount: attendee.sessions.length,
      };
    });
  }

  /**
   * Process attendance entries and generate rankings
   * Complete flow: parse -> aggregate -> rank
   */
  static processAttendanceData(
    entries: ParsedAttendanceEntry[],
    options: RankingOptions = {}
  ): IRankingEntry[] {
    const aggregated = this.aggregateAttendees(entries, options.excludeNames);
    return this.calculateRankings(aggregated, options);
  }

  /**
   * Format duration from minutes to "X hr Y min"
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} min`;
    }
    return `${hours} hr ${mins} min`;
  }

  /**
   * Parse formatted duration back to minutes
   */
  static parseDurationToMinutes(formatted: string): number {
    let totalMinutes = 0;

    const hourMatch = formatted.match(/(\d+)\s*hr/i);
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }

    const minMatch = formatted.match(/(\d+)\s*min/i);
    if (minMatch) {
      totalMinutes += parseInt(minMatch[1]);
    }

    return totalMinutes;
  }

  /**
   * Get duration breakdown
   */
  static getDurationBreakdown(minutes: number): DurationFormat {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return {
      hours,
      minutes: mins,
      formatted: this.formatDuration(minutes),
    };
  }

  /**
   * Filter rankings by criteria
   */
  static filterRankings(
    rankings: IRankingEntry[],
    filters: {
      minDuration?: number; // in minutes
      maxDuration?: number; // in minutes
      searchQuery?: string; // search in name or email
      topN?: number;
    }
  ): IRankingEntry[] {
    let filtered = [...rankings];

    // Filter by minimum duration
    if (filters.minDuration !== undefined) {
      const minDuration = filters.minDuration;
      filtered = filtered.filter(r => r.totalDuration >= minDuration);
    }

    // Filter by maximum duration
    if (filters.maxDuration !== undefined) {
      const maxDuration = filters.maxDuration;
      filtered = filtered.filter(r => {
        // Keep entries with valid totalDuration that are <= maxDuration
        const duration = r.totalDuration;
        return duration !== undefined && duration !== null && duration <= maxDuration;
      });
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.fullName?.toLowerCase().includes(query) ||
          r.email?.toLowerCase().includes(query)
      );
    }

    // Take top N
    if (filters.topN) {
      filtered = filtered.slice(0, filters.topN);
    }

    return filtered;
  }

  /**
   * Filter out excessive study durations for public view
   * Removes entries with study time > 17 hours and recalculates ranks starting from 1
   */
  static filterForPublicView(rankings: IRankingEntry[]): IRankingEntry[] {
    const filtered = this.filterRankings(rankings, {
      maxDuration: RANKING.MAX_DISPLAYABLE_DURATION,
    });
    
    return filtered.map((entry, index) => {
      const plainEntry = (entry as any).toObject ? (entry as any).toObject() : entry;
      
      return {
        rank: index + 1,
        fullName: this.formatNameToTitleCase(plainEntry.fullName),
        firstName: this.formatNameToTitleCase(plainEntry.firstName),
        lastName: this.formatNameToTitleCase(plainEntry.lastName),
        email: plainEntry.email,
        totalDuration: plainEntry.totalDuration,
        totalDurationFormatted: plainEntry.totalDurationFormatted,
        sessionCount: plainEntry.sessionCount,
      };
    });
  }

  /**
   * Compare two ranking entries
   */
  static compareRankings(
    current: IRankingEntry,
    previous: IRankingEntry
  ): {
    rankChange: number;
    durationChange: number;
    isNew: boolean;
  } {
    return {
      rankChange: previous.rank - current.rank,
      durationChange: current.totalDuration - previous.totalDuration,
      isNew: false,
    };
  }

  /**
   * Get statistics from rankings
   */
  static getRankingStatistics(rankings: IRankingEntry[]): {
    totalParticipants: number;
    totalDuration: number;
    averageDuration: number;
    medianDuration: number;
    topDuration: number;
  } {
    if (rankings.length === 0) {
      return {
        totalParticipants: 0,
        totalDuration: 0,
        averageDuration: 0,
        medianDuration: 0,
        topDuration: 0,
      };
    }

    const totalDuration = rankings.reduce((sum, r) => sum + r.totalDuration, 0);
    const averageDuration = Math.round(totalDuration / rankings.length);
    
    const sortedDurations = rankings
      .map(r => r.totalDuration)
      .sort((a, b) => a - b);
    const medianDuration =
      sortedDurations[Math.floor(sortedDurations.length / 2)];

    return {
      totalParticipants: rankings.length,
      totalDuration,
      averageDuration,
      medianDuration,
      topDuration: rankings[0]?.totalDuration || 0,
    };
  }
}
