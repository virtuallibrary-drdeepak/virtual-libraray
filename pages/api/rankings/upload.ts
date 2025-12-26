/**
 * Upload Attendance API
 * POST /api/rankings/upload - Upload attendance file (PDF or XLSX)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { AttendanceService } from '@/services/attendance.service';
import { FileParserService } from '@/services/file-parser.service';
import { sendSuccess, sendError } from '@/utils/response';
import { HTTP_STATUS, FILE_UPLOAD } from '@/config/constants';
import { ApiResponse } from '@/types/api.types';

// Disable default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return sendError(
      res,
      `Method ${req.method} not allowed`,
      HTTP_STATUS.METHOD_NOT_ALLOWED
    );
  }

  try {
    // Parse the multipart form data
    const { fields, files } = await parseForm(req);

    // Validate date field
    const dateStr = Array.isArray(fields.date) ? fields.date[0] : fields.date;
    if (!dateStr) {
      return sendError(
        res,
        'Date is required (YYYY-MM-DD format)',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Parse and validate date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return sendError(
        res,
        'Invalid date format. Use YYYY-MM-DD',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate file
    const fileArray = Array.isArray(files.file) ? files.file : [files.file];
    const file = fileArray[0];

    if (!file) {
      return sendError(
        res,
        'File is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check file size
    if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
      return sendError(
        res,
        `File size exceeds maximum allowed (${FILE_UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB)`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Read file buffer
    const buffer = await fs.readFile(file.filepath);

    // Determine file type
    const fileType = FileParserService.getFileType(buffer, file.mimetype || undefined);
    if (!fileType) {
      return sendError(
        res,
        'Invalid file type. Only PDF and XLSX files are supported',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Process the attendance file
    const result = await AttendanceService.uploadAttendance(
      buffer,
      date,
      file.originalFilename || 'attendance',
      fileType
    );

    // Clean up temporary file
    try {
      await fs.unlink(file.filepath);
    } catch (error) {
      console.error('Error cleaning up temp file:', error);
    }

    // Check if we got valid results
    if (!result.ranking.rankings || result.ranking.rankings.length === 0) {
      return sendError(
        res,
        'No valid entries found in the file. Please check the file format.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Return success response
    return sendSuccess(
      res,
      {
        recordId: result.record._id.toString(),
        date: result.record.date.toISOString().split('T')[0],
        totalEntries: result.record.entries.length,
        totalParticipants: result.ranking.totalParticipants,
        status: result.record.status,
        rankings: result.ranking.rankings.slice(0, 20), // Return top 20 as preview
      },
      HTTP_STATUS.CREATED
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process attendance file';
    
    if (error.message?.includes('parse')) {
      errorMessage = 'Failed to parse the file. Please ensure it is a valid Google Meet attendance report.';
    } else if (error.message?.includes('validation')) {
      errorMessage = 'File contains invalid data. Please check the format and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return sendError(
      res,
      errorMessage,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Parse multipart form data
 */
async function parseForm(req: NextApiRequest): Promise<{
  fields: formidable.Fields;
  files: formidable.Files;
}> {
  // Use OS temp directory instead of /tmp/uploads
  const uploadDir = path.join(os.tmpdir(), 'virtual-library-uploads');
  
  // Ensure upload directory exists
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }

  const form = formidable({
    maxFileSize: FILE_UPLOAD.MAX_FILE_SIZE,
    keepExtensions: true,
    uploadDir: uploadDir,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}

