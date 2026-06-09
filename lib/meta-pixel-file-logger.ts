import fs from 'fs'
import os from 'os'
import path from 'path'

export type MetaPixelLogLevel = 'debug' | 'info' | 'warn' | 'error'
export type MetaPixelLogSource = 'client' | 'server'

export type MetaPixelFileLogEntry = {
  source: MetaPixelLogSource
  event: string
  level?: MetaPixelLogLevel
  details?: unknown
  error?: unknown
}

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on'])
const FALSE_VALUES = new Set(['0', 'false', 'no', 'off'])
const MAX_ARRAY_ITEMS = 50
const MAX_DEPTH = 8
const MAX_STRING_LENGTH = 2000
const SENSITIVE_KEY_PARTS = [
  'accesstoken',
  'authorization',
  'bearer',
  'claimtoken',
  'confirmpassword',
  'cookie',
  'email',
  'firstname',
  'fullname',
  'lastname',
  'otp',
  'password',
  'paymenturl',
  'phone',
  'refreshtoken',
  'secret',
  'token',
]
const SENSITIVE_EXACT_KEYS = new Set(['code', 'mobile', 'name'])

export function isMetaPixelFileLoggingEnabled() {
  const flag = process.env.META_PIXEL_FILE_LOGGING_ENABLED?.trim().toLowerCase()

  if (flag && TRUE_VALUES.has(flag)) {
    return true
  }

  if (flag && FALSE_VALUES.has(flag)) {
    return false
  }

  return process.env.NODE_ENV !== 'production'
}

export function getMetaPixelLogFilePath() {
  if (process.env.META_PIXEL_LOG_FILE) {
    return path.resolve(process.env.META_PIXEL_LOG_FILE)
  }

  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'meta-pixel.log')
  }

  return path.join(process.cwd(), 'logs', 'meta-pixel.log')
}

export async function appendMetaPixelLog(entry: MetaPixelFileLogEntry) {
  if (!isMetaPixelFileLoggingEnabled()) {
    return
  }

  const filePath = getMetaPixelLogFilePath()
  const record = {
    timestamp: new Date().toISOString(),
    level: entry.level || 'info',
    source: entry.source,
    event: entry.event,
    details: sanitizeMetaPixelLogValue(entry.details),
    error: entry.error ? serializeMetaPixelError(entry.error) : undefined,
    runtime: {
      nodeEnv: process.env.NODE_ENV || 'unknown',
      pid: process.pid,
    },
  }

  try {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
    await fs.promises.appendFile(filePath, `${JSON.stringify(record)}\n`, 'utf8')
  } catch (error) {
    console.error('[meta-pixel-log] Failed to write log file:', error)
  }
}

export function maskMetaPixelIdentifier(value?: string | null) {
  if (!value) {
    return '[missing]'
  }

  const normalized = String(value)

  if (normalized.length <= 4) {
    return '[present]'
  }

  return `${'*'.repeat(Math.min(normalized.length - 4, 8))}${normalized.slice(-4)}`
}

export function serializeMetaPixelError(error: unknown): unknown {
  if (!error) {
    return error
  }

  if (error instanceof Error) {
    return sanitizeMetaPixelLogValue({
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
  }

  if (typeof error === 'object') {
    const anyError = error as Record<string, unknown>
    const response = anyError.response && typeof anyError.response === 'object'
      ? anyError.response as Record<string, unknown>
      : undefined

    return sanitizeMetaPixelLogValue({
      name: anyError.name,
      message: anyError.message || String(error),
      stack: anyError.stack,
      status: anyError.status || response?.status,
      statusText: response?.statusText,
      responseData: response?.data,
      responseHeaders: response?.headers,
    })
  }

  return sanitizeMetaPixelLogValue({ message: String(error) })
}

export function sanitizeMetaPixelLogValue(value: unknown): unknown {
  return sanitizeValue(value, '', 0, new WeakSet<object>())
}

function sanitizeValue(
  value: unknown,
  key: string,
  depth: number,
  seen: WeakSet<object>
): unknown {
  if (value == null || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return truncateString(isUrlKey(key) ? sanitizeUrl(value) : value)
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'function' || typeof value === 'symbol') {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value instanceof Error) {
    return serializeMetaPixelError(value)
  }

  if (depth >= MAX_DEPTH) {
    return '[max-depth]'
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[circular]'
    }

    seen.add(value)

    if (Array.isArray(value)) {
      return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeValue(item, key, depth + 1, seen))
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => {
        if (shouldRedactKey(entryKey)) {
          return [entryKey, '[redacted]']
        }

        return [entryKey, sanitizeValue(entryValue, entryKey, depth + 1, seen)]
      })
    )
  }

  return String(value)
}

function shouldRedactKey(key: string) {
  const normalizedKey = normalizeKey(key)

  return SENSITIVE_EXACT_KEYS.has(normalizedKey) ||
    SENSITIVE_KEY_PARTS.some((part) => normalizedKey.includes(part))
}

function isUrlKey(key: string) {
  return normalizeKey(key).includes('url')
}

function normalizeKey(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function sanitizeUrl(value: string) {
  try {
    const parsedUrl = new URL(value, 'https://virtual-library.local')

    parsedUrl.searchParams.forEach((_paramValue, paramKey) => {
      if (shouldRedactKey(paramKey)) {
        parsedUrl.searchParams.set(paramKey, '[redacted]')
      }
    })

    const sanitized = parsedUrl.toString()
    return sanitized.replace('https://virtual-library.local', '')
  } catch {
    return value
  }
}

function truncateString(value: string) {
  if (value.length <= MAX_STRING_LENGTH) {
    return value
  }

  return `${value.slice(0, MAX_STRING_LENGTH)}...`
}
