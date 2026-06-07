import type { NextApiRequest, NextApiResponse } from 'next'

const DEFAULT_BACKEND_BASE_URL = 'https://backend.virtuallibrary.in'
const CONFIGURED_BACKEND_BASE_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  DEFAULT_BACKEND_BASE_URL
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])
const CHECKOUT_DEBUG_PATHS = [
  'auth/checkout/otp/start',
  'auth/checkout/otp/verify',
  'billing/guest/payment-links',
  'billing/guest/payment-links/quote',
  'billing/guest/payment-links/status',
  'billing/orders',
  'billing/payment-links/status',
  'billing/verify',
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pathParts = req.query.path

  if (!pathParts) {
    return res.status(400).json({ message: 'Missing backend path' })
  }

  const normalizedPath = Array.isArray(pathParts) ? pathParts.join('/') : pathParts
  const incomingUrl = new URL(req.url || '/api/backend', 'http://localhost')
  const backendBaseUrl = resolveBackendBaseUrl(req)
  const targetUrl = new URL(`${backendBaseUrl.replace(/\/+$/, '')}/${normalizedPath.replace(/^\/+/, '')}`)
  const checkoutDebug = getCheckoutDebugContext(req, normalizedPath)

  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== 'path') {
      targetUrl.searchParams.append(key, value)
    }
  })

  const headers = new Headers()
  copyHeader(headers, 'authorization', req.headers.authorization)
  copyHeader(headers, 'cookie', req.headers.cookie)
  copyHeader(headers, 'content-type', req.headers['content-type'])
  copyHeader(headers, 'accept', req.headers.accept)
  copyHeader(headers, 'user-agent', req.headers['user-agent'])

  if (checkoutDebug) {
    console.info('[checkout-backend]', 'request', {
      requestId: checkoutDebug.requestId,
      method: req.method,
      path: checkoutDebug.path,
      body: summarizeCheckoutRequestBody(req.body),
    })
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body: getRequestBody(req),
      redirect: 'manual',
    })

    const responseText = await response.text()
    const contentType = response.headers.get('content-type')
    const setCookie = response.headers.get('set-cookie')

    if (checkoutDebug) {
      console.info('[checkout-backend]', 'response', {
        requestId: checkoutDebug.requestId,
        method: req.method,
        path: checkoutDebug.path,
        httpStatus: response.status,
        body: summarizeCheckoutResponseBody(responseText),
      })
    }

    if (contentType) {
      res.setHeader('Content-Type', contentType)
    }

    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie)
    }

    res.status(response.status).send(responseText)
  } catch (error) {
    if (checkoutDebug) {
      console.info('[checkout-backend]', 'error', {
        requestId: checkoutDebug.requestId,
        method: req.method,
        path: checkoutDebug.path,
        message: error instanceof Error ? error.message : 'Unknown proxy error',
      })
    }

    console.error('Backend proxy request failed:', error)
    res.status(502).json({ message: 'Unable to reach backend service' })
  }
}

function getRequestBody(req: NextApiRequest) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return undefined
  }

  if (req.body == null || req.body === '') {
    return undefined
  }

  return typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
}

function copyHeader(headers: Headers, key: string, value: string | string[] | undefined) {
  if (!value) {
    return
  }

  headers.set(key, Array.isArray(value) ? value.join(', ') : value)
}

function resolveBackendBaseUrl(req: NextApiRequest) {
  try {
    const targetUrl = new URL(CONFIGURED_BACKEND_BASE_URL)
    const currentHost = req.headers.host

    if (currentHost && targetUrl.host === currentHost) {
      return DEFAULT_BACKEND_BASE_URL
    }

    return targetUrl.toString().replace(/\/+$/, '')
  } catch {
    return DEFAULT_BACKEND_BASE_URL
  }
}

function getCheckoutDebugContext(req: NextApiRequest, normalizedPath: string) {
  if (!isLocalDevRequest(req) || !isCheckoutDebugPath(normalizedPath)) {
    return null
  }

  return {
    path: normalizedPath.replace(/^\/+/, ''),
    requestId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  }
}

function isLocalDevRequest(req: NextApiRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return false
  }

  const rawHost = req.headers.host || ''
  const host = rawHost.split(':')[0]?.replace(/^\[|\]$/g, '') || ''

  return LOCAL_HOSTS.has(host)
}

function isCheckoutDebugPath(normalizedPath: string) {
  const path = normalizedPath.replace(/^\/+/, '')

  return CHECKOUT_DEBUG_PATHS.some((debugPath) => path === debugPath || path.startsWith(`${debugPath}/`))
}

function summarizeCheckoutRequestBody(body: unknown) {
  if (!body || typeof body !== 'object') {
    return {
      bodyPresent: Boolean(body),
    }
  }

  const payload = body as Record<string, any>

  return {
    keys: Object.keys(payload).sort(),
    planId: asString(payload.planId),
    courseId: asString(payload.courseId),
    paymentOrderId: asString(payload.paymentOrderId),
    providerOrderId: asString(payload.razorpayOrderId),
    phoneMasked: maskPhone(asString(payload.phoneE164)),
    emailMasked: maskEmail(asString(payload.email)),
    namePresent: Boolean(payload.name),
    gender: asString(payload.gender),
    couponCodePresent: Boolean(payload.couponCode),
    claimPresent: Boolean(payload.claimToken),
    otpCodePresent: Boolean(payload.code),
    passwordPresent: Boolean(payload.password),
    channel: asString(payload.channel),
  }
}

function summarizeCheckoutResponseBody(responseText: string) {
  const body = tryParseJson(responseText)

  if (!body || typeof body !== 'object') {
    return {
      bodyPresent: Boolean(responseText),
      bodyType: typeof body,
    }
  }

  const payload = body as Record<string, any>

  return {
    ok: payload.ok,
    code: asString(payload.code),
    message: truncate(asString(payload.message), 180),
    status: asString(payload.status),
    paymentStatus: asString(payload.paymentStatus),
    accountSetupRequired: Boolean(payload.accountSetupRequired || payload.checkout?.accountSetupRequired),
    accessGranted: Boolean(payload.accessGranted),
    accountReady: Boolean(payload.accountReady),
    orderId: asString(payload.order?.id || payload.orderId),
    providerOrderIdPresent: Boolean(payload.order?.providerOrderId || payload.razorpay?.orderId),
    providerPaymentIdPresent: Boolean(payload.order?.providerPaymentId),
    claimPresent: Boolean(payload.checkout?.claimToken),
    paymentUrlHost: getUrlHost(asString(payload.paymentUrl || payload.paymentLink?.shortUrl || payload.paymentLink?.short_url)),
    customerAccountExists: Boolean(payload.customer?.accountExists),
    customerPhoneMasked: maskPhone(asString(payload.customer?.phoneE164 || payload.customer?.phoneE164Masked)),
    customerEmailMasked: maskEmail(asString(payload.customer?.email)),
    accessTokenPresent: Boolean(payload.accessToken || payload.token || payload.tokens?.accessToken || payload.data?.accessToken),
    refreshTokenPresent: Boolean(payload.refreshToken || payload.tokens?.refreshToken || payload.data?.refreshToken),
    subscriptionStatus: asString(payload.subscription?.status),
  }
}

function tryParseJson(rawBody: string) {
  if (!rawBody) {
    return null
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    return rawBody
  }
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@')

  if (!name || !domain) {
    return email ? '[invalid-email]' : ''
  }

  const visible = name.slice(0, Math.min(2, name.length))
  return `${visible}${name.length > 2 ? '***' : ''}@${domain}`
}

function maskPhone(phone: string) {
  if (!phone) {
    return ''
  }

  return phone.replace(/^(\+91)?(\d{2})\d{4}(\d{4})$/, (_match, country = '', start, end) => {
    return `${country || ''}${start}****${end}`
  })
}

function getUrlHost(value: string) {
  if (!value) {
    return ''
  }

  try {
    return new URL(value).host
  } catch {
    return '[invalid-url]'
  }
}
