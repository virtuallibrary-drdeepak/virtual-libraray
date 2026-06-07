import type { NextApiRequest, NextApiResponse } from 'next'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])
const SENSITIVE_KEY_PARTS = [
  'accesstoken',
  'authorization',
  'claimtoken',
  'code',
  'confirmpassword',
  'otp',
  'password',
  'paymenturl',
  'refreshtoken',
  'token',
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isLocalDevRequest(req)) {
    res.status(404).json({ message: 'Not found' })
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ message: `Method ${req.method} not allowed` })
    return
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const event = typeof body.event === 'string' ? body.event : 'checkout_debug'
  const details = sanitizeDebugValue(body.details || {})

  console.info('[checkout-debug]', event, details)

  res.status(204).end()
}

function isLocalDevRequest(req: NextApiRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return false
  }

  const rawHost = req.headers.host || ''
  const host = rawHost.split(':')[0]?.replace(/^\[|\]$/g, '') || ''

  return LOCAL_HOSTS.has(host)
}

function sanitizeDebugValue(value: unknown): unknown {
  if (value == null || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return value.length > 240 ? `${value.slice(0, 240)}...` : value
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map(sanitizeDebugValue)
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')

        if (SENSITIVE_KEY_PARTS.some((part) => normalizedKey.includes(part))) {
          if (typeof entryValue === 'boolean' || typeof entryValue === 'number') {
            return [key, entryValue]
          }

          return [key, '[redacted]']
        }

        return [key, sanitizeDebugValue(entryValue)]
      })
    )
  }

  return String(value)
}
