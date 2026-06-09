import type { NextApiRequest, NextApiResponse } from 'next'
import {
  appendMetaPixelLog,
  isMetaPixelFileLoggingEnabled,
  MetaPixelLogLevel,
} from '@/lib/meta-pixel-file-logger'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '64kb',
    },
  },
}

const VALID_LEVELS = new Set<MetaPixelLogLevel>(['debug', 'info', 'warn', 'error'])

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ message: `Method ${req.method} not allowed` })
    return
  }

  if (!isMetaPixelFileLoggingEnabled()) {
    res.status(204).end()
    return
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const event = typeof body.event === 'string' && body.event.trim()
    ? body.event.trim().slice(0, 120)
    : 'client_pixel_log'
  const level = typeof body.level === 'string' && VALID_LEVELS.has(body.level as MetaPixelLogLevel)
    ? body.level as MetaPixelLogLevel
    : 'info'

  await appendMetaPixelLog({
    source: 'client',
    event,
    level,
    details: {
      details: body.details || {},
      request: {
        userAgent: req.headers['user-agent'] || '',
        referer: req.headers.referer || '',
      },
    },
  })

  res.status(204).end()
}
