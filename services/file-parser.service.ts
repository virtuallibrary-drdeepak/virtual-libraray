/**
 * File Parser Service
 * Handles parsing of PDF and XLSX attendance files
 */

import * as XLSX from 'xlsx';
import { ParsedAttendanceData, ParsedAttendanceEntry } from '@/types/ranking.types';

// CommonJS import for pdf-parse (it doesn't have ESM default export)
const pdfParse = require('pdf-parse');

export class FileParserService {
  /**
   * Parse XLSX file and extract attendance data
   */
  static async parseXLSX(buffer: Buffer): Promise<ParsedAttendanceData> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const rawData = XLSX.utils.sheet_to_json(sheet, { raw: false });

      const entries: ParsedAttendanceEntry[] = rawData
        .map((row: any) => this.parseAttendanceRow(row))
        .filter((entry): entry is ParsedAttendanceEntry => entry !== null);

      return {
        entries,
        metadata: {
          fileName: 'attendance.xlsx',
          fileType: 'xlsx',
          totalEntries: entries.length,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to parse XLSX file: ${error.message}`);
    }
  }

  /**
   * Parse PDF file and extract attendance data
   */
  static async parsePDF(buffer: Buffer): Promise<ParsedAttendanceData> {
    try {
      const data = await pdfParse(buffer);
      const text = data.text;

      // Extract table data from PDF text
      const entries = this.extractEntriesFromPDFText(text);

      return {
        entries,
        metadata: {
          fileName: 'attendance.pdf',
          fileType: 'pdf',
          totalEntries: entries.length,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to parse PDF file: ${error.message}`);
    }
  }

  /**
   * Parse a single attendance row from XLSX
   */
  private static parseAttendanceRow(row: any): ParsedAttendanceEntry | null {
    try {
      // Handle various column name variations
      const firstName = this.extractField(row, ['First name', 'FirstName', 'first_name', 'First Name']);
      const lastName = this.extractField(row, ['Last name', 'LastName', 'last_name', 'Last Name']);
      const email = this.extractField(row, ['Email', 'email', 'Email Address']);
      const durationStr = this.extractField(row, ['Duration', 'duration', 'Time']);
      const timeJoinedStr = this.extractField(row, ['Time joined', 'TimeJoined', 'time_joined', 'Time Joined']);
      const timeExitedStr = this.extractField(row, ['Time exited', 'TimeExited', 'time_exited', 'Time Exited']);

      // Skip rows with missing first name or duration (last name is optional)
      if (!firstName || !durationStr) {
        return null;
      }

      const duration = this.parseDuration(durationStr);
      
      // Skip if duration is 0 or invalid
      if (duration <= 0) {
        return null;
      }

      const timeJoined = this.parseTime(timeJoinedStr || '');
      const timeExited = this.parseTime(timeExitedStr || '');

      // Validate dates
      if (isNaN(timeJoined.getTime()) || isNaN(timeExited.getTime())) {
        console.warn('Invalid date for entry:', firstName, lastName || '(no last name)');
        return null;
      }

      return {
        firstName: firstName.trim(),
        lastName: lastName ? lastName.trim() : '', // Empty string if no last name
        email: email ? email.trim().toLowerCase() : undefined,
        duration,
        timeJoined,
        timeExited,
      };
    } catch (error) {
      console.error('Error parsing row:', error);
      return null;
    }
  }

  /**
   * Extract field from row with multiple possible column names
   */
  private static extractField(row: any, possibleNames: string[]): string | undefined {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return String(row[name]);
      }
    }
    return undefined;
  }

  /**
   * Parse duration string to minutes
   * Handles formats like "8 hr 33 min", "1 hr 15 min", "5 min", "29 sec"
   */
  private static parseDuration(durationStr: string): number {
    let totalMinutes = 0;

    // Extract hours
    const hourMatch = durationStr.match(/(\d+)\s*hr/i);
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
    }

    // Extract minutes
    const minMatch = durationStr.match(/(\d+)\s*min/i);
    if (minMatch) {
      totalMinutes += parseInt(minMatch[1]);
    }

    // Extract seconds (convert to fraction of minutes)
    const secMatch = durationStr.match(/(\d+)\s*sec/i);
    if (secMatch) {
      totalMinutes += Math.round(parseInt(secMatch[1]) / 60);
    }

    return totalMinutes;
  }

  /**
   * Parse time string to Date object
   * Handles formats like "5:55 AM", "11:20 PM", "10:01 AM"
   */
  private static parseTime(timeStr: string): Date {
    try {
      if (!timeStr || typeof timeStr !== 'string') {
        return new Date(); // Return current date as fallback
      }

      const today = new Date();
      const trimmed = timeStr.trim();
      const parts = trimmed.split(' ');
      
      if (parts.length < 1) {
        return today;
      }

      const time = parts[0];
      const period = parts[1] || '';
      
      const timeParts = time.split(':');
      if (timeParts.length < 2) {
        return today;
      }

      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);

      if (isNaN(hours) || isNaN(minutes)) {
        return today;
      }

      let hour24 = hours;
      if (period && period.toUpperCase() === 'PM' && hours !== 12) {
        hour24 += 12;
      } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
        hour24 = 0;
      }

      const result = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour24, minutes);
      
      // Validate the date
      if (isNaN(result.getTime())) {
        return today;
      }

      return result;
    } catch (error) {
      console.error('Error parsing time:', timeStr, error);
      return new Date(); // Return current date as fallback
    }
  }

  /**
   * Extract attendance entries from PDF text
   */
  private static extractEntriesFromPDFText(text: string): ParsedAttendanceEntry[] {
    const entries: ParsedAttendanceEntry[] = [];
    const lines = text.split('\n');

    let currentEntry: Partial<ParsedAttendanceEntry> = {};
    let fieldIndex = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.includes('First name') || trimmedLine.includes('Last name')) {
        continue;
      }

      // Simple state machine to extract fields in order
      // This is a basic implementation - may need refinement based on actual PDF structure
      const fields = trimmedLine.split(/\s{2,}/); // Split by multiple spaces

      if (fields.length >= 5) {
        // Full row
        const [firstName, lastName, email, duration, timeJoined, timeExited] = fields;
        entries.push({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email && email.includes('@') ? email.trim().toLowerCase() : undefined,
          duration: this.parseDuration(duration),
          timeJoined: this.parseTime(timeJoined),
          timeExited: this.parseTime(timeExited || timeJoined),
        });
      }
    }

    return entries;
  }

  /**
   * Determine file type from buffer
   */
  static getFileType(buffer: Buffer, mimeType?: string): 'pdf' | 'xlsx' | null {
    // Check magic numbers
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return 'pdf';
    }
    if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
      return 'xlsx';
    }

    // Fallback to MIME type
    if (mimeType?.includes('pdf')) return 'pdf';
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return 'xlsx';

    return null;
  }
}

