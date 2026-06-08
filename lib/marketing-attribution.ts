export type MarketingAttributionPayload = {
  fbp?: string
  fbc?: string
  fbclid?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  landingUrl?: string
  currentUrl?: string
  referrer?: string
}

const ATTRIBUTION_STORAGE_KEY = 'vl_marketing_attribution'
const FBC_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60

export function getMarketingAttribution(): MarketingAttributionPayload {
  try {
    if (typeof window === 'undefined') {
      return {}
    }

    const storedAttribution = getStoredAttribution()
    const url = new URL(window.location.href)
    const currentAttribution = getCurrentAttribution(url)
    const nextAttribution: MarketingAttributionPayload = {
      fbp: currentAttribution.fbp || storedAttribution.fbp,
      fbc: currentAttribution.fbc || storedAttribution.fbc,
      fbclid: storedAttribution.fbclid || currentAttribution.fbclid,
      utmSource: storedAttribution.utmSource || currentAttribution.utmSource,
      utmMedium: storedAttribution.utmMedium || currentAttribution.utmMedium,
      utmCampaign: storedAttribution.utmCampaign || currentAttribution.utmCampaign,
      utmContent: storedAttribution.utmContent || currentAttribution.utmContent,
      utmTerm: storedAttribution.utmTerm || currentAttribution.utmTerm,
      landingUrl: storedAttribution.landingUrl || currentAttribution.currentUrl,
      currentUrl: currentAttribution.currentUrl,
      referrer: storedAttribution.referrer || currentAttribution.referrer,
    }

    persistAttribution(nextAttribution)

    return cleanAttribution(nextAttribution)
  } catch {
    return {}
  }
}

function getCurrentAttribution(url: URL): MarketingAttributionPayload {
  const cookies = readCookies()
  const fbclid = getUrlParam(url, 'fbclid')
  const fbc = cookies._fbc || deriveAndStoreFbc(fbclid)

  return cleanAttribution({
    fbp: cookies._fbp,
    fbc,
    fbclid,
    utmSource: getUrlParam(url, 'utm_source'),
    utmMedium: getUrlParam(url, 'utm_medium'),
    utmCampaign: getUrlParam(url, 'utm_campaign'),
    utmContent: getUrlParam(url, 'utm_content'),
    utmTerm: getUrlParam(url, 'utm_term'),
    landingUrl: url.href,
    currentUrl: url.href,
    referrer: document.referrer || undefined,
  })
}

function deriveAndStoreFbc(fbclid?: string) {
  if (!fbclid) {
    return undefined
  }

  const fbc = `fb.1.${Date.now()}.${fbclid}`
  setCookie('_fbc', fbc)

  return fbc
}

function readCookies() {
  return document.cookie.split(';').reduce<Record<string, string>>((cookies, cookie) => {
    const separatorIndex = cookie.indexOf('=')

    if (separatorIndex === -1) {
      return cookies
    }

    const key = cookie.slice(0, separatorIndex).trim()
    const value = cookie.slice(separatorIndex + 1).trim()

    if (key) {
      cookies[key] = decodeCookieValue(value)
    }

    return cookies
  }, {})
}

function setCookie(name: string, value: string) {
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${FBC_COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
  } catch {
    // Attribution must never block checkout.
  }
}

function getStoredAttribution(): MarketingAttributionPayload {
  try {
    const rawAttribution = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)

    if (!rawAttribution) {
      return {}
    }

    const parsed = JSON.parse(rawAttribution)

    return parsed && typeof parsed === 'object' ? cleanAttribution(parsed as MarketingAttributionPayload) : {}
  } catch {
    return {}
  }
}

function persistAttribution(attribution: MarketingAttributionPayload) {
  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(cleanAttribution(attribution)))
  } catch {
    // Best-effort first-touch persistence only.
  }
}

function getUrlParam(url: URL, key: string) {
  return url.searchParams.get(key) || undefined
}

function decodeCookieValue(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function cleanAttribution(attribution: MarketingAttributionPayload): MarketingAttributionPayload {
  return Object.entries(attribution).reduce<MarketingAttributionPayload>((payload, [key, value]) => {
    if (typeof value === 'string' && value.trim()) {
      payload[key as keyof MarketingAttributionPayload] = value.trim()
    }

    return payload
  }, {})
}
