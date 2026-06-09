export type MetaPixelClientLogLevel = 'debug' | 'info' | 'warn' | 'error'
export type MetaPixelTrackPayload = Record<string, unknown>
export type MetaPixelTrackOptions = Record<string, unknown>

type MetaPixelClientLogBody = {
  source: 'client'
  event: string
  level: MetaPixelClientLogLevel
  details?: unknown
}

const META_PIXEL_LOG_ENDPOINT = '/api/meta/pixel-log'
const PUBLIC_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export function trackMetaPixelEvent(
  eventName: string,
  payload: MetaPixelTrackPayload = {},
  options?: MetaPixelTrackOptions,
  context?: Record<string, unknown>
) {
  if (typeof window === 'undefined') {
    return false
  }

  const details = {
    eventName,
    payload,
    options,
    context,
    pixelState: getMetaPixelState(),
  }

  if (!window.fbq) {
    logMetaPixelClient('track_skipped_fbq_missing', details, 'warn')
    return false
  }

  logMetaPixelClient('track_attempt', details, 'info')

  try {
    window.fbq('track', eventName, payload, options)
    logMetaPixelClient('track_success', {
      ...details,
      pixelState: getMetaPixelState(),
    }, 'info')
    return true
  } catch (error) {
    logMetaPixelClient('track_error', {
      ...details,
      error: serializeClientError(error),
      pixelState: getMetaPixelState(),
    }, 'error')
    return false
  }
}

export function logMetaPixelClient(
  event: string,
  details: unknown = {},
  level: MetaPixelClientLogLevel = 'info'
) {
  if (typeof window === 'undefined') {
    return
  }

  const enrichedDetails = {
    ...getPageSnapshot(),
    pixelId: maskIdentifier(PUBLIC_PIXEL_ID),
    details: normalizeClientLogValue(details),
  }

  if (typeof window.__vlMetaPixelLog === 'function') {
    window.__vlMetaPixelLog(event, enrichedDetails, level)
    return
  }

  postMetaPixelClientLog({
    source: 'client',
    event,
    level,
    details: enrichedDetails,
  })
}

function postMetaPixelClientLog(body: MetaPixelClientLogBody) {
  try {
    const serialized = JSON.stringify(body)

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function' && typeof Blob !== 'undefined') {
      const queued = navigator.sendBeacon(
        META_PIXEL_LOG_ENDPOINT,
        new Blob([serialized], { type: 'application/json' })
      )

      if (queued) {
        return
      }
    }

    void fetch(META_PIXEL_LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: serialized,
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    // Pixel diagnostics must never affect checkout or navigation.
  }
}

function getMetaPixelState() {
  const fbq = typeof window !== 'undefined' ? window.fbq : undefined
  const queue = fbq && Array.isArray((fbq as any).queue) ? (fbq as any).queue : undefined

  return {
    hasFbq: Boolean(fbq),
    hasCallMethod: Boolean(fbq && (fbq as any).callMethod),
    loaded: Boolean(fbq && (fbq as any).loaded),
    version: fbq ? (fbq as any).version : undefined,
    queueLength: queue ? queue.length : undefined,
  }
}

function getPageSnapshot() {
  const searchKeys: string[] = []

  try {
    window.location.search && new URLSearchParams(window.location.search).forEach((_value, key) => {
      if (!searchKeys.includes(key)) {
        searchKeys.push(key)
      }
    })
  } catch {
    // Ignore URL parsing failures in diagnostics.
  }

  return {
    page: {
      path: window.location.pathname,
      searchKeys,
      referrerHost: getReferrerHost(),
    },
  }
}

function getReferrerHost() {
  try {
    return document.referrer ? new URL(document.referrer).host : ''
  } catch {
    return ''
  }
}

function serializeClientError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    message: String(error),
  }
}

function normalizeClientLogValue(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value == null || typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
    return value
  }

  if (value instanceof Error) {
    return serializeClientError(value)
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'function' || typeof value === 'symbol') {
    return String(value)
  }

  if (depth >= 8) {
    return '[max-depth]'
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[circular]'
    }

    seen.add(value)

    if (Array.isArray(value)) {
      return value.slice(0, 50).map((item) => normalizeClientLogValue(item, depth + 1, seen))
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [
        entryKey,
        normalizeClientLogValue(entryValue, depth + 1, seen),
      ])
    )
  }

  return String(value)
}

function maskIdentifier(value?: string) {
  if (!value) {
    return '[missing]'
  }

  if (value.length <= 4) {
    return '[present]'
  }

  return `${'*'.repeat(Math.min(value.length - 4, 8))}${value.slice(-4)}`
}
