# Rankings Update Logic Handoff

This document describes the current Google Meet rankings system in the Next.js codebase. It is intended to support migrating the rankings upload and update logic into another service.

## Scope

The current rankings update path is upload-driven:

- Admin uploads a Google Meet attendance PDF or XLSX file.
- The codebase parses the attendance data.
- Attendees are aggregated by identity.
- Rankings are calculated from total attendance duration.
- The raw attendance and computed rankings are stored in MongoDB.

There is no background job, cron, webhook, or automatic periodic updater for rankings in this repository. Rankings are updated only when an admin uploads a file.

## Main Routes And Files

### User-facing routes

- Public rankings page: `/rankings`
  - Source: `pages/rankings.tsx`
  - Shows rankings to public users.
  - Fetches recent ranking dates and then fetches rankings for the selected date.

- Admin rankings dashboard: `/admin/rankings`
  - Source: `pages/admin/rankings/index.tsx`
  - Lets admin view rankings, download PDFs, delete data, and navigate to upload.

- Admin upload page: `/admin/rankings/upload`
  - Source: `pages/admin/rankings/upload.tsx`
  - Direct Google Meet upload URL:
    - `/admin/rankings/upload?type=meet`

Important: because this is a Next.js `pages/` app, the `pages` folder is not part of the browser URL. The route is `/admin/rankings`, not `/pages/admin/rankings`.

### API routes

- `POST /api/rankings/upload`
  - Source: `pages/api/rankings/upload.ts`
  - Uploads and processes a Google Meet attendance PDF/XLSX.

- `GET /api/rankings/daily?date=YYYY-MM-DD&limit=10000&search=query`
  - Source: `pages/api/rankings/daily.ts`
  - Fetches one day's computed rankings.

- `GET /api/rankings/list?page=1&limit=10`
  - Source: `pages/api/rankings/list.ts`
  - Lists available ranking dates.

- `GET /api/rankings/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=10000`
  - Source: `pages/api/rankings/range.ts`
  - Fetches rankings across a date range.

- `DELETE /api/rankings/delete?date=YYYY-MM-DD`
  - Source: `pages/api/rankings/delete.ts`
  - Deletes the attendance record and daily ranking for a date.

## Current Upload Entry Point

Uploads are sent from `pages/admin/rankings/upload.tsx`.

The upload form collects:

- `file`
- `date`
- `uploadType`, stored in React state

For Google Meet rankings, `uploadType` is `meet`.

On submit, `handleUpload()` builds a `FormData` payload:

```ts
const formData = new FormData();
formData.append('file', file);
formData.append('date', date);
```

Then it sends the upload to the rankings endpoint:

```ts
const response = await fetch('/api/rankings/upload', {
  method: 'POST',
  body: formData,
});
```

The current upload contract is multipart form data:

- Field `file`: uploaded Google Meet attendance file.
- Field `date`: date string, expected as `YYYY-MM-DD`.

## Upload And Update Flow

High-level flow:

1. Admin opens `/admin/rankings/upload?type=meet`.
2. Admin chooses a PDF/XLSX attendance file and a date.
3. Browser sends `POST /api/rankings/upload` with multipart form data.
4. API route parses the multipart request with `formidable`.
5. API route validates the date and file.
6. API route reads the uploaded temp file into a `Buffer`.
7. API route determines whether the file is PDF or XLSX.
8. `AttendanceService.uploadAttendance()` parses and stores the attendance record.
9. `AttendanceService.calculateAndStoreRanking()` recalculates rankings from the attendance entries.
10. The computed ranking is saved in MongoDB.
11. API returns upload summary and top 20 ranking preview.

## API Upload Handling

Source: `pages/api/rankings/upload.ts`

The route only accepts `POST`.

It uses `parseForm(req)`, which:

- Creates a temp upload directory under `os.tmpdir()`:
  - `virtual-library-uploads`
- Configures `formidable` with:
  - `maxFileSize: FILE_UPLOAD.MAX_FILE_SIZE`
  - `keepExtensions: true`
  - `uploadDir`

Validation:

- `date` is required.
- `date` must parse as a valid JavaScript `Date`.
- `file` is required.
- File size must be no more than `FILE_UPLOAD.MAX_FILE_SIZE`.
- File type must be PDF or XLSX.

File type detection is done by `FileParserService.getFileType()`:

- PDF: magic bytes `%PDF`
- XLSX: ZIP magic bytes `PK`
- Fallback: MIME type contains `pdf`, `spreadsheet`, or `excel`

After processing, the temp file is deleted with `fs.unlink()`.

## Attendance Parsing

Source: `services/file-parser.service.ts`

### XLSX parser

`FileParserService.parseXLSX(buffer)`:

1. Reads workbook using `xlsx`.
2. Uses the first worksheet.
3. Converts rows to JSON using `XLSX.utils.sheet_to_json(sheet, { raw: false })`.
4. Parses each row with `parseAttendanceRow()`.
5. Filters out invalid rows.

Expected or supported column names:

- First name:
  - `First name`
  - `FirstName`
  - `first_name`
  - `First Name`

- Last name:
  - `Last name`
  - `LastName`
  - `last_name`
  - `Last Name`

- Email:
  - `Email`
  - `email`
  - `Email Address`

- Duration:
  - `Duration`
  - `duration`
  - `Time`

- Time joined:
  - `Time joined`
  - `TimeJoined`
  - `time_joined`
  - `Time Joined`

- Time exited:
  - `Time exited`
  - `TimeExited`
  - `time_exited`
  - `Time Exited`

Rows are skipped if:

- First name is missing.
- Duration is missing.
- Parsed duration is `0` or invalid.
- Parsed join/exit times are invalid.

Note: `parseTime()` falls back to the current date when time is missing or invalid. That means some missing time values may still pass validation because the fallback is a valid `Date`. Ranking calculation only uses duration, but stored session timestamps can be affected.

### PDF parser

`FileParserService.parsePDF(buffer)`:

1. Uses `pdf2json`.
2. Extracts all text runs from all PDF pages.
3. Splits text by newline.
4. Parses entries from each text line using `extractEntriesFromPDFText()`.

PDF line parsing is heuristic:

- Skips empty lines and header-like lines containing `First name` or `Email`.
- Splits line by whitespace.
- Finds the email token by searching for `@`.
- Assumes first token is first name.
- Assumes second token is last name.
- Extracts duration tokens after email.
- Extracts joined/exited times after duration.

This parser is more fragile than XLSX parsing and depends heavily on the text layout extracted from the PDF.

## Attendance Storage

Source: `services/attendance.service.ts`

`AttendanceService.uploadAttendance(buffer, date, fileName, fileType)`:

1. Connects to MongoDB.
2. Parses file using `FileParserService`.
3. Converts parsed rows into `AttendanceRecord.entries`.
4. Looks for an existing attendance record by exact `date`:

```ts
const existingRecord = await AttendanceRecord.findOne({ date });
```

If a record exists:

- Replaces `entries`.
- Updates `fileName`.
- Updates `fileType`.
- Sets `status` to `processed`.
- Sets `processedAt` to current time.
- Saves the record.
- Recalculates and stores rankings.

If no record exists:

- Creates a new `AttendanceRecord`.
- Calculates and stores rankings.

## Ranking Calculation

Source: `services/ranking.service.ts`

The public entry point for calculation is:

```ts
RankingService.processAttendanceData(entries)
```

It performs:

1. `aggregateAttendees(entries)`
2. `calculateRankings(aggregated)`

### Aggregation rules

Each attendance entry has:

- `firstName`
- `lastName`
- `email`
- `duration`
- `timeJoined`
- `timeExited`

Before aggregation, excluded names are skipped. Current exclusion config:

```ts
RANKING.EXCLUDED_NAMES = ['Virtual Library Admin']
```

An entry is excluded if the full name includes one of the excluded names case-insensitively.

Attendee identity key priority:

1. If email exists, use email lowercased:
   - `email:user@example.com`

2. Else if last name exists, use first name and last name lowercased:
   - `name:first_last`

3. Else use first name only:
   - `name:first`

If multiple entries map to the same key:

- Durations are summed.
- Each session is retained in `sessions`.

### Masked email ambiguity in Google Meet sheets

Google Meet attendance exports can include partially masked emails instead of complete email addresses. In the sheet, email values may look like:

```text
shem*****@***.com
abhi*******@***.com
anuh************@***.com
```

This creates an identity ambiguity during ranking calculation.

The current code treats any non-empty email as the strongest attendee identifier:

```ts
if (entry.email && entry.email.trim()) {
  return `email:${entry.email.toLowerCase()}`;
}
```

That works when email addresses are complete and unique. It is unreliable when emails are masked because the masked value is not a stable unique user identity.

There are two main failure modes:

1. Same person can be split into multiple ranking entries.
   - If Google masks the same user's email differently across sessions or files, the code sees different email strings.
   - Example:
     - `abhi*******@***.com`
     - `abis********@***.com`
   - If those rows are actually the same person, their durations will not be combined.

2. Different people can be merged into one ranking entry.
   - If two users produce the same masked email string, the code treats them as the same person.
   - Their durations are summed into one ranking entry even though they are different users.

Names do not fully solve the problem either:

- Many rows have only `First name`; `Last name` is often blank.
- Display names may be shortened, misspelled, inconsistent, or generic.
- Examples from the sheet include names like `Aami`, `Annu`, `Anonymous`, `AS`, `B`, and similar partial names.
- A single person may appear with different display names across days or sessions.
- Different people may share the same first name.

Because ranking calculation depends on aggregating all sessions belonging to the same person, this ambiguity affects `totalDuration`, `sessionCount`, and final rank order.

Current behavior (fixed):

- Masked emails (any email containing `*`) are **not** used as identity keys.
- Unmasked emails remain the strongest identity key.
- Otherwise attendees are keyed by a normalized full name, so
  `firstName="Shruti Poddar"` and `firstName="Shruti"/lastName="Poddar"` match.
- After changing aggregation logic, rankings can be rebuilt from stored attendance via
  `POST /api/rankings/recalculate` or `node scripts/recalculate-rankings.js [YYYY-MM-DD]`.

### Ranking rules

`calculateRankings()`:

1. Sorts aggregated attendees by `totalDuration` descending.
2. Takes the first `maxRank` entries.
3. Assigns rank as `index + 1`.
4. Formats names into title case.
5. Formats duration as `X hr Y min`, or `Y min` if under one hour.

Current max rank config:

```ts
RANKING.MAX_TOP_RANKS = 10000
```

Tie behavior:

- Equal durations are not assigned equal ranks.
- They receive sequential ranks based on array sort order.

## Ranking Storage

Source: `services/attendance.service.ts`

`AttendanceService.calculateAndStoreRanking(record)`:

1. Converts `AttendanceRecord.entries` back into parsed attendance entries.
2. Calls `RankingService.processAttendanceData(parsedEntries)`.
3. Checks for an existing `DailyRanking` by exact `record.date`:

```ts
const existingRanking = await DailyRanking.findOne({ date: record.date });
```

If existing ranking exists:

- Replaces `rankings`.
- Updates `totalParticipants`.
- Updates `computedAt`.
- Updates `attendanceRecordId`.
- Saves the document.

If no ranking exists:

- Creates a new `DailyRanking`.

Stored ranking entry fields:

- `rank`
- `fullName`
- `firstName`
- `lastName`
- `email`
- `totalDuration`
- `totalDurationFormatted`
- `sessionCount`

## Upload Response

`POST /api/rankings/upload` returns:

- `recordId`
- `date`
- `totalEntries`
- `totalParticipants`
- `status`
- `rankings`: first 20 ranking entries as preview

Example shape:

```json
{
  "recordId": "...",
  "date": "2026-05-21",
  "totalEntries": 123,
  "totalParticipants": 100,
  "status": "processed",
  "rankings": [
    {
      "rank": 1,
      "fullName": "Example User",
      "firstName": "Example",
      "lastName": "User",
      "email": "example@example.com",
      "totalDuration": 600,
      "totalDurationFormatted": "10 hr 0 min",
      "sessionCount": 2
    }
  ]
}
```

## MongoDB Models

### AttendanceRecord

Source: `models/AttendanceRecord.ts`

Used for raw parsed attendance data.

Fields:

- `date`
- `entries`
- `fileName`
- `fileType`: `pdf` or `xlsx`
- `uploadedAt`
- `processedAt`
- `status`: `pending`, `processed`, or `failed`
- `errorMessage`

Each attendance entry:

- `firstName`
- `lastName`
- `email`
- `duration`
- `timeJoined`
- `timeExited`

Indexes:

- `{ date: 1, status: 1 }`
- unique `{ date: 1, fileName: 1 }`

Important behavior:

- Upload lookup uses `findOne({ date })`, not date range.
- Date is not normalized before storing or querying in the upload path.

### DailyRanking

Source: `models/DailyRanking.ts`

Used for computed rankings.

Fields:

- `date`
- `rankings`
- `totalParticipants`
- `computedAt`
- `attendanceRecordId`

Each ranking entry:

- `rank`
- `fullName`
- `firstName`
- `lastName`
- `email`
- `totalDuration`
- `totalDurationFormatted`
- `sessionCount`

Indexes:

- `date` is unique and indexed.
- `{ date: -1 }`

Important behavior:

- Update lookup uses exact `date: record.date`.
- Daily fetch uses a day range from local `Date` construction:

```ts
date: { $gte: startOfDay, $lte: endOfDay }
```

## Public And Admin Read Behavior

### Daily read

Source: `pages/api/rankings/daily.ts`

The endpoint checks whether the requester has a valid admin cookie:

```ts
const isAdmin = verifyAuth(req) !== null;
```

For non-admin users:

- Rankings are filtered through `RankingService.filterForPublicView()`.
- Entries with `totalDuration > RANKING.MAX_DISPLAYABLE_DURATION` are removed.
- Remaining entries are re-ranked starting from `1`.

Current config:

```ts
RANKING.MAX_DISPLAYABLE_DURATION = 1020 // 17 hours
```

For admin users:

- Full stored rankings are returned.

Search:

- If `search` is provided, rankings are filtered by name or email.

Limit:

- If `limit` is provided, rankings are sliced to that size.
- Default limit is `RANKING.DEFAULT_LIMIT`, currently `10000`.

Note: the API response maps `email` into the response for both admin and non-admin requests. The public UI does not display email, but the API currently returns it.

### List read

Source: `pages/api/rankings/list.ts`

- Lists `DailyRanking` documents sorted by date descending.
- Applies admin/non-admin filtering to determine participant count and top ranking.
- Does not return full rankings.

### Range read

Source: `pages/api/rankings/range.ts`

- Requires `startDate` and `endDate`.
- Fetches all `DailyRanking` documents in that range.
- Sorts by date descending.
- Returns each day's top rankings, sliced by `limit`.

## PDF Export

Source: `utils/pdfGenerator.ts`

Admin rankings dashboard can export rankings:

```ts
generateRankingsPDF({ date, rankings, statistics })
```

PDF generation happens client-side from data already fetched by the admin dashboard.

## Auth And Security Notes

Current admin pages are client-protected with `withAuth()`:

- Source: `utils/withAuth.tsx`
- Calls `/api/auth/session`.
- Redirects unauthenticated users to `/login`.

However, mutating API routes do not enforce admin auth at the API layer.

Current API auth behavior:

- `pages/api/rankings/upload.ts`
  - No `verifyAuth()` check.

- `pages/api/rankings/delete.ts`
  - No `verifyAuth()` check.

- `pages/api/rankings/daily.ts`
  - Uses `verifyAuth()` only to choose admin vs public response behavior.

- `pages/api/rankings/list.ts`
  - Uses `verifyAuth()` only to choose admin vs public response behavior.

Migration recommendation:

- The new service should enforce server-side authorization on all mutating endpoints:
  - Upload rankings.
  - Delete rankings.
- Public read endpoints can remain unauthenticated if desired.
- Avoid relying only on frontend admin route protection.

## Date Handling Notes

Current upload behavior:

- Upload receives `new Date(dateStr)`.
- Attendance and ranking storage use that date as provided.
- Existing record lookup uses exact date matching.
- Daily fetch uses a start-of-day/end-of-day range.

Migration recommendation:

- Pick one canonical date representation.
- Prefer storing a date-only key such as `YYYY-MM-DD`, or normalize all service dates consistently to UTC midnight.
- Keep the API contract as `YYYY-MM-DD`.

## Atomicity And Concurrency Notes

Ranking updates currently use a non-atomic read-then-write pattern:

1. Find existing attendance record.
2. Save or create attendance record.
3. Find existing daily ranking.
4. Save or create daily ranking.

This can race if two uploads for the same date happen at the same time.

Migration recommendation:

- Use transactional or atomic update behavior where possible.
- Consider:
  - Normalize date first.
  - Upsert `AttendanceRecord`.
  - Recalculate ranking from the final stored attendance record.
  - Upsert `DailyRanking`.
  - If MongoDB transactions are available, wrap attendance and ranking writes together.

## Constants To Preserve Or Revisit

Source: `config/constants.ts`

Current ranking config:

```ts
export const RANKING = {
  EXCLUDED_NAMES: ['Virtual Library Admin'],
  MAX_TOP_RANKS: 10000,
  DEFAULT_LIMIT: 10000,
  MAX_DISPLAYABLE_DURATION: 1020,
} as const;
```

Meanings:

- `EXCLUDED_NAMES`
  - Names to remove before aggregation.

- `MAX_TOP_RANKS`
  - Max computed ranking entries to store.

- `DEFAULT_LIMIT`
  - Default API response limit.

- `MAX_DISPLAYABLE_DURATION`
  - Maximum public-visible study time.
  - Current value is `1020` minutes, or `17` hours.

## Migration Interface Suggestion

If another service will own ranking updates, the minimum useful interface would be:

### Upload

Request:

- Method: `POST`
- Path: `/rankings/upload` or equivalent
- Content type: `multipart/form-data`
- Fields:
  - `file`
  - `date` as `YYYY-MM-DD`

Response:

```json
{
  "date": "2026-05-21",
  "recordId": "...",
  "totalEntries": 123,
  "totalParticipants": 100,
  "status": "processed",
  "preview": [
    {
      "rank": 1,
      "fullName": "Example User",
      "email": "example@example.com",
      "totalDuration": 600,
      "totalDurationFormatted": "10 hr 0 min",
      "sessionCount": 2
    }
  ]
}
```

### Daily read

```text
GET /rankings/daily?date=YYYY-MM-DD&limit=10000&search=query
```

### Date list

```text
GET /rankings/list?page=1&limit=30
```

### Range read

```text
GET /rankings/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=10000
```

### Delete

```text
DELETE /rankings?date=YYYY-MM-DD
```

Upload and delete endpoints should require admin authorization.

## Behavior Checklist For Migration

Preserve or intentionally change these behaviors:

- Admin upload supports Google Meet PDF.
- Admin upload supports Google Meet XLSX.
- Upload request fields are `file` and `date`.
- Entries are aggregated by email first, then name.
- Durations are summed across multiple sessions.
- `Virtual Library Admin` is excluded.
- Rankings sort by total duration descending.
- Rank assignment is sequential, even for equal durations.
- Public rankings hide entries above 17 hours.
- Public rankings are re-ranked after hiding entries above 17 hours.
- Admin rankings show full stored rankings.
- Recent dates are sorted descending.
- Upload response returns a preview of the top 20.
- Deleting data deletes both attendance record and daily ranking.

## Known Issues To Consider Fixing During Migration

1. Mutating APIs are not protected.
   - Upload and delete should require server-side admin auth.

2. Date handling is not normalized.
   - Exact date matching can become fragile across time zones or client/server differences.

3. Updates are not atomic.
   - Concurrent uploads for the same date can race.

4. PDF parsing is heuristic.
   - XLSX is more reliable.
   - If the new service can enforce XLSX-only, that would reduce parsing failures.

5. Public API includes email in response.
   - The public UI does not display email, but the API currently returns it.
   - Decide whether to preserve this or remove it.

6. Tie handling is simple sequential ranking.
   - Decide whether equal durations should share rank.

7. `parseTime()` falls back to current date.
   - This can allow incomplete time data through validation.
   - Ranking calculation only uses duration, so this may not affect ranks, but it affects stored session timestamps.

## Summary

Current rankings are updated through admin file uploads, not through an automatic process. Rankings are computed from Google Meet attendance data. The main logic to migrate lives in:

- `pages/admin/rankings/upload.tsx`
- `pages/api/rankings/upload.ts`
- `services/file-parser.service.ts`
- `services/attendance.service.ts`
- `services/ranking.service.ts`
- `models/AttendanceRecord.ts`
- `models/DailyRanking.ts`

The safest migration path is to preserve the upload contract and ranking outputs first, while fixing API auth, date normalization, and atomic writes in the new service.
