/**
 * File Parser Service
 * Handles parsing of PDF and XLSX attendance files
 */

import * as XLSX from 'xlsx';
import { ParsedAttendanceData, ParsedAttendanceEntry } from '@/types/ranking.types';
import PDFParser from 'pdf2json';

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
      return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          reject(new Error(`PDF parsing error: ${errData.parserError}`));
        });
        
        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            // Extract text from PDF
            let text = '';
            if (pdfData.Pages) {
              pdfData.Pages.forEach((page: any) => {
                if (page.Texts) {
                  page.Texts.forEach((textItem: any) => {
                    if (textItem.R) {
                      textItem.R.forEach((run: any) => {
                        text += decodeURIComponent(run.T) + ' ';
                      });
                    }
                  });
                  text += '\n';
                }
              });
            }
            
            // Extract entries from the text
            const entries = this.extractEntriesFromPDFText(text);
            
            resolve({
              entries,
              metadata: {
                fileName: 'attendance.pdf',
                fileType: 'pdf',
                totalEntries: entries.length,
              },
            });
          } catch (error: any) {
            reject(new Error(`Failed to extract data from PDF: ${error.message}`));
          }
        });
        
        // Parse the buffer
        pdfParser.parseBuffer(buffer);
      });
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
      return new Date();
    }
  }


  /**
   * Extract attendance entries from PDF text
   */
  private static extractEntriesFromPDFText(text: string): ParsedAttendanceEntry[] {
    const entries: ParsedAttendanceEntry[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and headers
      if (!trimmed || trimmed.includes('First name') || trimmed.includes('Email')) {
        continue;
      }

      const parts = trimmed.split(/\s+/);
      if (parts.length < 4) continue;
      
      // Find email (contains @)
      const emailIndex = parts.findIndex(p => p.includes('@'));
      if (emailIndex < 2) continue;
      
      const firstName = parts[0];
      const lastName = parts[1];
      const email = parts[emailIndex];
      
      // Extract duration parts (numbers and hr/min/sec)
      const durationParts: string[] = [];
      for (let j = emailIndex + 1; j < parts.length && durationParts.length < 4; j++) {
        if (parts[j].match(/^\d+$|^(hr|min|sec)$/i)) {
          durationParts.push(parts[j]);
        } else if (durationParts.length > 0) break;
      }
      
      const duration = this.parseDuration(durationParts.join(' '));
      if (duration <= 0) continue;
      
      // Extract times (after duration)
      const timeStart = emailIndex + 1 + durationParts.length;
      const timeJoined = parts.slice(timeStart, timeStart + 2).join(' ');
      const timeExited = parts.slice(timeStart + 2, timeStart + 4).join(' ');
      
      entries.push({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        duration,
        timeJoined: this.parseTime(timeJoined),
        timeExited: this.parseTime(timeExited || timeJoined),
      });
    }

    return entries;
  }

  /**
   * Determine file type from buffer
   */
  static getFileType(buffer: Buffer, mimeType?: string): 'pdf' | 'xlsx' | null {
    // Check magic numbers for PDF
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return 'pdf';
    }
    
    // Check for XLSX (ZIP format - XLSX files are zipped XML)
    if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
      return 'xlsx';
    }

    // Fallback to MIME type
    if (mimeType?.includes('pdf')) return 'pdf';
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) return 'xlsx';

    return null;
  }
}

