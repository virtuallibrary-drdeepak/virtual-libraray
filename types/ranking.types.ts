/**
 * Ranking System Type Definitions
 * Types specific to ranking calculation and processing
 */

export type ParsedAttendanceEntry = {
  firstName: string;
  lastName: string;
  email?: string;
  duration: number; // in minutes
  timeJoined: Date;
  timeExited: Date;
};

export type ParsedAttendanceData = {
  entries: ParsedAttendanceEntry[];
  metadata: {
    fileName: string;
    fileType: 'pdf' | 'xlsx';
    totalEntries: number;
  };
};

export type AttendeeIdentifier = {
  firstName: string;
  lastName: string;
  email?: string;
};

export type AggregatedAttendee = {
  identifier: AttendeeIdentifier;
  totalDuration: number; // in minutes
  sessions: {
    duration: number;
    timeJoined: Date;
    timeExited: Date;
  }[];
};

export type RankingOptions = {
  excludeNames?: string[]; // Names to exclude (e.g., "Virtual Library Admin")
  maxRank?: number; // Maximum rank to return (e.g., 100 for Top 100)
};

export type FileParserConfig = {
  maxFileSize: number; // in bytes
  allowedFileTypes: string[];
  uploadDir: string;
};

export type DurationFormat = {
  hours: number;
  minutes: number;
  formatted: string; // "X hr Y min"
};

