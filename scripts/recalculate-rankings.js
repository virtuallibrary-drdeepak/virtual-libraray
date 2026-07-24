/**
 * Recalculate daily rankings from stored attendance records.
 * Fixes identity collisions caused by masked Google Meet emails.
 *
 * Usage:
 *   node scripts/recalculate-rankings.js
 *   node scripts/recalculate-rankings.js 2026-07-23
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const AttendanceEntrySchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    duration: Number,
    timeJoined: Date,
    timeExited: Date,
  },
  { _id: false }
);

const AttendanceRecordSchema = new mongoose.Schema({
  date: Date,
  entries: [AttendanceEntrySchema],
  fileName: String,
  fileType: String,
  status: String,
  processedAt: Date,
});

const RankingEntrySchema = new mongoose.Schema(
  {
    rank: Number,
    fullName: String,
    firstName: String,
    lastName: String,
    email: String,
    totalDuration: Number,
    totalDurationFormatted: String,
    sessionCount: Number,
  },
  { _id: false }
);

const DailyRankingSchema = new mongoose.Schema({
  date: { type: Date, unique: true },
  rankings: [RankingEntrySchema],
  totalParticipants: Number,
  computedAt: Date,
  attendanceRecordId: mongoose.Schema.Types.ObjectId,
});

const AttendanceRecord =
  mongoose.models.AttendanceRecord ||
  mongoose.model('AttendanceRecord', AttendanceRecordSchema);
const DailyRanking =
  mongoose.models.DailyRanking ||
  mongoose.model('DailyRanking', DailyRankingSchema);

function isMaskedEmail(email) {
  return Boolean(email && email.includes('*'));
}

function getNormalizedNameParts(firstName, lastName = '') {
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

function createAttendeeKey(entry) {
  const email = entry.email && entry.email.trim();
  if (email && !isMaskedEmail(email)) {
    return `email:${email.toLowerCase()}`;
  }

  const { fullNameKey } = getNormalizedNameParts(entry.firstName, entry.lastName);
  return `name:${fullNameKey}`;
}

function formatNameToTitleCase(name) {
  if (!name) return name;
  return name
    .toLowerCase()
    .split(' ')
    .map(word => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  return `${hours} hr ${mins} min`;
}

function pickPreferredEmail(current, incoming) {
  const currentUsable = current && !isMaskedEmail(current) ? current : undefined;
  const incomingUsable =
    incoming && !isMaskedEmail(incoming) ? incoming : undefined;
  return incomingUsable || currentUsable || incoming || current;
}

function processAttendanceData(entries) {
  const attendeeMap = new Map();
  const excluded = ['Virtual Library Admin'];

  for (const entry of entries) {
    const fullName = `${entry.firstName} ${entry.lastName || ''}`.trim();
    if (
      excluded.some(name => fullName.toLowerCase().includes(name.toLowerCase()))
    ) {
      continue;
    }

    const key = createAttendeeKey(entry);
    const normalizedName = getNormalizedNameParts(entry.firstName, entry.lastName);

    if (attendeeMap.has(key)) {
      const existing = attendeeMap.get(key);
      existing.totalDuration += entry.duration;
      existing.sessionCount += 1;
      if (!existing.lastName && normalizedName.lastName) {
        existing.firstName = normalizedName.firstName;
        existing.lastName = normalizedName.lastName;
      }
      existing.email = pickPreferredEmail(existing.email, entry.email);
    } else {
      attendeeMap.set(key, {
        firstName: normalizedName.firstName,
        lastName: normalizedName.lastName,
        email: entry.email,
        totalDuration: entry.duration,
        sessionCount: 1,
      });
    }
  }

  return Array.from(attendeeMap.values())
    .sort((a, b) => b.totalDuration - a.totalDuration)
    .map((attendee, index) => {
      const fullName = attendee.lastName
        ? `${attendee.firstName} ${attendee.lastName}`.trim()
        : attendee.firstName;

      return {
        rank: index + 1,
        fullName: formatNameToTitleCase(fullName),
        firstName: formatNameToTitleCase(attendee.firstName),
        lastName: formatNameToTitleCase(attendee.lastName || ''),
        email: attendee.email,
        totalDuration: attendee.totalDuration,
        totalDurationFormatted: formatDuration(attendee.totalDuration),
        sessionCount: attendee.sessionCount,
      };
    });
}

function dayRange(dateInput) {
  const start = new Date(dateInput);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateInput);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function recalculateRecord(record) {
  const rankings = processAttendanceData(record.entries || []);

  await DailyRanking.findOneAndUpdate(
    { date: record.date },
    {
      date: record.date,
      rankings,
      totalParticipants: rankings.length,
      computedAt: new Date(),
      attendanceRecordId: record._id,
    },
    { upsert: true, new: true }
  );

  const shruti = rankings.filter(r =>
    (r.fullName || '').toLowerCase().includes('shruti')
  );

  return {
    date: record.date.toISOString().split('T')[0],
    totalParticipants: rankings.length,
    shruti,
  };
}

async function main() {
  const targetDate = process.argv[2];
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing from .env.local');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  let records;
  if (targetDate) {
    const { start, end } = dayRange(targetDate);
    records = await AttendanceRecord.find({
      date: { $gte: start, $lte: end },
      status: 'processed',
    });
    if (records.length === 0) {
      throw new Error(`No attendance record found for ${targetDate}`);
    }
  } else {
    records = await AttendanceRecord.find({ status: 'processed' }).sort({
      date: -1,
    });
  }

  console.log(`Recalculating ${records.length} day(s)...`);

  for (const record of records) {
    const result = await recalculateRecord(record);
    console.log(
      `✓ ${result.date} → ${result.totalParticipants} participants`
    );
    if (result.shruti.length) {
      for (const entry of result.shruti) {
        console.log(
          `  - #${entry.rank} ${entry.fullName}: ${entry.totalDurationFormatted} (${entry.sessionCount} session(s))`
        );
      }
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(async error => {
  console.error('Failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});
