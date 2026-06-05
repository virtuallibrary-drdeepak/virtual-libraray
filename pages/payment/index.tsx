import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  apiFetch,
  BillingOrderResponse,
  BillingPlan,
  BillingPlansResponse,
  BillingPricing,
  BillingQuoteResponse,
  BillingVerifyResponse,
  buildReturnUrl,
  CheckoutOtpVerifyResponse,
  CourseOptionsResponse,
  CourseSummary,
  extractAccessToken,
  extractRefreshToken,
  formatCurrency,
  hasGrantedCourseAccess,
  normalizeIndianPhone,
  PaymentApiError,
  PaymentLinkCreateResponse,
  PaymentLinkStatusResponse,
  postMobileEvent,
  PublicBillingPlansResponse,
  requestOtp,
  tokenStore,
  TrialOffer,
  TrialQuoteResponse,
  TrialVerifyResponse,
  verifyOtp,
} from '@/lib/payment-client'
import {
  getPricingPlanMeta,
  PricingPlanCard,
} from '@/components/v2/PricingPlanCard'

type ScreenState =
  | 'booting'
  | 'planSelect'
  | 'otp'
  | 'course'
  | 'trial'
  | 'ready'
  | 'processing'
  | 'pending'
  | 'accountSetup'
  | 'success'
  | 'failed'
  | 'error'
type AuthMode = 'unknown' | 'cookie' | 'bearer' | 'unauthenticated'
type AccountSetupStep = 'profile' | 'course'
type AccountGender = 'FEMALE' | 'MALE' | 'NON_BINARY' | 'OTHER' | 'PREFER_NOT_TO_SAY' | ''
type TrialOtpChannel = 'sms' | 'whatsapp'
type TrialAction = 'quote' | 'send' | 'verify'

type ResultState = {
  title: string
  message: string
  tone: 'success' | 'warning' | 'danger'
  returnUrl?: string
}

type PlanMetrics = {
  compareAmountPaise: number | null
}

type CheckoutActionState = {
  disabled: boolean
  label: string
  onClick?: () => void
  showArrow: boolean
}

type BillingDetails = {
  email: string
}

type PaymentSessionUser = {
  email?: string
  name?: string
  phoneE164?: string
}

type PaymentLinkCustomerPayload = {
  email?: string
  name?: string
  phoneE164?: string
}

const EMPTY_BILLING_DETAILS: BillingDetails = {
  email: '',
}

const CHECKOUT_PAYMENT_ORDER_ID_KEY = 'checkoutPaymentOrderId'
const CHECKOUT_CLAIM_TOKEN_KEY = 'checkoutClaimToken'
const CHECKOUT_PHONE_KEY = 'checkoutPhoneE164'
const CHECKOUT_EMAIL_KEY = 'checkoutEmail'
const CHECKOUT_ACCOUNT_EXISTS_KEY = 'checkoutAccountExists'
const CHECKOUT_SESSION_USER_KEY = 'checkoutSessionUser'
const LEGACY_PAYMENT_ORDER_ID_KEY = 'lastPaymentOrderId'
const MOBILE_CHECKOUT_CONTEXT_KEY = 'vl_mobile_checkout_context'
const MOBILE_CHECKOUT_CONTEXT_TTL_MS = 30 * 60 * 1000
const GOOGLE_PLAY_HREF = 'https://play.google.com/store/apps/details?id=in.virtuallibrary.virtuallibrary&hl=en_IN'
const APP_STORE_HREF = 'https://apps.apple.com/in/app/virtual-library/id6761748966'
const PAYMENT_PLAN_FEATURES = [
  '24/7 Live Study Rooms',
  'Focus Mode - Block distracting apps',
  'Spaced Repetition Revision Tracker',
  'Weekly Live Mentorship Sessions',
  'Mental Health & Yoga Sessions',
  'Leaderboard & Study Streaks',
  'Mobile app access (Android & iOS)',
]
const MOBILE_SOURCE_VALUES = new Set([
  'android',
  'app',
  'expo',
  'ios',
  'mobile',
  'mobile-app',
  'native',
  'react-native',
  'rn',
])
const MOBILE_ACCESS_TOKEN_QUERY_KEYS = [
  'accessToken',
  'access_token',
  'appAccessToken',
  'authToken',
  'mobileAccessToken',
  'token',
  'vlAccessToken',
]
const MOBILE_REFRESH_TOKEN_QUERY_KEYS = [
  'refresh',
  'refreshToken',
  'refresh_token',
  'appRefreshToken',
  'mobileRefreshToken',
  'vlRefreshToken',
]
const MOBILE_CONTEXT_QUERY_KEYS = [
  'app',
  'client',
  'from',
  'platform',
  'source',
]
const DEFAULT_PRIVACY_POLICY_VERSION = process.env.NEXT_PUBLIC_PRIVACY_POLICY_VERSION || '2026-06-04'
const DEFAULT_PUBLIC_COURSE_SLUG = 'neet-pg'
const DEFAULT_PUBLIC_COURSE_KEY = 'neetpg'

export default function PaymentPage() {
  const router = useRouter()
  const pendingPollRef = useRef<number | null>(null)
  const deepLinkTimeoutRef = useRef<number | null>(null)
  const selectedPlanIdRef = useRef('')

  const [authMode, setAuthMode] = useState<AuthMode>('unknown')
  const [screen, setScreen] = useState<ScreenState>('booting')
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [trialOffer, setTrialOffer] = useState<TrialOffer | null>(null)
  const [isMobileCheckout, setIsMobileCheckout] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [pageError, setPageError] = useState('')
  const [authError, setAuthError] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpAction, setOtpAction] = useState<'send' | 'verify' | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCouponCode, setAppliedCouponCode] = useState('')
  const [couponQuote, setCouponQuote] = useState<BillingQuoteResponse | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponMessage, setCouponMessage] = useState('')
  const [couponError, setCouponError] = useState('')
  const [razorpayReady, setRazorpayReady] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)
  const [, setStatusNote] = useState('Loading payment options...')
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null)
  const [courseOptions, setCourseOptions] = useState<CourseSummary[]>([])
  const [customCourseOption, setCustomCourseOption] = useState<{
    key: string
    title: string
    requiresCustomTitle: boolean
  } | null>(null)
  const [selectedCourseChoice, setSelectedCourseChoice] = useState('')
  const [customCourseTitle, setCustomCourseTitle] = useState('')
  const [courseLoading, setCourseLoading] = useState(false)
  const [courseError, setCourseError] = useState('')
  const [billingDetails, setBillingDetails] = useState<BillingDetails>(EMPTY_BILLING_DETAILS)
  const [sessionUser, setSessionUser] = useState<PaymentSessionUser | null>(null)
  const [billingError, setBillingError] = useState('')
  const [paymentPhoneOtpRequired, setPaymentPhoneOtpRequired] = useState(false)
  const [paymentOrderId, setPaymentOrderId] = useState('')
  const [statusTimedOut, setStatusTimedOut] = useState(false)
  const [accountSetupStep, setAccountSetupStep] = useState<AccountSetupStep>('profile')
  const [accountSetupLoading, setAccountSetupLoading] = useState(false)
  const [accountOtpStarted, setAccountOtpStarted] = useState(false)
  const [accountOtp, setAccountOtp] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountAge, setAccountAge] = useState('')
  const [accountGender, setAccountGender] = useState<AccountGender>('')
  const [accountTermsAccepted, setAccountTermsAccepted] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [trialName, setTrialName] = useState('')
  const [trialGender, setTrialGender] = useState<AccountGender>('')
  const [trialTermsAccepted, setTrialTermsAccepted] = useState(false)
  const [trialOtp, setTrialOtp] = useState('')
  const [trialOtpStarted, setTrialOtpStarted] = useState(false)
  const [trialOtpChannel, setTrialOtpChannel] = useState<TrialOtpChannel>('sms')
  const [trialLoading, setTrialLoading] = useState(false)
  const [trialAction, setTrialAction] = useState<TrialAction | null>(null)
  const [trialError, setTrialError] = useState('')
  const [trialMessage, setTrialMessage] = useState('')
  const [privacyPolicyVersion] = useState(DEFAULT_PRIVACY_POLICY_VERSION)

  const planIdFromQuery = getQueryParam(router.query.planId)
  const courseIdFromQuery = getQueryParam(router.query.courseId)
  const courseSlugFromQuery = getQueryParam(router.query.courseSlug)
  const durationMonthsFromQuery = getQueryNumber(router.query.durationMonths)
  const paymentStatusFromQuery = getQueryParam(router.query.paymentStatus)
  const checkoutSource = getQueryParam(router.query.source)
  const checkoutMode = getQueryParam(router.query.mode)
  const isLegacyCheckoutFlow = checkoutMode === 'legacy'
  const isPrimaryPaymentLinksFlow = !isLegacyCheckoutFlow && Boolean(planIdFromQuery || durationMonthsFromQuery || paymentStatusFromQuery)
  const shouldUseV2WebFallback = checkoutSource === 'v2-neet-pg'
  const shouldLoadCheckoutScript = router.isReady && isLegacyCheckoutFlow
  const isSessionPaymentLinkCheckout = isPrimaryPaymentLinksFlow && Boolean(sessionUser)

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.planId === selectedPlanId) || null,
    [plans, selectedPlanId]
  )
  const shouldShowTrialOffer = isMobileCheckout && !isLegacyCheckoutFlow && Boolean(trialOffer)
  const trialCourseTitle = getCheckoutCourseTitle(trialOffer?.course?.title || selectedCourse?.title || selectedPlan?.course?.title)
  const isTrialSuccess = result?.title.toLowerCase().includes('trial') || false
  const checkoutPricing = useMemo(
    () => getCheckoutPricing(selectedPlan, couponQuote),
    [couponQuote, selectedPlan]
  )
  const activeCouponCode = couponQuote?.couponStatus === 'APPLIED' && couponQuote.isValidCoupon
    ? couponQuote.coupon?.code || appliedCouponCode
    : ''

  const groupedPlans = useMemo(() => {
    const groups = new Map<string, { course: BillingPlan['course']; plans: BillingPlan[] }>()

    plans.forEach((plan) => {
      const key = plan.course.courseId

      if (!groups.has(key)) {
        groups.set(key, { course: plan.course, plans: [] })
      }

      groups.get(key)?.plans.push(plan)
    })

    return Array.from(groups.values())
      .map((group) => ({
        course: group.course,
        plans: [...group.plans].sort((left, right) => left.durationMonths - right.durationMonths),
      }))
      .sort((left, right) => {
        return (left.course.displayOrder || 0) - (right.course.displayOrder || 0)
      })
  }, [plans])

  const activeCourseId = selectedCourse?.courseId || selectedPlan?.course.courseId || groupedPlans[0]?.course.courseId || ''
  const activeGroup = useMemo(() => {
    return groupedPlans.find((group) => group.course.courseId === activeCourseId) || groupedPlans[0] || null
  }, [activeCourseId, groupedPlans])

  const activePlans = activeGroup?.plans || []
  const checkoutCourseOptions = useMemo(() => {
    const options = new Map<string, CourseSummary>()

    courseOptions.forEach((course) => {
      options.set(course.courseId, course)
    })

    groupedPlans.forEach((group) => {
      options.set(group.course.courseId, group.course)
    })

    if (selectedCourse?.courseId) {
      options.set(selectedCourse.courseId, selectedCourse)
    }

    return Array.from(options.values()).sort((left, right) => {
      return (left.displayOrder || 0) - (right.displayOrder || 0)
    })
  }, [courseOptions, groupedPlans, selectedCourse])

  const basePlan = useMemo(() => {
    return [...activePlans].sort((left, right) => {
      if (left.durationMonths !== right.durationMonths) {
        return left.durationMonths - right.durationMonths
      }

      return left.amountPaise - right.amountPaise
    })[0] || null
  }, [activePlans])

  const popularPlanId = useMemo(() => {
    return getDefaultPlanId(activePlans)
  }, [activePlans])

  const canRetryCheckout = screen === 'ready' || screen === 'failed'
  const canSelectPlan = screen === 'ready' || screen === 'failed'
  const isCustomCourseSelected = selectedCourseChoice === customCourseOption?.key
  const selectedCoursePreview =
    selectedCourse ||
    courseOptions.find((course) => course.courseId === selectedCourseChoice) ||
    (isCustomCourseSelected && customCourseTitle.trim()
      ? {
        courseId: '',
        slug: 'custom-course',
        title: customCourseTitle.trim(),
        description: 'Custom exam selection',
        displayOrder: 9999,
        kind: 'CUSTOM',
      }
      : null)

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    void bootstrap()
  }, [router.isReady, router.asPath])

  useEffect(() => {
    if (!activeGroup?.plans.length) {
      return
    }

    const hasSelectedPlan = activeGroup.plans.some((plan) => plan.planId === selectedPlanId)

    if (!hasSelectedPlan) {
      setSelectedPlanId(
        getDefaultPlanId(
          activeGroup.plans,
          isPrimaryPaymentLinksFlow ? planIdFromQuery : undefined,
          isPrimaryPaymentLinksFlow ? null : getQueryNumber(router.query.durationMonths)
        )
      )
    }
  }, [activeGroup, isPrimaryPaymentLinksFlow, planIdFromQuery, router.query.durationMonths, selectedPlanId])

  useEffect(() => {
    selectedPlanIdRef.current = selectedPlanId
  }, [selectedPlanId])

  useEffect(() => {
    setCouponCode('')
    setAppliedCouponCode('')
    setCouponQuote(null)
    setCouponMessage('')
    setCouponError('')
    setPaymentPhoneOtpRequired(false)
    setTrialOtp('')
    setTrialOtpStarted(false)
    setTrialError('')
    setTrialMessage('')
  }, [selectedPlanId])

  useEffect(() => {
    return () => {
      if (pendingPollRef.current) {
        window.clearInterval(pendingPollRef.current)
      }

      if (deepLinkTimeoutRef.current) {
        window.clearTimeout(deepLinkTimeoutRef.current)
      }
    }
  }, [])

  function openOtpScreen(statusMessage = 'Sign in with your phone number to continue.') {
    setAuthMode('unauthenticated')
    setOtpRequested(false)
    setOtp('')
    setPaymentPhoneOtpRequired(false)
    setScreen('otp')
    setAuthError('')
    setPageError('')
    setStatusNote(statusMessage)
    postMobileEvent('AUTH_REQUIRED')
  }

  function ensureAuthorization(message: string) {
    if (tokenStore.getAccessToken()) {
      return true
    }

    if (authMode === 'cookie') {
      return true
    }

    openOtpScreen(message)
    return false
  }

  function updateBillingField(field: keyof BillingDetails, value: string) {
    setBillingDetails((current) => ({
      ...current,
      [field]: value,
    }))
    setBillingError('')
  }

  function getGuestContactPayload() {
    const validationError = validateBillingDetails(billingDetails, phone)

    if (validationError) {
      setBillingError(validationError)
      return null
    }

    try {
      const normalizedPhone = normalizeIndianPhone(phone)

      return {
        phoneE164: normalizedPhone.e164,
        email: billingDetails.email.trim().toLowerCase(),
      }
    } catch (error) {
      setBillingError(getErrorMessage(error, 'Enter a valid mobile number.'))
      return null
    }
  }

  function getPaymentLinkCustomerPayload(): PaymentLinkCustomerPayload | null {
    if (sessionUser) {
      return {}
    }

    return getGuestContactPayload()
  }

  async function loadSessionUser() {
    try {
      const response = await apiFetch<any>('/me', {
        headers: {
          Accept: 'application/json',
        },
      })
      const user = extractSessionUser(response)

      setSessionUser(user)
      if (user) {
        setAuthMode(tokenStore.getAccessToken() ? 'bearer' : 'cookie')
        if (user.name) {
          setTrialName((current) => current || user.name || '')
        }
      }

      return user
    } catch {
      setSessionUser(null)
      return null
    }
  }

  function syncMobileCheckoutContext() {
    const hydratedTokens = hydrateMobileTokensFromQuery()
    const mobileCheckout = hydratedTokens || isMobileCheckoutRequest(router.query)

    if (mobileCheckout) {
      rememberMobileCheckoutContext()
    }

    setIsMobileCheckout(mobileCheckout)

    return mobileCheckout
  }

  function hydrateMobileTokensFromQuery() {
    const accessToken = getFirstQueryValue(router.query, MOBILE_ACCESS_TOKEN_QUERY_KEYS)
    const refreshToken = getFirstQueryValue(router.query, MOBILE_REFRESH_TOKEN_QUERY_KEYS)

    if (!accessToken && !refreshToken) {
      return false
    }

    if (accessToken) {
      tokenStore.setAccessToken(accessToken)
    }

    if (refreshToken) {
      tokenStore.setRefreshToken(refreshToken)
    }

    stripMobileTokenQueryParams()
    postMobileEvent('MOBILE_TOKEN_RECEIVED')

    return true
  }

  function stripMobileTokenQueryParams() {
    const sanitizedQuery = { ...router.query }
    let changed = false

    for (const key of [...MOBILE_ACCESS_TOKEN_QUERY_KEYS, ...MOBILE_REFRESH_TOKEN_QUERY_KEYS]) {
      if (sanitizedQuery[key] !== undefined) {
        delete sanitizedQuery[key]
        changed = true
      }
    }

    if (changed) {
      void router.replace(
        {
          pathname: router.pathname,
          query: sanitizedQuery,
        },
        undefined,
        { shallow: true, scroll: false }
      )
    }
  }

  async function bootstrap() {
    syncMobileCheckoutContext()
    setPageError('')
    setAuthError('')
    setCourseError('')
    setStatusNote('Loading payment options...')
    setResult(null)
    setStatusTimedOut(false)
    setPaymentOrderId('')
    setAccountSetupStep('profile')
    setAccountError('')
    setSessionUser(null)
    setAuthMode(tokenStore.getAccessToken() ? 'bearer' : 'unknown')

    if (paymentStatusFromQuery) {
      await handlePaymentLinkResult(paymentStatusFromQuery)
      return
    }

    if (planIdFromQuery || durationMonthsFromQuery) {
      await loadPublicPlanForPayment(planIdFromQuery)
      return
    }

    const storedCheckoutSession = getStoredCheckoutSession()
    const orderIdFromQuery = getQueryParam(router.query.orderId)
    const checkoutOrderId = orderIdFromQuery || storedCheckoutSession.orderId

    if (checkoutOrderId && storedCheckoutSession.claimToken) {
      setPaymentOrderId(checkoutOrderId)
      setScreen('pending')
      setResult({
        title: 'Checking payment',
        message: 'We are checking your Razorpay payment status.',
        tone: 'warning',
      })
      await checkPaymentLinkStatus(checkoutOrderId, true)
      return
    }

    if (isLegacyCheckoutFlow) {
      await loadPlans()
      return
    }

    await loadPublicPlansForSelection()
  }

  async function fetchCheckoutCourseOptions() {
    try {
      return await apiFetch<CourseOptionsResponse>('/courses/options', {
        skipAuth: true,
        headers: {
          Accept: 'application/json',
        },
      })
    } catch {
      return null
    }
  }

  function applyCheckoutCourseOptions(options: CourseOptionsResponse | null) {
    if (!options) {
      return
    }

    setCourseOptions(sortCourseOptions(options.courses || []))
    setCustomCourseOption(options.customCourseOption || null)
  }

  async function loadPublicPlansForSelection() {
    try {
      setScreen('booting')
      const [data, user, checkoutCourses] = await Promise.all([
        apiFetch<PublicBillingPlansResponse>('/billing/plans/public', {
          skipAuth: true,
          headers: {
            Accept: 'application/json',
          },
        }),
        loadSessionUser(),
        fetchCheckoutCourseOptions(),
      ])
      applyCheckoutCourseOptions(checkoutCourses)
      setTrialOffer(data.trialOffer || null)
      const availablePlans = [...(data.plans || [])].sort((left, right) => {
        if ((left.course.displayOrder || 0) !== (right.course.displayOrder || 0)) {
          return (left.course.displayOrder || 0) - (right.course.displayOrder || 0)
        }

        if (left.durationMonths !== right.durationMonths) {
          return left.durationMonths - right.durationMonths
        }

        return left.amountPaise - right.amountPaise
      })

      if (!availablePlans.length) {
        if (data.trialOffer && isMobileCheckoutRequest(router.query)) {
          const nextCourse = data.trialOffer.course || data.course || null

          setPlans([])
          setSelectedPlanId('')
          setSelectedCourse(nextCourse)
          setSelectedCourseChoice(nextCourse?.courseId || '')
          setAuthMode(user ? (tokenStore.getAccessToken() ? 'bearer' : 'cookie') : 'unauthenticated')
          setScreen('planSelect')
          setStatusNote('Choose the 24-hour trial to continue.')
          return
        }

        setPlans([])
        setSelectedPlanId('')
        setSelectedCourse(data.course || null)
        setScreen('error')
        setPageError(data.message || 'No plans are available right now. Please try again shortly.')
        return
      }

      const nextPlanId = getDefaultPlanId(availablePlans, undefined, durationMonthsFromQuery)
      const nextPlan = availablePlans.find((plan) => plan.planId === nextPlanId)
      const nextCourse = nextPlan?.course || data.course || availablePlans[0]?.course || null

      setPlans(availablePlans)
      setSelectedCourse(nextCourse)
      setSelectedCourseChoice(nextCourse?.courseId || '')
      setSelectedPlanId(nextPlanId)
      setAuthMode(user ? (tokenStore.getAccessToken() ? 'bearer' : 'cookie') : 'unauthenticated')
      setScreen('planSelect')
      setStatusNote('Choose a plan to continue to payment.')
    } catch (error) {
      setScreen('error')
      setPageError(getErrorMessage(error, 'Unable to load plans. Please try again.'))
    }
  }

  async function loadPublicPlanForPayment(requestedPlanId?: string) {
    try {
      setScreen('booting')
      const [data, user, checkoutCourses] = await Promise.all([
        apiFetch<PublicBillingPlansResponse>('/billing/plans/public', {
          skipAuth: true,
          headers: {
            Accept: 'application/json',
          },
        }),
        loadSessionUser(),
        fetchCheckoutCourseOptions(),
      ])
      applyCheckoutCourseOptions(checkoutCourses)
      setTrialOffer(data.trialOffer || null)
      const availablePlans = [...(data.plans || [])].sort((left, right) => {
        if (left.durationMonths !== right.durationMonths) {
          return left.durationMonths - right.durationMonths
        }

        return left.amountPaise - right.amountPaise
      })
      const matchingPlan = getRequestedPublicCheckoutPlan(availablePlans, {
        requestedCourseId: courseIdFromQuery,
        requestedCourseSlug: courseSlugFromQuery,
        requestedDurationMonths: durationMonthsFromQuery,
        requestedPlanId,
      })
      const requestedCourse = getRequestedCourseFromOptions(checkoutCourses?.courses || [], courseIdFromQuery, courseSlugFromQuery)

      if (!availablePlans.length || !matchingPlan) {
        setPlans(availablePlans)
        setSelectedPlanId('')
        setSelectedCourse(requestedCourse || data.course || availablePlans[0]?.course || null)
        setScreen('error')
        setPageError('Selected plan is no longer available. Please return to pricing and choose again.')
        return
      }

      const nextCourse = shouldUseV2WebFallback
        ? null
        : requestedCourse || matchingPlan.course || data.course || availablePlans[0]?.course || null

      setPlans(availablePlans)
      setSelectedCourse(nextCourse)
      setSelectedCourseChoice(nextCourse?.courseId || '')
      setSelectedPlanId(matchingPlan.planId)
      setAuthMode(user ? (tokenStore.getAccessToken() ? 'bearer' : 'cookie') : 'unauthenticated')
      setScreen('ready')
      setStatusNote(user ? 'Review your plan and apply a coupon if you have one.' : 'Enter contact details to create your Razorpay payment link.')
    } catch (error) {
      setScreen('error')
      setPageError(getErrorMessage(error, 'Unable to load selected plan. Please try again.'))
    }
  }

  async function loadPlans() {
    try {
      setScreen('booting')
      const planIdFromQuery = getQueryParam(router.query.planId)
      const durationMonthsFromQuery = getQueryNumber(router.query.durationMonths)
      const data = await apiFetch<BillingPlansResponse>('/billing/plans', {
        headers: {
          Accept: 'application/json',
        },
      })
      setAuthMode(tokenStore.getAccessToken() ? 'bearer' : 'cookie')

      if (data.requiresCourseSelection) {
        setPlans([])
        setSelectedPlanId('')
        setSelectedCourse(null)
        await loadCourseOptions(data.message)
        return
      }

      const availablePlans = data?.plans || []

      if (!availablePlans.length) {
        setScreen('error')
        setPageError('No plans are available right now. Please try again shortly.')
        return
      }

      setSelectedCourse(data.selectedCourse || availablePlans[0]?.course || null)
      setPlans(availablePlans)
      setSelectedPlanId(getDefaultPlanId(availablePlans, planIdFromQuery, durationMonthsFromQuery))
      setScreen('ready')
      setAuthError('')
      setCourseError('')
      setStatusNote('Choose a plan and continue to payment.')
      postMobileEvent('CHECKOUT_READY', {
        planCount: availablePlans.length,
      })
    } catch (error) {
      if (error instanceof PaymentApiError && error.status === 401) {
        tokenStore.clear()
        openOtpScreen('Sign in with your phone number to view plans.')
        return
      }

      setScreen('error')
      setPageError(getErrorMessage(error, 'Unable to load plans. Please try again.'))
    }
  }

  async function loadCourseOptions(message?: string) {
    try {
      setCourseLoading(true)
      const options = await apiFetch<CourseOptionsResponse>('/courses/options', {
        headers: {
          Accept: 'application/json',
        },
      })

      const preferredCourseId = getQueryParam(router.query.courseId)
      const normalizedCourses = sortCourseOptions(options.courses || [])
      const hasPreferredCourse = preferredCourseId
        ? normalizedCourses.some((course) => course.courseId === preferredCourseId)
        : false

      setCourseOptions(normalizedCourses)
      setCustomCourseOption(options.customCourseOption || null)
      setSelectedCourseChoice((currentChoice) => {
        const hasCurrentChoice =
          normalizedCourses.some((course) => course.courseId === currentChoice) ||
          currentChoice === options.customCourseOption?.key

        if (currentChoice && hasCurrentChoice) {
          return currentChoice
        }

        if (hasPreferredCourse && preferredCourseId) {
          return preferredCourseId
        }

        return normalizedCourses[0]?.courseId || options.customCourseOption?.key || ''
      })
      setScreen('course')
      setPageError('')
      setCourseError('')
      setStatusNote(message || 'Choose a course to continue.')
    } catch (error) {
      if (error instanceof PaymentApiError && error.status === 401) {
        tokenStore.clear()
        openOtpScreen('Sign in to continue with course selection.')
        return
      }

      setScreen('error')
      setPageError(getErrorMessage(error, 'Unable to load course options. Please try again.'))
    } finally {
      setCourseLoading(false)
    }
  }

  async function handleRequestOtp() {
    const storedCheckoutSession = getStoredCheckoutSession()

    if (storedCheckoutSession.orderId && storedCheckoutSession.claimToken) {
      setPaymentOrderId(storedCheckoutSession.orderId)
      setScreen('pending')
      setResult({
        title: 'Checking payment',
        message: 'We are checking your Razorpay payment status.',
        tone: 'warning',
      })
      await checkPaymentLinkStatus(storedCheckoutSession.orderId, true)
      return
    }

    setOtpLoading(true)
    setOtpAction('send')
    setAuthError('')

    try {
      await requestOtp(phone)
      setOtpRequested(true)
      setStatusNote('We sent an OTP to your phone number.')
    } catch (error) {
      setAuthError(getErrorMessage(error, 'Could not send OTP. Please try again.'))
    } finally {
      setOtpLoading(false)
      setOtpAction(null)
    }
  }

  async function handleVerifyOtp() {
    setOtpLoading(true)
    setOtpAction('verify')
    setAuthError('')

    try {
      const response = await verifyOtp(phone, otp)
      const accessToken = extractAccessToken(response)
      const refreshToken = extractRefreshToken(response)

      if (!accessToken) {
        throw new Error('Backend did not return an access token.')
      }

      tokenStore.setTokens({
        accessToken,
        refreshToken,
      })
      setAuthMode('bearer')
      postMobileEvent('AUTH_SUCCESS')
      if (isPrimaryPaymentLinksFlow && planIdFromQuery) {
        setScreen('ready')
        setOtpRequested(false)
        setOtp('')
        setStatusNote('Mobile verified. Complete billing to continue.')
        return
      }

      await loadPlans()
    } catch (error) {
      setAuthError(getErrorMessage(error, 'OTP verification failed. Please try again.'))
    } finally {
      setOtpLoading(false)
      setOtpAction(null)
    }
  }

  async function handleSaveCourseSelection() {
    if (!ensureAuthorization('Sign in with your phone number to choose a course.')) {
      return
    }

    if (!selectedCourseChoice) {
      setCourseError('Choose a course to continue.')
      return
    }

    if (selectedCourseChoice === customCourseOption?.key && !customCourseTitle.trim()) {
      setCourseError('Enter your exam name to continue.')
      return
    }

    setCourseLoading(true)
    setCourseError('')
    setStatusNote('Saving your course selection...')

    try {
      const body =
        selectedCourseChoice === customCourseOption?.key
          ? { selectedCourseTitle: customCourseTitle.trim() }
          : { selectedCourseId: selectedCourseChoice }

      await apiFetch('/me/settings', {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (accountSetupStep === 'course') {
        await Promise.allSettled([
          apiFetch('/me'),
          apiFetch('/me/courses'),
        ])
        setScreen('success')
        setShowSuccessModal(true)
        setResult({
          title: 'Access unlocked',
          message: 'Your account is ready and course access is active.',
          tone: 'success',
        })
        setStatusNote('Account setup completed successfully.')
        postMobileEvent('PAYMENT_SUCCESS', {
          status: 'success',
          courseId: selectedCourseChoice === customCourseOption?.key ? undefined : selectedCourseChoice,
        })
        return
      }

      await loadPlans()
    } catch (error) {
      if (error instanceof PaymentApiError && error.status === 401) {
        tokenStore.clear()
        openOtpScreen('Sign in again to save your course selection.')
        return
      }

      setCourseError(getErrorMessage(error, 'Unable to save your course. Please try again.'))
    } finally {
      setCourseLoading(false)
    }
  }

  async function handleApplyCoupon() {
    const nextCouponCode = normalizeCouponInput(couponCode)

    if (!selectedPlan) {
      setCouponError('Select a plan before applying a coupon.')
      return
    }

    if (!nextCouponCode) {
      setCouponError('Enter a coupon code to apply.')
      return
    }

    if (!isPrimaryPaymentLinksFlow && !ensureAuthorization('Sign in with your phone number to apply a coupon.')) {
      return
    }
    setCouponLoading(true)
    setCouponError('')
    setCouponMessage('')
    setPageError('')

    try {
      const requestPlanId = selectedPlan.planId
      const quoteEndpoint = getCouponPreviewEndpoint()
      const quote = await apiFetch<BillingQuoteResponse>(quoteEndpoint, {
        method: 'POST',
        skipAuth: quoteEndpoint === '/billing/plans/quote',
        body: JSON.stringify({
          planId: requestPlanId,
          couponCode: nextCouponCode,
        }),
      })

      if (selectedPlanIdRef.current !== requestPlanId) {
        return
      }

      setCouponQuote(quote)

      if (quote.couponStatus === 'APPLIED' && quote.isValidCoupon) {
        const appliedCode = quote.coupon?.code || nextCouponCode
        setAppliedCouponCode(appliedCode)
        setCouponCode(appliedCode)
        setCouponMessage(quote.message || 'Coupon applied.')
        return
      }

      setAppliedCouponCode('')
      setCouponError(quote.message || 'Coupon is not valid for this plan.')
    } catch (error) {
      if (
        error instanceof PaymentApiError &&
        error.status === 401 &&
        (!isPrimaryPaymentLinksFlow || sessionUser)
      ) {
        tokenStore.clear()
        setSessionUser(null)
        openOtpScreen('Sign in again to apply a coupon.')
        return
      }

      setAppliedCouponCode('')
      setCouponQuote(null)
      setCouponError(getErrorMessage(error, 'Could not apply coupon. Please try again.'))
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponCode('')
    setAppliedCouponCode('')
    setCouponQuote(null)
    setCouponMessage('')
    setCouponError('')
  }

  function handleSelectTrialOffer() {
    if (!shouldShowTrialOffer || !trialOffer) {
      return
    }

    if (trialOffer.course?.courseId) {
      setSelectedCourse(trialOffer.course)
      setSelectedCourseChoice(trialOffer.course.courseId)
    }

    if (sessionUser?.name) {
      setTrialName((current) => current || sessionUser.name || '')
    }

    setScreen('trial')
    setTrialOtp('')
    setTrialOtpStarted(false)
    setTrialError('')
    setTrialMessage('No payment will be collected. Your trial starts only after OTP verification.')
    setPageError('')
    setBillingError('')
    postMobileEvent('TRIAL_SELECTED', {
      code: trialOffer.code,
      durationHours: trialOffer.durationHours,
      courseId: trialOffer.course?.courseId,
    })
  }

  function returnToPaidCheckout() {
    setTrialOtp('')
    setTrialOtpStarted(false)
    setTrialError('')
    setTrialMessage('')

    if (selectedPlan) {
      setScreen('ready')
      return
    }

    setScreen('planSelect')
  }

  function handleTrialFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (trialOtpStarted) {
      void handleVerifyTrialOtp()
      return
    }

    void handleStartTrialOtp()
  }

  async function handleStartTrialOtp() {
    const contactPayload = getTrialContactPayload()

    if (!contactPayload) {
      return
    }

    setTrialLoading(true)
    setTrialAction('quote')
    setTrialError('')
    setTrialMessage('')

    try {
      const quote = await apiFetch<TrialQuoteResponse>('/billing/guest/trial/quote', {
        method: 'POST',
        body: JSON.stringify(contactPayload),
      })

      if (quote.eligibility?.eligible === false || isTrialFallbackCode(quote.eligibility?.code || quote.code)) {
        setTrialError(getTrialEligibilityMessage(quote))
        setTrialMessage('Paid checkout remains available.')
        setTrialOtpStarted(false)
        return
      }

      setTrialAction('send')

      await apiFetch('/billing/guest/trial/otp/start', {
        method: 'POST',
        body: JSON.stringify({
          ...contactPayload,
          channel: trialOtpChannel,
        }),
      })

      setTrialOtpStarted(true)
      setTrialMessage(`OTP sent by ${trialOtpChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}. Enter it to activate the 24-hour trial.`)
      postMobileEvent('TRIAL_OTP_SENT', {
        code: trialOffer?.code,
        channel: trialOtpChannel,
      })
    } catch (error) {
      if (isTrialPaidFallbackError(error)) {
        setTrialError(getTrialPaidFallbackMessage(error))
        setTrialMessage('Paid checkout remains available.')
        setTrialOtpStarted(false)
        return
      }

      setTrialError(getErrorMessage(error, 'Could not start the trial OTP. Please try again.'))
    } finally {
      setTrialLoading(false)
      setTrialAction(null)
    }
  }

  async function handleVerifyTrialOtp() {
    const contactPayload = getTrialContactPayload()
    const code = trialOtp.trim()

    if (!contactPayload) {
      return
    }

    if (code.length < 4) {
      setTrialError('Enter the OTP sent to your mobile number.')
      return
    }

    setTrialLoading(true)
    setTrialAction('verify')
    setTrialError('')
    setTrialMessage('')

    try {
      const completed = await apiFetch<TrialVerifyResponse>('/billing/guest/trial/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          ...contactPayload,
          gender: trialGender,
          code,
          privacyPolicyVersion,
        }),
      })
      const accessToken = extractAccessToken(completed)
      const refreshToken = extractRefreshToken(completed)

      if (!accessToken) {
        throw new Error('Trial activated, but the backend did not return an access token.')
      }

      tokenStore.setAccessToken(accessToken)

      if (refreshToken) {
        tokenStore.setRefreshToken(refreshToken)
      }

      const me = await apiFetch<any>('/me')
      await apiFetch('/me/courses')

      const nextSessionUser = extractSessionUser(me)
      setSessionUser(nextSessionUser)
      setAuthMode('bearer')

      const returnUrl = completed.returnUrl || getQueryParam(router.query.returnUrl)

      setTrialOtp('')
      setTrialOtpStarted(false)
      setTrialMessage('')
      setCheckoutLoading(false)
      setScreen('success')
      setShowSuccessModal(Boolean(returnUrl))
      setResult({
        title: '24-hour trial active',
        message: `Your ${trialCourseTitle} trial is active for ${trialOffer?.durationHours || 24} hours.`,
        tone: 'success',
        returnUrl,
      })
      setStatusNote('Trial activated successfully.')
      postMobileEvent('AUTH_SUCCESS', {
        accessToken,
        refreshToken,
      })
      postMobileEvent('TRIAL_SUCCESS', {
        status: 'success',
        accessToken,
        refreshToken,
        trialCode: trialOffer?.code,
        durationHours: trialOffer?.durationHours,
        courseId: trialOffer?.course?.courseId,
        returnUrl,
      })
      postMobileEvent('PAYMENT_SUCCESS', {
        status: 'success',
        accessType: 'trial',
        trialCode: trialOffer?.code,
        durationHours: trialOffer?.durationHours,
        courseId: trialOffer?.course?.courseId,
        returnUrl,
      })
    } catch (error) {
      if (isTrialPaidFallbackError(error)) {
        setTrialError(getTrialPaidFallbackMessage(error))
        setTrialMessage('Paid checkout remains available.')
        return
      }

      setTrialError(getErrorMessage(error, 'Could not verify the trial OTP. Please try again.'))
    } finally {
      setTrialLoading(false)
      setTrialAction(null)
    }
  }

  function getTrialContactPayload() {
    const name = trialName.trim() || sessionUser?.name?.trim() || ''

    if (!name) {
      setTrialError('Enter your name to continue.')
      return null
    }

    if (!trialGender) {
      setTrialError('Choose your gender.')
      return null
    }

    if (!trialTermsAccepted) {
      setTrialError('Accept the terms and privacy policy to continue.')
      return null
    }

    const payload: {
      planId?: string
      phoneE164?: string
      email?: string
      name: string
    } = {
      name,
    }
    const trialPlanId = selectedPlan?.planId

    if (trialPlanId) {
      payload.planId = trialPlanId
    }

    if (!sessionUser) {
      const validationError = validateBillingDetails(billingDetails, phone)

      if (validationError) {
        setTrialError(validationError)
        return null
      }

      try {
        const normalizedPhone = normalizeIndianPhone(phone)

        payload.phoneE164 = normalizedPhone.e164
        payload.email = billingDetails.email.trim().toLowerCase()
      } catch (error) {
        setTrialError(getErrorMessage(error, 'Enter a valid mobile number.'))
        return null
      }
    }

    return payload
  }

  function getCouponPreviewEndpoint() {
    if (!isPrimaryPaymentLinksFlow) {
      return '/billing/quote'
    }

    return sessionUser ? '/billing/payment-links/quote' : '/billing/plans/quote'
  }

  async function revalidatePaymentLinkCoupon(
    requestPlanId: string,
    validatedCouponCode: string,
    customerPayload: PaymentLinkCustomerPayload
  ) {
    const quote = await apiFetch<BillingQuoteResponse>(
      sessionUser ? '/billing/payment-links/quote' : '/billing/guest/payment-links/quote',
      {
        method: 'POST',
        skipAuth: !sessionUser,
        body: JSON.stringify({
          planId: requestPlanId,
          ...(!sessionUser ? customerPayload : {}),
          couponCode: validatedCouponCode,
        }),
      }
    )

    if (selectedPlanIdRef.current !== requestPlanId) {
      return false
    }

    setCouponQuote(quote)

    if (quote.couponStatus === 'APPLIED' && quote.isValidCoupon) {
      const appliedCode = quote.coupon?.code || validatedCouponCode
      setAppliedCouponCode(appliedCode)
      setCouponCode(appliedCode)
      setCouponMessage(quote.message || 'Coupon applied.')
      setCouponError('')
      return true
    }

    setAppliedCouponCode('')
    setCouponError(quote.message || 'Coupon is not valid for this customer.')
    setStatusNote('Coupon validation failed.')
    return false
  }

  async function handlePayNow() {
    if (!selectedPlan) {
      setPageError('Select a plan before continuing.')
      return
    }

    if (checkoutCourseOptions.length && !selectedCourse?.courseId) {
      setBillingError('Select your course to continue.')
      return
    }

    if (couponCode.trim() && !activeCouponCode) {
      setCouponError('Apply the coupon before continuing, or clear it.')
      return
    }

    if (isPrimaryPaymentLinksFlow) {
      await createPaymentLink()
      return
    }

    const validationError = validateBillingDetails(billingDetails, phone)

    if (validationError) {
      setBillingError(validationError)
      return
    }

    if (!ensureAuthorization('Sign in with your phone number to continue to payment.')) {
      return
    }

    if (paymentPhoneOtpRequired && otp.trim().length < 4) {
      setAuthError('Enter the OTP sent to your phone to continue.')
      return
    }

    setCheckoutLoading(true)
    setPageError('')
    setBillingError('')
    setResult(null)
    setStatusNote('Creating your Razorpay payment link...')

    try {
      const order = await apiFetch<BillingOrderResponse>('/billing/orders', {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlan.planId,
          courseId: selectedCourse?.courseId,
          couponCode: getCouponCodeForSubmit(activeCouponCode),
        }),
      })

      openPaymentDestination(order)
    } catch (error) {
      if (error instanceof PaymentApiError && error.status === 401) {
        tokenStore.clear()
        openOtpScreen('Sign in again to continue to payment.')
        setCheckoutLoading(false)
        return
      }

      setPageError(getErrorMessage(error, 'Could not create the payment order. Please try again.'))
      setCheckoutLoading(false)
      setStatusNote('Order creation failed.')
    }
  }

  async function createPaymentLink() {
    if (!selectedPlan) {
      setPageError('Select a plan before continuing.')
      return
    }

    const customerPayload = getPaymentLinkCustomerPayload()

    if (!customerPayload) {
      return
    }

    setCheckoutLoading(true)
    setPageError('')
    setAuthError('')
    setBillingError('')
    setResult(null)
    setStatusTimedOut(false)
    setStatusNote('Creating your Razorpay payment link...')

    try {
      const couponCodeForSubmit = getCouponCodeForSubmit(activeCouponCode)

      if (couponCodeForSubmit) {
        setStatusNote('Validating coupon for checkout...')
        const isCouponStillValid = await revalidatePaymentLinkCoupon(
          selectedPlan.planId,
          couponCodeForSubmit,
          customerPayload
        )

        if (!isCouponStillValid) {
          setCheckoutLoading(false)
          return
        }
      }

      setStatusNote('Creating your Razorpay payment link...')
      const created = await apiFetch<PaymentLinkCreateResponse>(
        sessionUser ? '/billing/payment-links' : '/billing/guest/payment-links',
        {
          method: 'POST',
          skipAuth: !sessionUser,
          body: JSON.stringify({
            planId: selectedPlan.planId,
            courseId: selectedCourse?.courseId,
            ...(!sessionUser ? customerPayload : {}),
            couponCode: couponCodeForSubmit,
          }),
        }
      )
      const paymentUrl = getPaymentLinkUrl(created)

      if (!paymentUrl) {
        setPageError('Backend did not return a Razorpay payment link. Please try again.')
        setCheckoutLoading(false)
        return
      }

      if (!created.order?.id || (!sessionUser && !created.checkout?.claimToken)) {
        setPageError('Checkout session is incomplete. Please retry payment from pricing.')
        setCheckoutLoading(false)
        return
      }

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(CHECKOUT_PAYMENT_ORDER_ID_KEY, created.order.id)
        window.sessionStorage.setItem(CHECKOUT_CLAIM_TOKEN_KEY, created.checkout?.claimToken || '')
        window.sessionStorage.setItem(CHECKOUT_PHONE_KEY, sessionUser?.phoneE164 || customerPayload.phoneE164 || '')
        window.sessionStorage.setItem(CHECKOUT_EMAIL_KEY, sessionUser?.email || customerPayload.email || '')
        window.sessionStorage.setItem(
          CHECKOUT_ACCOUNT_EXISTS_KEY,
          Boolean(created.customer?.accountExists || sessionUser) ? '1' : '0'
        )
        window.sessionStorage.setItem(CHECKOUT_SESSION_USER_KEY, sessionUser ? '1' : '0')
      }

      postMobileEvent('OPEN_PAYMENT_LINK', {
        planId: selectedPlan.planId,
        orderId: created.order?.id,
        paymentLink: paymentUrl,
      })
      window.location.assign(paymentUrl)
    } catch (error) {
      const errorCode = getPaymentErrorCode(error)

      if (error instanceof PaymentApiError && error.status === 401 && sessionUser) {
        tokenStore.clear()
        setSessionUser(null)
        openOtpScreen('Sign in again to continue to payment.')
        setCheckoutLoading(false)
        return
      }

      if (error instanceof PaymentApiError && error.status === 404) {
        setPageError('Selected plan is no longer available. Please return to pricing and choose again.')
        if (planIdFromQuery) {
          void loadPublicPlanForPayment(planIdFromQuery)
        }
        setCheckoutLoading(false)
        return
      }

      if (errorCode === 'EMAIL_ALREADY_IN_USE') {
        setPageError('This email already has an account. Use that account or choose another email.')
        setCheckoutLoading(false)
        return
      }

      if (errorCode === 'PHONE_EMAIL_MISMATCH') {
        setPageError('This phone number is linked to another email. Use the existing email for this phone.')
        setCheckoutLoading(false)
        return
      }

      if (errorCode?.startsWith('COUPON_')) {
        setCouponError(getErrorMessage(error, 'Coupon is not valid for this plan.'))
        setCheckoutLoading(false)
        return
      }

      setPageError(
        errorCode === 'PAYMENT_LINK_CREATE_FAILED'
          ? 'Could not create the Razorpay payment link. Please retry.'
          : getErrorMessage(error, 'Could not create the payment link. Please try again.')
      )
      setCheckoutLoading(false)
      setStatusNote('Payment link creation failed.')
    }
  }

  function openPaymentDestination(order: BillingOrderResponse) {
    const paymentLink = getDirectPaymentLink(order)

    if (paymentLink && typeof window !== 'undefined') {
      setStatusNote('Opening Razorpay payment page...')
      postMobileEvent('OPEN_PAYMENT_LINK', {
        planId: order.plan?.planId,
        orderId: order.order?.id || order.orderId,
        paymentLink,
      })
      window.location.assign(paymentLink)
      return
    }

    if (!razorpayReady || typeof window === 'undefined' || !window.Razorpay) {
      setPageError('Payment link was not returned and Razorpay Checkout is still loading. Please try again in a moment.')
      setCheckoutLoading(false)
      return
    }

    openRazorpayCheckout(order)
  }

  function openRazorpayCheckout(order: BillingOrderResponse) {
    const checkout = new window.Razorpay({
      key: order.keyId || order.razorpay.keyId,
      order_id: order.orderId || order.razorpay.orderId,
      amount: order.amount || order.razorpay.amountPaise,
      currency: order.currency || order.razorpay.currency,
      name: 'Virtual Library',
      description: `${getCheckoutCourseTitle(order.course.title)} • ${order.plan.name}`,
      prefill: {
        name: order.user?.name,
        email: order.user?.email,
        contact: order.user?.phoneE164,
      },
      theme: {
        color: '#6b21a8',
      },
      handler: async (response: RazorpaySuccessResponse) => {
        await handleVerifyPayment(order, response)
      },
      modal: {
        ondismiss: () => {
          setCheckoutLoading(false)
          setStatusNote('Checkout dismissed. You can retry whenever you are ready.')
          postMobileEvent('PAYMENT_CANCELLED', {
            planId: order.plan.planId,
            orderId: order.order.id,
          })
        },
      },
    })

    checkout.on('payment.failed', (response: any) => {
      setCheckoutLoading(false)
      setScreen('failed')
      setResult({
        title: 'Payment failed',
        message: response?.error?.description || 'Razorpay could not complete the payment.',
        tone: 'danger',
      })
      postMobileEvent('PAYMENT_FAILED', {
        reason: response?.error?.description,
      })
    })

    setStatusNote('Opening secure checkout...')
    checkout.open()
  }

  async function handleVerifyPayment(order: BillingOrderResponse, response: RazorpaySuccessResponse) {
    setScreen('processing')
    setStatusNote('Verifying your payment...')

    try {
      const verification = await apiFetch<BillingVerifyResponse>('/billing/verify', {
        method: 'POST',
        body: JSON.stringify({
          planId: order.plan.planId,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }),
      })

      if (verification.status === 'COMPLETED') {
        await Promise.allSettled([
          apiFetch('/me/courses'),
          apiFetch('/me'),
        ])

        setCheckoutLoading(false)
        setScreen('success')
        setShowSuccessModal(true)
        setResult({
          title: 'Access unlocked',
          message: `Payment confirmed for ${getCheckoutCourseTitle(order.course.title)}. You can continue in the app or stay on this page.`,
          tone: 'success',
          returnUrl: verification.returnUrl,
        })
        setStatusNote('Payment completed successfully.')
        postMobileEvent('PAYMENT_SUCCESS', {
          status: 'success',
          planId: order.plan.planId,
          courseId: order.course.courseId,
          paymentStatus: verification.paymentStatus,
          returnUrl: verification.returnUrl,
          redirectUrl: getReturnTarget(verification.returnUrl, 'success'),
        })
        return
      }

      if (verification.status === 'PENDING') {
        setCheckoutLoading(false)
        setScreen('pending')
        setResult({
          title: 'Payment is being processed',
          message: 'We received your payment response, but final confirmation is still in progress.',
          tone: 'warning',
          returnUrl: verification.returnUrl,
        })
        setStatusNote('Waiting for final confirmation...')
        postMobileEvent('PAYMENT_PENDING', {
          status: 'pending',
          planId: order.plan.planId,
          courseId: order.course.courseId,
          paymentStatus: verification.paymentStatus,
          returnUrl: verification.returnUrl,
          redirectUrl: getReturnTarget(verification.returnUrl, 'pending'),
        })
        scheduleReturnToApp(verification.returnUrl, 'pending')
        startPendingAccessPoll({
          courseId: order.course.courseId,
          slug: order.course.slug,
          returnUrl: verification.returnUrl,
        })
        return
      }

      setCheckoutLoading(false)
      setScreen('failed')
      setResult({
        title: 'Payment verification failed',
        message: verification.message || 'We could not verify the payment with Razorpay.',
        tone: 'danger',
        returnUrl: verification.returnUrl,
      })
      setStatusNote('Verification failed.')
      postMobileEvent('PAYMENT_FAILED', {
        status: 'failed',
        planId: order.plan.planId,
        courseId: order.course.courseId,
        paymentStatus: verification.paymentStatus,
        returnUrl: verification.returnUrl,
        redirectUrl: getReturnTarget(verification.returnUrl, 'failed'),
      })
      scheduleReturnToApp(verification.returnUrl, 'failed')
    } catch (error) {
      if (error instanceof PaymentApiError && error.status === 401) {
        tokenStore.clear()
        openOtpScreen('Sign in again to refresh your payment status.')
        setCheckoutLoading(false)
        return
      }

      setCheckoutLoading(false)
      setScreen('failed')
      setResult({
        title: 'Verification failed',
        message: getErrorMessage(error, 'We could not confirm the payment. Please try again.'),
        tone: 'danger',
      })
      setStatusNote('Verification failed.')
    }
  }

  function startPendingAccessPoll(context: { courseId?: string; slug?: string; returnUrl?: string }) {
    if (pendingPollRef.current) {
      window.clearInterval(pendingPollRef.current)
    }

    let attempts = 0
    pendingPollRef.current = window.setInterval(async () => {
      attempts += 1

      try {
        const access = await apiFetch('/me/courses')

        if (hasGrantedCourseAccess(access, context)) {
          if (pendingPollRef.current) {
            window.clearInterval(pendingPollRef.current)
            pendingPollRef.current = null
          }

          setScreen('success')
          setShowSuccessModal(true)
          setResult({
            title: 'Access unlocked',
            message: 'Your course access is active now.',
            tone: 'success',
            returnUrl: context.returnUrl,
          })
          setStatusNote('Payment completed successfully.')
          postMobileEvent('PAYMENT_SUCCESS', {
            status: 'success',
            courseId: context.courseId,
            returnUrl: context.returnUrl,
            redirectUrl: getReturnTarget(context.returnUrl, 'success'),
          })
          return
        }
      } catch {
        // Best-effort polling while the payment is pending.
      }

      if (attempts >= 8 && pendingPollRef.current) {
        window.clearInterval(pendingPollRef.current)
        pendingPollRef.current = null
      }
    }, 3000)
  }

  async function handlePaymentLinkResult(paymentStatus: string) {
    const normalizedStatus = paymentStatus.toLowerCase()
    const storedCheckoutSession = getStoredCheckoutSession()
    const orderIdFromQuery = getQueryParam(router.query.orderId)
    const storedOrderId = typeof window !== 'undefined'
      ? storedCheckoutSession.orderId || window.sessionStorage.getItem(LEGACY_PAYMENT_ORDER_ID_KEY) || ''
      : ''
    const nextPaymentOrderId = orderIdFromQuery || storedOrderId

    setPaymentOrderId(nextPaymentOrderId)
    setCheckoutLoading(false)
    setStatusTimedOut(false)

    if (storedCheckoutSession.claimToken && !storedCheckoutSession.sessionUser && (normalizedStatus === 'success' || normalizedStatus === 'captured')) {
      setScreen('pending')
      setResult({
        title: 'Checking payment',
        message: 'Payment succeeded. We are preparing account setup.',
        tone: 'warning',
      })

      if (nextPaymentOrderId) {
        await checkPaymentLinkStatus(nextPaymentOrderId, true)
        return
      }

      await openAccountSetup(nextPaymentOrderId)
      return
    }

    if (normalizedStatus === 'account_setup_required') {
      await openAccountSetup(nextPaymentOrderId)
      return
    }

    if (normalizedStatus === 'success') {
      await Promise.allSettled([
        apiFetch('/me/courses'),
        apiFetch('/me'),
      ])
      if (storedCheckoutSession.sessionUser) {
        clearStoredCheckoutSession()
      }

      setScreen('success')
      setShowSuccessModal(true)
      setResult({
        title: 'Access unlocked',
        message: 'Payment confirmed successfully. Your course access is being refreshed.',
        tone: 'success',
      })
      setStatusNote('Payment completed successfully.')
      postMobileEvent('PAYMENT_SUCCESS', {
        status: 'success',
        orderId: nextPaymentOrderId,
      })
      return
    }

    if (normalizedStatus === 'pending') {
      setScreen('pending')
      setResult({
        title: 'Payment is being processed',
        message: nextPaymentOrderId
          ? 'Razorpay has returned a pending status. We are checking for final confirmation.'
          : 'Razorpay has returned a pending status. Use refresh after a moment if access is not active.',
        tone: 'warning',
      })
      setStatusNote('Waiting for final confirmation...')

      if (nextPaymentOrderId) {
        startPaymentLinkStatusPoll(nextPaymentOrderId)
      }
      return
    }

    if (nextPaymentOrderId) {
      setScreen('pending')
      setResult({
        title: 'Checking payment',
        message: 'Razorpay returned a failure callback, but we are verifying the final payment status before marking it failed.',
        tone: 'warning',
      })
      setStatusNote('Checking payment status...')

      const resolved = await checkPaymentLinkStatus(nextPaymentOrderId, true)

      if (!resolved) {
        startPaymentLinkStatusPoll(nextPaymentOrderId)
      }

      return
    }

    setScreen('failed')
    setResult({
      title: 'Payment failed',
      message: 'Razorpay could not complete this payment. You can return to pricing and try again.',
      tone: 'danger',
    })
    setStatusNote('Payment failed.')
    postMobileEvent('PAYMENT_FAILED', {
      status: 'failed',
      orderId: nextPaymentOrderId,
    })
  }

  function startPaymentLinkStatusPoll(orderId: string) {
    if (pendingPollRef.current) {
      window.clearInterval(pendingPollRef.current)
    }

    let attempts = 0
    pendingPollRef.current = window.setInterval(() => {
      attempts += 1

      void checkPaymentLinkStatus(orderId, false)

      if (attempts >= 30 && pendingPollRef.current) {
        window.clearInterval(pendingPollRef.current)
        pendingPollRef.current = null
        setStatusTimedOut(true)
        setResult({
          title: 'Still checking payment',
          message: 'Confirmation is taking longer than usual. You can check again manually.',
          tone: 'warning',
        })
      }
    }, 2000)
  }

  async function checkPaymentLinkStatus(orderId: string, manual: boolean) {
    if (!orderId) {
      setPageError('Payment order id is missing. Please reopen checkout from pricing.')
      return false
    }

    if (manual) {
      setStatusTimedOut(false)
      setStatusNote('Checking payment status...')
    }

    try {
      const storedCheckoutSession = getStoredCheckoutSession()
      const claimToken = getCheckoutClaimToken()
      const isStoredSessionCheckout = storedCheckoutSession.sessionUser
      const canCheckAuthenticatedStatus =
        isStoredSessionCheckout || Boolean(tokenStore.getAccessToken()) || authMode === 'cookie'

      if (isPrimaryPaymentLinksFlow && !claimToken && !canCheckAuthenticatedStatus) {
        setScreen('error')
        setPageError('Checkout session could not be verified. Please contact support with your payment id.')
        return false
      }
      const status = claimToken
        ? await apiFetch<PaymentLinkStatusResponse>('/billing/guest/payment-links/status', {
          method: 'POST',
          skipAuth: true,
          body: JSON.stringify({
            paymentOrderId: orderId,
            claimToken,
          }),
        })
        : await apiFetch<PaymentLinkStatusResponse>(`/billing/payment-links/status/${orderId}`, {
          headers: {
            Accept: 'application/json',
          },
        })
      const normalizedOrderStatus = status.status?.toUpperCase()
      const normalizedPaymentStatus = status.paymentStatus?.toUpperCase()
      const isGuestCheckout = Boolean(claimToken)
      const captured = normalizedOrderStatus === 'CAPTURED' || normalizedPaymentStatus === 'CAPTURED'
      const needsAccountSetup =
        isGuestCheckout &&
        !status.accessGranted &&
        (normalizedOrderStatus === 'ACCOUNT_SETUP_REQUIRED' || status.accountSetupRequired || captured)
      const completed = status.accessGranted || (!isGuestCheckout && (normalizedOrderStatus === 'COMPLETED' || captured))
      const failed = normalizedOrderStatus === 'FAILED' || normalizedPaymentStatus === 'FAILED'

      if (needsAccountSetup) {
        if (pendingPollRef.current) {
          window.clearInterval(pendingPollRef.current)
          pendingPollRef.current = null
        }

        await openAccountSetup(orderId)
        return true
      }

      if (completed) {
        if (pendingPollRef.current) {
          window.clearInterval(pendingPollRef.current)
          pendingPollRef.current = null
        }

        await Promise.allSettled([
          apiFetch('/me/courses'),
          apiFetch('/me'),
        ])
        if (storedCheckoutSession.sessionUser) {
          clearStoredCheckoutSession()
        }

        setScreen('success')
        setShowSuccessModal(true)
        setResult({
          title: 'Access unlocked',
          message: 'Payment confirmed successfully. Your course access is active.',
          tone: 'success',
        })
        setStatusNote('Payment completed successfully.')
        postMobileEvent('PAYMENT_SUCCESS', {
          status: 'success',
          orderId,
          providerPaymentId: status.order?.providerPaymentId,
        })
        return true
      }

      if (failed) {
        if (pendingPollRef.current) {
          window.clearInterval(pendingPollRef.current)
          pendingPollRef.current = null
        }

        setScreen('failed')
        setResult({
          title: 'Payment failed',
          message: status.message || 'Razorpay could not complete this payment.',
          tone: 'danger',
        })
        setStatusNote('Payment failed.')
        postMobileEvent('PAYMENT_FAILED', {
          status: 'failed',
          orderId,
        })
        return true
      }

      if (manual) {
        setResult({
          title: 'Payment still pending',
          message: status.message || 'Final confirmation is still in progress. Please check again shortly.',
          tone: 'warning',
        })
      }

      return false
    } catch (error) {
      if (manual) {
        setPageError(getErrorMessage(error, 'Unable to check payment status. Please try again.'))
      }

      return false
    }
  }

  function getCheckoutClaimToken() {
    if (typeof window === 'undefined') {
      return ''
    }

    return window.sessionStorage.getItem(CHECKOUT_CLAIM_TOKEN_KEY) || ''
  }

  function getStoredCheckoutSession() {
    if (typeof window === 'undefined') {
      return {
        orderId: '',
        claimToken: '',
        phoneE164: '',
        email: '',
        accountExists: false,
        sessionUser: false,
      }
    }

    return {
      orderId: window.sessionStorage.getItem(CHECKOUT_PAYMENT_ORDER_ID_KEY) || '',
      claimToken: window.sessionStorage.getItem(CHECKOUT_CLAIM_TOKEN_KEY) || '',
      phoneE164: window.sessionStorage.getItem(CHECKOUT_PHONE_KEY) || '',
      email: window.sessionStorage.getItem(CHECKOUT_EMAIL_KEY) || '',
      accountExists: window.sessionStorage.getItem(CHECKOUT_ACCOUNT_EXISTS_KEY) === '1',
      sessionUser: window.sessionStorage.getItem(CHECKOUT_SESSION_USER_KEY) === '1',
    }
  }

  function clearStoredCheckoutSession() {
    if (typeof window === 'undefined') {
      return
    }

    window.sessionStorage.removeItem(CHECKOUT_PAYMENT_ORDER_ID_KEY)
    window.sessionStorage.removeItem(CHECKOUT_CLAIM_TOKEN_KEY)
    window.sessionStorage.removeItem(CHECKOUT_PHONE_KEY)
    window.sessionStorage.removeItem(CHECKOUT_EMAIL_KEY)
    window.sessionStorage.removeItem(CHECKOUT_ACCOUNT_EXISTS_KEY)
    window.sessionStorage.removeItem(CHECKOUT_SESSION_USER_KEY)
  }

  async function openAccountSetup(orderId: string) {
    const claimToken = getCheckoutClaimToken()

    if (!orderId || !claimToken) {
      setScreen('error')
      setPageError('Checkout session could not be verified. Please contact support with your payment id.')
      setResult({
        title: 'Checkout session expired',
        message: 'The payment is captured, but this browser no longer has the claim token needed to complete setup.',
        tone: 'danger',
      })
      postMobileEvent('PAYMENT_FAILED', {
        status: 'claim_invalid',
        orderId,
      })
      return
    }

    setPaymentOrderId(orderId)
    setAccountSetupStep('profile')
    setScreen('accountSetup')
    setCheckoutLoading(false)
    setStatusNote('Complete account setup to activate access.')
    setResult({
      title: 'Payment confirmed',
      message: 'Verify your phone and complete your profile to activate course access.',
      tone: 'success',
    })

    if (!accountOtpStarted) {
      await startCheckoutOtp(orderId, claimToken)
    }
  }

  async function startCheckoutOtp(orderId = paymentOrderId, claimToken = getCheckoutClaimToken()) {
    if (!orderId || !claimToken) {
      setAccountError('Checkout session is missing. Please contact support with your payment id.')
      return
    }

    setAccountSetupLoading(true)
    setAccountError('')

    try {
      await apiFetch('/auth/checkout/otp/start', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          paymentOrderId: orderId,
          claimToken,
          channel: 'sms',
        }),
      })
      setAccountOtpStarted(true)
      setStatusNote('OTP sent for checkout verification.')
    } catch (error) {
      setAccountError(getAccountSetupErrorMessage(error, 'Could not send OTP. Please try again.'))
    } finally {
      setAccountSetupLoading(false)
    }
  }

  async function handleCompleteAccountSetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = accountName.trim()
    const age = Number(accountAge)
    const code = accountOtp.trim()
    const claimToken = getCheckoutClaimToken()
    const storedCheckoutSession = getStoredCheckoutSession()
    const isExistingAccountCheckout = storedCheckoutSession.accountExists

    if (!paymentOrderId || !claimToken) {
      setAccountError('Checkout session is missing. Please contact support with your payment id.')
      return
    }

    if (!code || code.length < 4) {
      setAccountError('Enter the OTP sent to your mobile number.')
      return
    }

    if (!isExistingAccountCheckout && !name) {
      setAccountError('Enter your name to continue.')
      return
    }

    if (!isExistingAccountCheckout && (!Number.isFinite(age) || age < 10 || age > 99)) {
      setAccountError('Enter a valid age.')
      return
    }

    if (!isExistingAccountCheckout && !accountGender) {
      setAccountError('Choose your gender.')
      return
    }

    if (!isExistingAccountCheckout && !accountTermsAccepted) {
      setAccountError('Accept the terms and privacy policy to continue.')
      return
    }

    setAccountSetupLoading(true)
    setAccountError('')

    try {
      const completed = await apiFetch<CheckoutOtpVerifyResponse>('/auth/checkout/otp/verify', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          paymentOrderId,
          claimToken,
          code,
          name: isExistingAccountCheckout ? undefined : name,
          gender: isExistingAccountCheckout ? undefined : accountGender,
          privacyPolicyVersion: privacyPolicyVersion || undefined,
        }),
      })

      tokenStore.setTokens({
        accessToken: completed.accessToken,
        refreshToken: completed.refreshToken,
      })

      if (!completed.accessToken) {
        throw new Error('Account setup completed, but the backend did not return an access token.')
      }

      clearStoredCheckoutSession()

      await Promise.allSettled([
        apiFetch('/me'),
        apiFetch('/me/courses'),
      ])

      if (isExistingAccountCheckout) {
        setAuthMode('bearer')
        setScreen('success')
        setShowSuccessModal(false)
        setResult({
          title: 'Access unlocked',
          message: 'Your account is verified and course access is active.',
          tone: 'success',
        })
        setStatusNote('Account verified successfully.')
        postMobileEvent('PAYMENT_SUCCESS', {
          status: 'success',
          orderId: paymentOrderId,
        })
        return
      }

      setAuthMode('bearer')
      setAccountSetupStep('course')
      setAccountOtp('')
      setAccountOtpStarted(false)
      await loadCourseOptions('Choose your course to finish setup.')
    } catch (error) {
      setAccountError(getAccountSetupErrorMessage(error, 'Could not complete account setup. Please try again.'))
    } finally {
      setAccountSetupLoading(false)
    }
  }

  function getReturnTarget(returnUrl: string | undefined, status: 'success' | 'pending' | 'failed') {
    if (!returnUrl) {
      return null
    }

    return buildReturnUrl(returnUrl, status)
  }

  function scheduleReturnToApp(returnUrl: string | undefined, status: 'success' | 'pending' | 'failed') {
    const targetUrl = getReturnTarget(returnUrl, status)

    if (!targetUrl) {
      return
    }

    if (deepLinkTimeoutRef.current) {
      window.clearTimeout(deepLinkTimeoutRef.current)
    }

    postMobileEvent('OPEN_RETURN_URL', {
      status,
      returnUrl,
      redirectUrl: targetUrl,
    })

    deepLinkTimeoutRef.current = window.setTimeout(() => {
      window.location.assign(targetUrl)
    }, 600)
  }

  function handleReturnToApp(status: 'success' | 'pending' | 'failed') {
    if (!result?.returnUrl) {
      return
    }

    scheduleReturnToApp(result.returnUrl, status)
  }

  function handleCloseSuccessModal() {
    setShowSuccessModal(false)

    if (result?.returnUrl) {
      handleReturnToApp('success')
      return
    }

    if (shouldUseV2WebFallback) {
      void router.push({
        pathname: '/v2/neet-pg/access',
        query: {
          status: 'success',
        },
      })
    }
  }

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    void router.push('/')
  }

  function getCheckoutCourseTitle(title?: string | null) {
    if (shouldUseV2WebFallback) {
      return 'Virtual Library Access'
    }

    return title || 'Virtual Library'
  }

  function handleSelectCourseGroup(courseId: string) {
    const nextCourse = checkoutCourseOptions.find((course) => course.courseId === courseId)
    const nextGroup = groupedPlans.find((group) => group.course.courseId === courseId)

    if (!nextCourse && !nextGroup) {
      return
    }

    const requestedDurationMonths = selectedPlan?.durationMonths || getQueryNumber(router.query.durationMonths)

    setSelectedCourse(nextCourse || nextGroup?.course || null)
    setSelectedCourseChoice(courseId)

    if (nextGroup) {
      setSelectedPlanId(getDefaultPlanId(nextGroup.plans, undefined, requestedDurationMonths))
    }

    setPageError('')
    setBillingError('')
  }

  async function handleSelectPublicPlan(plan: BillingPlan) {
    setSelectedPlanId(plan.planId)
    setScreen('booting')
    setStatusNote('Loading selected plan...')
    await router.push({
      pathname: '/payment',
      query: {
        planId: plan.planId,
      },
    }, undefined, { scroll: false })
  }

  function getCheckoutActionState(): CheckoutActionState | null {
    if (
      screen === 'booting' ||
      screen === 'planSelect' ||
      screen === 'otp' ||
      screen === 'course' ||
      screen === 'trial' ||
      screen === 'accountSetup' ||
      screen === 'error' ||
      screen === 'success'
    ) {
      return null
    }

    let label = 'Continue to secure payment'
    let disabled = false
    let onClick: (() => void) | undefined = undefined
    let showArrow = false

    if (screen === 'processing') {
      label = 'Verifying payment...'
      disabled = true
    } else if (screen === 'pending') {
      label = result?.returnUrl ? 'Return to app' : 'Payment pending'
      disabled = !result?.returnUrl
      onClick = result?.returnUrl ? () => handleReturnToApp('pending') : undefined
    } else if (screen === 'failed') {
      label = checkoutPricing ? `Retry payment ${formatCurrency(checkoutPricing.finalAmountPaise, checkoutPricing.currency)}` : 'Retry payment'
      disabled = checkoutLoading || !razorpayReady
      onClick = handlePayNow
      showArrow = true
    } else {
      label = checkoutLoading
        ? 'Preparing checkout...'
        : checkoutPricing
          ? `Continue to pay ${formatCurrency(checkoutPricing.finalAmountPaise, checkoutPricing.currency)}`
          : 'Continue to pay'
      disabled = checkoutLoading || !razorpayReady || !selectedPlan || !canRetryCheckout
      onClick = handlePayNow
      showArrow = true
    }

    return {
      disabled,
      label,
      onClick,
      showArrow,
    }
  }

  function handleCheckoutFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (screen === 'otp') {
      if (otpRequested) {
        void handleVerifyOtp()
        return
      }

      void handleRequestOtp()
      return
    }

    void handlePayNow()
  }

  function getPrimaryActionLabel() {
    if (paymentPhoneOtpRequired) {
      return checkoutLoading ? 'Verifying phone...' : 'Verify and start learning'
    }

    if (screen === 'otp') {
      if (otpRequested) {
        return otpLoading && otpAction === 'verify' ? 'Verifying OTP...' : 'Verify OTP'
      }

      return otpLoading && otpAction === 'send' ? 'Sending OTP...' : 'Send OTP'
    }

    if (screen === 'processing') {
      return 'Verifying payment...'
    }

    if (screen === 'pending') {
      return result?.returnUrl ? 'Return to app' : 'Payment pending'
    }

    return checkoutLoading ? 'Opening Razorpay...' : 'Pay & Start Learning'
  }

  function isPrimaryActionDisabled() {
    if (screen === 'otp') {
      return otpLoading || phone.trim().length < 10 || (otpRequested && otp.trim().length < 4)
    }

    if (isPrimaryPaymentLinksFlow && !sessionUser) {
      return (
        checkoutLoading ||
        screen === 'processing' ||
        screen === 'pending' ||
        !selectedPlan ||
        phone.trim().length < 10 ||
        !billingDetails.email.trim()
      )
    }

    return (
      checkoutLoading ||
      screen === 'processing' ||
      screen === 'pending' ||
      !selectedPlan ||
      (!isPrimaryPaymentLinksFlow && !razorpayReady) ||
      (paymentPhoneOtpRequired && otp.trim().length < 4)
    )
  }

  function renderAccountSetup() {
    const storedCheckoutSession = getStoredCheckoutSession()
    const isExistingAccountCheckout = storedCheckoutSession.accountExists

    return (
      <div className="mx-auto flex min-h-[58vh] max-w-xl items-center">
        <form
          onSubmit={handleCompleteAccountSetup}
          className="w-full rounded-3xl border border-purple-100 bg-white p-5 text-slate-950 shadow-[0_18px_48px_rgba(107,33,168,0.10)] sm:p-6"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#6b21a8]">
            {isExistingAccountCheckout ? 'Verify account' : 'Complete account setup'}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            {isExistingAccountCheckout ? 'Verify your account' : 'Activate your account'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isExistingAccountCheckout
              ? `Enter the OTP sent to ${formatStoredPhoneLabel(storedCheckoutSession.phoneE164)} to unlock your paid access.`
              : `Enter the OTP sent to ${formatStoredPhoneLabel(storedCheckoutSession.phoneE164)} and complete your profile.`}
          </p>

          <div className="mt-5">
            <InputField
              label="OTP code"
              value={accountOtp}
              onChange={(value) => {
                setAccountOtp(value.replace(/\D/g, '').slice(0, 6))
                setAccountError('')
              }}
              inputMode="numeric"
              disabled={accountSetupLoading}
            />
          </div>

          {!isExistingAccountCheckout && (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <InputField
                    label="Full name"
                    value={accountName}
                    onChange={(value) => {
                      setAccountName(value)
                      setAccountError('')
                    }}
                    disabled={accountSetupLoading}
                  />
                </div>
                <InputField
                  label="Age"
                  value={accountAge}
                  onChange={(value) => {
                    setAccountAge(value.replace(/\D/g, '').slice(0, 2))
                    setAccountError('')
                  }}
                  inputMode="numeric"
                  disabled={accountSetupLoading}
                />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Gender</span>
                  <select
                    value={accountGender}
                    onChange={(event) => {
                      setAccountGender(event.target.value as AccountGender)
                      setAccountError('')
                    }}
                    disabled={accountSetupLoading}
                    className="h-[47px] w-full rounded-2xl border border-purple-100 bg-white px-3 text-sm text-slate-900 shadow-[0_8px_18px_rgba(107,33,168,0.05)] outline-none transition focus:border-[#6b21a8] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <option value="">Select</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="NON_BINARY">Non-binary</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </label>
              </div>

              <label className="mt-5 flex items-start gap-3 text-sm leading-5 text-slate-600">
                <input
                  type="checkbox"
                  checked={accountTermsAccepted}
                  onChange={(event) => {
                    setAccountTermsAccepted(event.target.checked)
                    setAccountError('')
                  }}
                  disabled={accountSetupLoading}
                  className="mt-0.5 h-4 w-4 rounded border-purple-200 text-[#6b21a8] focus:ring-[#6b21a8]"
                />
                <span>
                  I accept the{' '}
                  <a href="/terms-and-conditions" className="font-semibold text-[#6b21a8] hover:underline">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="/privacy-policy" className="font-semibold text-[#6b21a8] hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            </>
          )}

          <div className="mt-5 space-y-3">
            {accountError && <MessageBanner tone="danger">{accountError}</MessageBanner>}
            {!accountError && accountOtpStarted && (
              <MessageBanner tone="success">OTP sent to the phone number used for checkout.</MessageBanner>
            )}
          </div>

          <button
            type="submit"
            disabled={accountSetupLoading}
            className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#6b21a8] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(107,33,168,0.18)] transition hover:bg-[#581c87] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {accountSetupLoading
              ? isExistingAccountCheckout ? 'Verifying account...' : 'Completing setup...'
              : isExistingAccountCheckout ? 'Verify and unlock access' : 'Complete account setup'}
          </button>

          <button
            type="button"
            onClick={() => void startCheckoutOtp()}
            disabled={accountSetupLoading}
            className="mt-3 w-full rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm font-semibold text-[#6b21a8] transition hover:border-[#6b21a8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {accountSetupLoading ? 'Please wait...' : 'Resend OTP'}
          </button>
        </form>
      </div>
    )
  }

  function renderTrialForm() {
    const disabled = trialLoading
    const showContactFields = !sessionUser
    const primaryDisabled =
      disabled ||
      !trialOffer ||
      (!showContactFields ? false : phone.trim().length < 10 || !billingDetails.email.trim()) ||
      !(trialName.trim() || sessionUser?.name?.trim()) ||
      !trialGender ||
      !trialTermsAccepted ||
      (trialOtpStarted && trialOtp.trim().length < 4)
    const primaryLabel = trialOtpStarted
      ? trialLoading && trialAction === 'verify'
        ? 'Verifying OTP...'
        : 'Verify OTP and activate trial'
      : trialLoading && trialAction === 'quote'
        ? 'Checking eligibility...'
        : trialLoading && trialAction === 'send'
          ? 'Sending OTP...'
          : 'Send OTP for trial'

    return (
      <div className="space-y-3">
        <TrialOfferCard
          compact
          courseTitle={trialCourseTitle}
          offer={trialOffer}
        />

        <form onSubmit={handleTrialFormSubmit} className="space-y-2.5 text-[#211536]">
          <section className="rounded-[22px] border border-[#c8f4df] bg-white p-3.5 shadow-[0_18px_42px_rgba(12,121,85,0.10)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0f8f64]">
                Trial activation
              </p>
              <p className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-black text-[#047857]">
                No Razorpay
              </p>
            </div>

            <div className="grid gap-2">
              {showContactFields ? (
                <>
                  <InputField
                    label="Mobile number"
                    hint="+91"
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(value) => {
                      setPhone(value.replace(/\D/g, '').slice(0, 10))
                      setTrialError('')
                      setBillingError('')
                    }}
                    inputMode="numeric"
                    disabled={disabled || trialOtpStarted}
                  />
                  <InputField
                    label="Email address"
                    placeholder="you@email.com"
                    value={billingDetails.email}
                    onChange={(value) => {
                      updateBillingField('email', value)
                      setTrialError('')
                    }}
                    inputMode="email"
                    disabled={disabled || trialOtpStarted}
                  />
                </>
              ) : (
                <SessionCustomerCard user={sessionUser} />
              )}

              <InputField
                label="Full name"
                value={trialName}
                onChange={(value) => {
                  setTrialName(value)
                  setTrialError('')
                }}
                disabled={disabled}
              />

              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-[#4f465e]">Gender</span>
                <div className="relative">
                  <select
                    value={trialGender}
                    onChange={(event) => {
                      setTrialGender(event.target.value as AccountGender)
                      setTrialError('')
                    }}
                    disabled={disabled}
                    className="h-10 w-full appearance-none rounded-[14px] border border-[#e8e2ee] bg-white px-3 pr-9 text-sm font-semibold text-[#211536] outline-none transition focus:border-[#0f8f64] disabled:cursor-not-allowed disabled:bg-[#fbf9fd] disabled:text-[#9a90ae]"
                  >
                    <option value="">Select</option>
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="NON_BINARY">Non-binary</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a90ae]" />
                </div>
              </label>

              {!trialOtpStarted && (
                <div>
                  <span className="mb-1 block text-[11px] font-medium text-[#4f465e]">OTP channel</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['sms', 'whatsapp'] as TrialOtpChannel[]).map((channel) => {
                      const active = trialOtpChannel === channel

                      return (
                        <button
                          key={channel}
                          type="button"
                          onClick={() => setTrialOtpChannel(channel)}
                          disabled={disabled}
                          className={cn(
                            'h-10 rounded-[14px] border px-3 text-sm font-black capitalize transition disabled:cursor-not-allowed disabled:opacity-60',
                            active
                              ? 'border-[#0f8f64] bg-[#ecfdf5] text-[#047857]'
                              : 'border-[#e8e2ee] bg-white text-[#675f73] hover:border-[#91dfbd]'
                          )}
                        >
                          {channel}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {trialOtpStarted && (
                <InputField
                  label="OTP"
                  placeholder="Enter OTP"
                  value={trialOtp}
                  onChange={(value) => {
                    setTrialOtp(value.replace(/\D/g, '').slice(0, 6))
                    setTrialError('')
                  }}
                  inputMode="numeric"
                  disabled={disabled}
                />
              )}
            </div>

            <label className="mt-3 flex items-start gap-3 rounded-[14px] border border-[#e8f7ef] bg-[#f8fffb] px-3 py-2.5 text-xs leading-5 text-[#486155]">
              <input
                type="checkbox"
                checked={trialTermsAccepted}
                onChange={(event) => {
                  setTrialTermsAccepted(event.target.checked)
                  setTrialError('')
                }}
                disabled={disabled}
                className="mt-0.5 h-4 w-4 rounded border-[#a7e7c8] text-[#0f8f64] focus:ring-[#0f8f64]"
              />
              <span>
                I accept the{' '}
                <a href="/terms-and-conditions" className="font-bold text-[#047857] hover:underline">
                  Terms
                </a>{' '}
                and{' '}
                <a href="/privacy-policy" className="font-bold text-[#047857] hover:underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          </section>

          <div className="space-y-2.5">
            {trialError && <MessageBanner tone="danger">{trialError}</MessageBanner>}
            {trialMessage && <MessageBanner tone={trialOtpStarted ? 'success' : 'warning'}>{trialMessage}</MessageBanner>}
          </div>

          <div className="space-y-2.5">
            <button
              type="submit"
              disabled={primaryDisabled}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[14px] bg-[#0f8f64] px-5 py-3 text-sm font-black text-white shadow-[0_18px_34px_rgba(15,143,100,0.24)] transition hover:bg-[#047857] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {primaryLabel}
            </button>

            {trialOtpStarted && (
              <button
                type="button"
                onClick={() => void handleStartTrialOtp()}
                disabled={disabled}
                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[14px] border border-[#a7e7c8] bg-white px-5 py-3 text-sm font-black text-[#047857] transition hover:border-[#0f8f64] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {trialLoading && trialAction === 'send' ? 'Resending...' : 'Resend OTP'}
              </button>
            )}

            <button
              type="button"
              onClick={returnToPaidCheckout}
              disabled={disabled && trialAction === 'verify'}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[14px] border border-[#eadff8] bg-white px-5 py-3 text-sm font-black text-[#6b21a8] transition hover:border-[#9b63ef] disabled:cursor-not-allowed disabled:opacity-60"
            >
              View paid plans instead
            </button>
          </div>
        </form>
      </div>
    )
  }

  function renderPlanSelection() {
    const displayPlans = activePlans.length ? activePlans : plans

    return (
      <section className="space-y-5">
        <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-[0_18px_48px_rgba(107,33,168,0.08)] sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <SectionHeading
              eyebrow="Plans"
              title="Choose your Virtual Library access"
              description="Select a duration now. You can apply a coupon on the next step before opening Razorpay."
            />

            {sessionUser && <SessionCustomerCard user={sessionUser} />}
          </div>
        </div>

        {pageError && <MessageBanner tone="danger">{pageError}</MessageBanner>}

        {shouldShowTrialOffer && (
          <TrialOfferCard
            courseTitle={trialCourseTitle}
            offer={trialOffer}
            onSelect={handleSelectTrialOffer}
          />
        )}

        {displayPlans.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayPlans.map((plan, index) => (
              <PricingPlanCard
                key={plan.planId}
                meta={getPricingPlanMeta(plan, displayPlans)}
                onSelect={handleSelectPublicPlan}
                plan={plan}
                tilt={index % 2 === 0 ? 'left' : 'right'}
              />
            ))}
          </div>
        ) : (
          <MessageBanner tone="warning">Paid plans are not available right now.</MessageBanner>
        )}
      </section>
    )
  }

  function renderCheckoutForm() {
    const disabled = checkoutLoading || screen === 'processing' || screen === 'pending'
    const showContactFields = !isSessionPaymentLinkCheckout
    const selectedCourseId = selectedCourse?.courseId || selectedCoursePreview?.courseId || ''

    return (
      <div className="space-y-3">
        {shouldShowTrialOffer && (screen === 'ready' || screen === 'failed') && (
          <TrialOfferCard
            compact
            courseTitle={trialCourseTitle}
            offer={trialOffer}
            onSelect={handleSelectTrialOffer}
          />
        )}

        <form
          onSubmit={handleCheckoutFormSubmit}
          className="space-y-2.5 text-[#211536]"
        >
          <section className="rounded-[22px] border border-[#f1eafc] bg-white p-3.5 shadow-[0_18px_42px_rgba(61,45,99,0.09)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#a49ab7]">
                {showContactFields ? 'Contact details' : 'Payment details'}
              </p>
              <p className="text-xs font-semibold text-[#7c3ff0]">Razorpay</p>
            </div>

            <div className="grid gap-2">
              <CourseSelectorField
                courses={checkoutCourseOptions}
                disabled={disabled}
                label="Select your course"
                onChange={handleSelectCourseGroup}
                value={selectedCourseId}
              />

              {showContactFields ? (
                <InputField
                  label="Mobile number"
                  hint="+91"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(value) => {
                    setPhone(value.replace(/\D/g, '').slice(0, 10))
                    setAuthError('')
                    setBillingError('')
                  }}
                  inputMode="numeric"
                  disabled={otpLoading || disabled}
                />
              ) : (
                <SessionCustomerCard user={sessionUser} />
              )}

              {((screen === 'otp' && otpRequested) || paymentPhoneOtpRequired) && (
                <InputField
                  label="OTP"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(value) => {
                    setOtp(value.replace(/\D/g, '').slice(0, 6))
                    setAuthError('')
                  }}
                  inputMode="numeric"
                  disabled={otpLoading || checkoutLoading}
                />
              )}

              {showContactFields && (
                <InputField
                  label="Email address"
                  placeholder="you@email.com"
                  value={billingDetails.email}
                  onChange={(value) => updateBillingField('email', value)}
                  inputMode="email"
                  disabled={disabled}
                />
              )}
            </div>

            {checkoutPricing && selectedPlan && (
              <CouponSection
                appliedCode={activeCouponCode}
                couponCode={couponCode}
                disabled={disabled || checkoutLoading}
                error={couponError}
                loading={couponLoading}
                message={couponMessage}
                onApply={handleApplyCoupon}
                onChange={(value) => {
                  setCouponCode(normalizeCouponInput(value))
                  setCouponError('')
                  setCouponMessage('')
                  if (!value.trim()) {
                    setCouponQuote(null)
                    setAppliedCouponCode('')
                  }
                }}
                onRemove={handleRemoveCoupon}
                pricing={checkoutPricing}
              />
            )}
          </section>

          <div className="space-y-2.5">
            {authError && <MessageBanner tone="danger">{authError}</MessageBanner>}
            {billingError && <MessageBanner tone="danger">{billingError}</MessageBanner>}
            {pageError && <MessageBanner tone="danger">{pageError}</MessageBanner>}
            {result && screen !== 'success' && (
              <MessageBanner tone={result.tone === 'danger' ? 'danger' : result.tone}>
                <span className="font-semibold">{result.title}</span>
                <span className="mt-1 block">{result.message}</span>
              </MessageBanner>
            )}
          </div>

          <div className="space-y-2.5">
            <button
              type="submit"
              disabled={isPrimaryActionDisabled()}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#883bea_0%,#9c55ef_100%)] px-5 py-3 text-sm font-black text-white shadow-[0_18px_34px_rgba(126,57,224,0.30)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {getPrimaryActionLabel()}
            </button>

            {screen === 'otp' && otpRequested && (
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={otpLoading}
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-purple-200 bg-white px-5 py-3 text-sm font-bold text-[#6b21a8] transition hover:border-[#6b21a8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {otpLoading && otpAction === 'send' ? 'Resending...' : 'Resend OTP'}
              </button>
            )}

            {screen === 'pending' && paymentOrderId && (
              <button
                type="button"
                onClick={() => void checkPaymentLinkStatus(paymentOrderId, true)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-purple-200 bg-white px-5 py-3 text-sm font-bold text-[#6b21a8] transition hover:border-[#6b21a8]"
              >
                {statusTimedOut ? 'Check status again' : 'Check status'}
              </button>
            )}
          </div>

          <PaymentTrustBadges />

          <div className="rounded-[14px] border border-[#ffd797] bg-[#fff7e8] px-4 py-2.5 text-xs leading-5 text-[#9a4a00]">
            <div className="flex items-start gap-2">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#f2a223]" />
              <p>
                All payments are <span className="font-bold">non-refundable</span>. Please review your plan before proceeding. For queries,{' '}
                <a href="/contact" className="font-semibold underline decoration-[#c56a10]/40 underline-offset-2">
                  contact support
                </a>.
              </p>
            </div>
          </div>
        </form>

        {renderPlanSummary()}
      </div>
    )
  }

  function renderPlanSummary() {
    const durationLabel = selectedPlan ? formatPlanDuration(selectedPlan.durationMonths) : 'Selected Plan'
    const finalAmountPaise = checkoutPricing?.finalAmountPaise ?? selectedPlan?.amountPaise ?? 0
    const currency = checkoutPricing?.currency || selectedPlan?.currency || 'INR'
    const monthlyAmountPaise = selectedPlan
      ? Math.round(finalAmountPaise / Math.max(selectedPlan.durationMonths, 1))
      : 0
    const metrics = selectedPlan ? getPlanMetrics(selectedPlan, basePlan) : null
    const savingsPercent = selectedPlan ? getSavingsPercent(selectedPlan, metrics, checkoutPricing) : 0

    return (
      <aside className="relative overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_86%_7%,rgba(188,114,255,0.42)_0,rgba(188,114,255,0.24)_18%,transparent_19%),linear-gradient(145deg,#8c39e8_0%,#6d22d3_54%,#651fd2_100%)] p-4 text-white shadow-[0_28px_46px_rgba(105,35,204,0.30)]">
        <div className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-white/7" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/48">
            Plan summary
          </p>
          <h2 className="mt-1.5 text-2xl font-black leading-none tracking-[-0.04em]">{durationLabel}</h2>
          <p className="mt-1.5 text-xs font-semibold text-white/64">Full access · Billed once</p>

          <div className="mt-4 space-y-1 border-y border-white/14 py-3">
            {PAYMENT_PLAN_FEATURES.map((feature) => (
              <PlanFeature key={feature}>{feature}</PlanFeature>
            ))}
          </div>

          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold text-white/42">Per month</p>
              <p className="mt-1 text-xl font-black leading-none tracking-[-0.04em]">
                {formatCompactCurrency(monthlyAmountPaise, currency)}/mo
              </p>
            </div>
            {savingsPercent > 0 && (
              <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                Save {savingsPercent}%
              </span>
            )}
          </div>
        </div>
      </aside>
    )
  }

  function renderSuccessPage() {
    const courseTitle = getCheckoutCourseTitle(
      selectedCoursePreview?.title || selectedCourse?.title || activeGroup?.course.title || 'Virtual Library'
    )

    return (
      <section className="mx-auto grid max-w-5xl items-center gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-10">
        <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-[0_18px_48px_rgba(107,33,168,0.10)] sm:p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eeff] text-[#6b21a8]">
            <CheckIcon className="h-8 w-8" />
          </div>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#6b21a8]">
            {isTrialSuccess ? 'Trial active' : 'Access ready'}
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">
            {isTrialSuccess ? 'Your 24-hour trial is active.' : 'Your access is ready.'}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
            {isTrialSuccess
              ? 'Continue in the Virtual Library mobile app. Your trial access is active now and no payment was collected.'
              : 'Download the Virtual Library mobile app and sign in with the phone number used for checkout to start learning.'}
          </p>

          <div className="mt-7">
            <DownloadOptions variant="light" />
          </div>
        </div>

        <aside className="rounded-3xl bg-[#6b21a8] p-6 text-white shadow-[0_24px_56px_rgba(107,33,168,0.22)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d3b8ff]">
            {isTrialSuccess ? 'Trial access' : 'Subscription'}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">{courseTitle}</h2>
          <div className="mt-6 space-y-3 border-y border-white/14 py-5">
            <PlanFeature>{isTrialSuccess ? '24-hour trial access is active' : 'Course access is active'}</PlanFeature>
            <PlanFeature>Mobile app access is enabled</PlanFeature>
            <PlanFeature>Study rooms, focus tools, notes, and progress insights are ready</PlanFeature>
          </div>
          <a
            href="/v2/neet-pg/access"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#6b21a8] transition hover:bg-[#f6f1ff]"
          >
            View access details
          </a>
        </aside>
      </section>
    )
  }

  function renderBodyContent() {
    if (screen === 'booting') {
      return (
        <div className="py-16">
          <LoadingPanel label="Preparing your checkout..." />
        </div>
      )
    }

    if (screen === 'otp') {
      return renderCheckoutForm()
    }

    if (screen === 'planSelect') {
      return renderPlanSelection()
    }

    if (screen === 'accountSetup') {
      return renderAccountSetup()
    }

    if (screen === 'trial') {
      return renderTrialForm()
    }

    if (screen === 'course') {
      return (
        <div className={cn('space-y-6', accountSetupStep === 'course' && 'mx-auto max-w-xl rounded-3xl border border-purple-100 bg-white p-5 shadow-[0_18px_48px_rgba(107,33,168,0.10)] sm:p-6')}>
          <SectionHeading
            eyebrow="Course"
            title={accountSetupStep === 'course' ? 'Which course are you in?' : 'Choose your exam'}
            description={
              accountSetupStep === 'course'
                ? 'Select the exam you are preparing for.'
                : 'We will load the most relevant plan options after you confirm your course.'
            }
          />

          {accountSetupStep === 'course' ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Course</span>
              <select
                value={selectedCourseChoice}
                onChange={(event) => {
                  setSelectedCourseChoice(event.target.value)
                  setCourseError('')
                }}
                disabled={courseLoading}
                className="h-[52px] w-full rounded-2xl border border-purple-100 bg-white px-4 text-sm font-semibold text-slate-900 shadow-[0_8px_18px_rgba(107,33,168,0.05)] outline-none transition focus:border-[#6b21a8] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="">Select your course</option>
                {courseOptions.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.title}
                  </option>
                ))}
                {customCourseOption && (
                  <option value={customCourseOption.key}>{customCourseOption.title}</option>
                )}
              </select>
            </label>
          ) : (
            <div className="grid gap-3">
              {courseOptions.map((course) => {
                const isActive = selectedCourseChoice === course.courseId

                return (
                  <button
                    key={course.courseId}
                    type="button"
                    onClick={() => {
                      setSelectedCourseChoice(course.courseId)
                      setCourseError('')
                    }}
                    className={cn(
                      'rounded-[24px] border p-4 text-left transition',
                      isActive
                        ? 'border-[#6b21a8] bg-[#faf7ff]'
                        : 'border-purple-100 bg-white hover:border-[#d3b8ff]'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <SelectionDot active={isActive} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{course.title}</p>
                        {course.description && (
                          <p className="mt-1 text-xs leading-5 text-slate-500">{course.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}

              {customCourseOption && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourseChoice(customCourseOption.key)
                    setCourseError('')
                  }}
                  className={cn(
                    'rounded-[24px] border p-4 text-left transition',
                    isCustomCourseSelected
                      ? 'border-[#6b21a8] bg-[#faf7ff]'
                      : 'border-purple-100 bg-white hover:border-[#d3b8ff]'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <SelectionDot active={isCustomCourseSelected} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{customCourseOption.title}</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}

          {isCustomCourseSelected && (
            <InputField
              label="Exam name"
              value={customCourseTitle}
              onChange={(value) => {
                setCustomCourseTitle(value)
                setCourseError('')
              }}
              disabled={courseLoading}
            />
          )}

          {courseError && <MessageBanner tone="danger">{courseError}</MessageBanner>}

          <div className="grid gap-3">
            <button
              type="button"
              onClick={handleSaveCourseSelection}
              disabled={courseLoading}
              className="rounded-2xl bg-[#6b21a8] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(107,33,168,0.18)] transition hover:bg-[#581c87] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {courseLoading
                ? 'Saving your course...'
                : accountSetupStep === 'course'
                  ? 'Finish setup'
                  : 'Continue to plans'}
            </button>

            {accountSetupStep !== 'course' && (
              <button
                type="button"
                onClick={() => {
                  tokenStore.clear()
                  openOtpScreen('Sign in with a different phone number.')
                }}
                className="rounded-2xl border border-purple-100 bg-white px-4 py-3 text-sm font-semibold text-[#6b21a8] transition hover:border-[#6b21a8]"
              >
                Use another phone number
              </button>
            )}
          </div>
        </div>
      )
    }

    if (screen === 'success') {
      return renderSuccessPage()
    }

    return renderCheckoutForm()
  }

  function renderFooterAction() {
    return null
  }

  return (
    <>
      <Head>
        <title>Payment - Virtual Library</title>
        <meta name="description" content="Secure checkout for Virtual Library memberships." />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {shouldLoadCheckoutScript && (
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
          onLoad={() => setRazorpayReady(true)}
          onError={() => setPageError('Could not load Razorpay Checkout. Please refresh and try again.')}
        />
      )}

      <div className="min-h-screen bg-white text-[#211536]">
        <div className="mx-auto w-full max-w-[430px] px-4 pb-4 pt-3">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex h-7 items-center gap-1.5 rounded-full px-1 text-sm font-medium text-[#6f667d] transition hover:text-[#6b21a8]"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
                Back
              </button>

              <div className="min-w-0 rounded-full bg-[#f0e3ff] px-3 py-1 text-[11px] font-black text-[#8441ee]">
                <span className="block truncate">
                  {screen === 'trial'
                    ? '24h Trial'
                    : selectedPlan ? `${formatPlanDuration(selectedPlan.durationMonths)} Plan` : 'Selected Plan'}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#08a76b]">
                Secure checkout
              </p>
              <h1 className="mt-1 text-[28px] font-black leading-none tracking-[-0.04em] text-[#171021]">
                {screen === 'trial' ? 'Trial' : 'Payment'}
              </h1>
            </div>

            <main className="mt-3">
              {renderBodyContent()}
            </main>

            {renderFooterAction()}

            <div className="mt-4 flex flex-wrap justify-center gap-5 pb-1 text-[11px] font-medium text-[#9b93aa]">
              <a href="/terms-and-conditions" className="transition hover:text-[#6b21a8]">
                Terms
              </a>
              <a href="/privacy-policy" className="transition hover:text-[#6b21a8]">
                Privacy
              </a>
              <a href="/refund-policy" className="transition hover:text-[#6b21a8]">
                Refunds
              </a>
            </div>
        </div>
      </div>

      <SuccessCompletionModal
        isOpen={showSuccessModal && screen === 'success' && Boolean(result?.returnUrl)}
        message={result?.message}
        eyebrowText={isTrialSuccess ? 'Trial Activated' : 'Payment Completed'}
        titleText={isTrialSuccess ? 'Your trial is active' : 'Your access is ready'}
        helperText={
          result?.returnUrl
            ? 'Close this modal to continue back into the app.'
            : shouldUseV2WebFallback
              ? 'Open the next page for app download options, included features, and access steps.'
              : 'Close this modal to stay on the checkout page.'
        }
        buttonLabel={
          result?.returnUrl
            ? 'Close and continue'
            : shouldUseV2WebFallback
              ? 'Open access page'
              : 'Close'
        }
        onClose={handleCloseSuccessModal}
      />
    </>
  )
}

function CouponSection({
  appliedCode,
  couponCode,
  disabled,
  error,
  loading,
  message,
  onApply,
  onChange,
  onRemove,
  pricing,
}: {
  appliedCode: string
  couponCode: string
  disabled: boolean
  error: string
  loading: boolean
  message: string
  onApply: () => void
  onChange: (value: string) => void
  onRemove: () => void
  pricing: BillingPricing
}) {
  const [expanded, setExpanded] = useState(Boolean(couponCode || appliedCode || error || message))
  const hasAppliedCoupon = Boolean(appliedCode)
  const canApply = Boolean(couponCode.trim()) && !disabled && !hasAppliedCoupon
  const applyCoupon = () => {
    if (canApply && !loading) {
      onApply()
    }
  }

  useEffect(() => {
    if (couponCode || appliedCode || error || message) {
      setExpanded(true)
    }
  }, [appliedCode, couponCode, error, message])

  return (
    <section className="mt-3 border-t border-[#f0edf5] pt-3">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center gap-2 text-left text-xs font-semibold text-[#681ee6] transition hover:text-[#4f15bd]"
      >
        <TagIcon className="h-4 w-4 shrink-0" />
        <span>Have a coupon code?</span>
        <span className="font-medium text-[#9b93aa]">(Optional)</span>
      </button>

      {expanded && (
        <div className="mt-2.5 flex items-end gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Coupon code</span>
            <input
              type="text"
              value={couponCode}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  applyCoupon()
                }
              }}
              disabled={disabled || hasAppliedCoupon}
              className="h-10 w-full rounded-[13px] border border-[#e9e2f3] bg-white px-3 text-sm font-bold uppercase tracking-[0.08em] text-[#211536] outline-none transition placeholder:text-[#c9c2d3] focus:border-[#8b3fea] disabled:cursor-not-allowed disabled:opacity-70"
              placeholder="COUPON"
              autoComplete="off"
            />
          </label>

          <button
            type="button"
            onClick={applyCoupon}
            disabled={!canApply || loading}
            className="h-10 shrink-0 rounded-[13px] bg-[#6d22d3] px-4 text-sm font-black text-white shadow-[0_12px_22px_rgba(107,33,168,0.16)] transition hover:bg-[#581cba] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      )}

      {hasAppliedCoupon && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-[14px] border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-emerald-900">{appliedCode}</p>
            {message && <p className="mt-0.5 text-xs text-emerald-700">{message}</p>}
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:border-emerald-400"
          >
            Remove
          </button>
        </div>
      )}

      {!hasAppliedCoupon && error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}
      {!hasAppliedCoupon && !error && message && <p className="mt-3 text-xs font-medium text-emerald-700">{message}</p>}

      <div className="mt-3 space-y-1.5 border-t border-[#f0edf5] pt-3">
        <PriceLine label="Subtotal" value={formatCurrency(pricing.baseAmountPaise, pricing.currency)} />
        <PriceLine
          label="Discount"
          value={`- ${formatCurrency(pricing.discountAmountPaise, pricing.currency)}`}
          tone="success"
        />
        <div className="mt-3 flex items-center justify-between border-t border-[#ece7f1] pt-3">
          <span className="text-sm font-black text-[#211536]">Total due today</span>
          <span className="text-xl font-black tracking-[-0.04em] text-[#7b2fee]">
            {formatCurrency(pricing.finalAmountPaise, pricing.currency)}
          </span>
        </div>
      </div>
    </section>
  )
}

function PriceLine({
  label,
  tone,
  value,
}: {
  label: string
  tone?: 'success'
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-[#7d758b]">{label}</span>
      <span className={cn('font-semibold text-[#51465f]', tone === 'success' && 'text-emerald-600')}>
        {value}
      </span>
    </div>
  )
}

function CourseSelectorField({
  courses,
  disabled,
  label,
  onChange,
  value,
}: {
  courses: CourseSummary[]
  disabled?: boolean
  label: string
  onChange: (courseId: string) => void
  value: string
}) {
  const hasOptions = courses.length > 0

  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-[#4f465e]">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled || !hasOptions}
          className="h-10 w-full appearance-none truncate rounded-[14px] border border-[#e8e2ee] bg-white px-3 pr-9 text-sm font-semibold text-[#211536] outline-none transition focus:border-[#8b3fea] disabled:cursor-not-allowed disabled:bg-[#fbf9fd] disabled:text-[#9a90ae]"
        >
          <option value="" disabled>
            {hasOptions ? 'Select your course' : 'Course unavailable'}
          </option>
          {courses.map((course) => (
            <option key={course.courseId} value={course.courseId}>
              {course.title || 'Virtual Library Access'}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a90ae]" />
      </div>
    </label>
  )
}

function PaymentTrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-1 py-1 text-[11px] font-medium text-[#9a90ae]">
      <span className="inline-flex items-center gap-1.5">
        <LockIcon className="h-3.5 w-3.5 text-[#8b3fea]" />
        Secure payment
      </span>
      <span className="inline-flex items-center gap-1.5">
        <BoltIcon className="h-3.5 w-3.5 text-[#8b3fea]" />
        Instant access
      </span>
      <span className="inline-flex items-center gap-1.5">
        <PhoneIcon className="h-3.5 w-3.5 text-[#8b3fea]" />
        Android & iOS
      </span>
    </div>
  )
}

function SummaryPriceLine({
  label,
  tone,
  value,
}: {
  label: string
  tone?: 'success'
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-white/52">{label}</span>
      <span className={cn('font-semibold text-white/84', tone === 'success' && 'text-[#7dd3a8]')}>
        {value}
      </span>
    </div>
  )
}

function PlanFeature({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white/18 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
        <CheckIcon className="h-2.5 w-2.5" />
      </span>
      <p className="text-[11px] leading-4 text-white/84">{children}</p>
    </div>
  )
}

function DownloadOptions({
  compact = false,
  variant = 'glass',
}: {
  compact?: boolean
  variant?: 'glass' | 'light'
}) {
  const isLight = variant === 'light'
  const linkClass = cn(
    'inline-flex items-center justify-center gap-3 rounded-full border text-left transition',
    compact ? 'h-10 min-w-[168px] px-4 py-0' : 'min-w-[178px] px-4 py-3',
    isLight
      ? 'border-[#e9ddff] bg-white text-[#5b21b6] shadow-[0_16px_34px_rgba(28,10,74,0.10)] hover:bg-[#f6f1ff]'
      : 'border-white/22 bg-white/12 text-white backdrop-blur hover:bg-white/18'
  )
  const eyebrowClass = isLight ? 'text-[#77669d]' : 'text-white/58'

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:flex-wrap', compact && 'justify-center')}>
      <a href={GOOGLE_PLAY_HREF} target="_blank" rel="noreferrer" className={linkClass}>
        <PlayStoreIcon className="h-6 w-6 shrink-0" />
        <span>
          <span className={cn('block text-[11px] font-semibold leading-none', eyebrowClass)}>Get it on</span>
          <span className="mt-1 block text-sm font-bold leading-none">Google Play</span>
        </span>
      </a>
      <a href={APP_STORE_HREF} target="_blank" rel="noreferrer" className={linkClass}>
        <AppleIcon className="h-6 w-6 shrink-0" />
        <span>
          <span className={cn('block text-[11px] font-semibold leading-none', eyebrowClass)}>Download on</span>
          <span className="mt-1 block text-sm font-bold leading-none">App Store</span>
        </span>
      </a>
    </div>
  )
}

function SessionCustomerCard({ user }: { user: PaymentSessionUser | null }) {
  const phoneLabel = user?.phoneE164 ? maskPhone(user.phoneE164) : 'Signed in'
  const emailLabel = user?.email ? maskEmail(user.email) : ''

  return (
    <div className="rounded-[14px] border border-[#e8e2ee] bg-white px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7b2fee]">
        Signed in
      </p>
      <p className="mt-1 text-sm font-semibold text-[#211536]">{phoneLabel}</p>
      {emailLabel && <p className="mt-0.5 text-xs font-medium text-[#7d758b]">{emailLabel}</p>}
    </div>
  )
}

function TrialOfferCard({
  compact = false,
  courseTitle,
  offer,
  onSelect,
}: {
  compact?: boolean
  courseTitle: string
  offer: TrialOffer | null
  onSelect?: () => void
}) {
  if (!offer) {
    return null
  }

  const durationLabel = formatTrialDuration(offer.durationHours)

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[22px] border border-[#a7e7c8] bg-[linear-gradient(135deg,#f7fffb_0%,#ecfdf5_54%,#fffaf0_100%)] shadow-[0_18px_42px_rgba(12,121,85,0.12)]',
        compact ? 'p-3.5' : 'p-5'
      )}
    >
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0f8f64]">
              Mobile trial
            </p>
            <h2 className={cn(
              'mt-1 font-black leading-tight tracking-[-0.04em] text-[#10261d]',
              compact ? 'text-xl' : 'text-3xl'
            )}>
              {durationLabel} free trial
            </h2>
            <p className={cn('mt-2 font-medium leading-5 text-[#476457]', compact ? 'text-xs' : 'text-sm')}>
              {courseTitle} access after OTP verification.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-[#047857] shadow-[0_8px_18px_rgba(12,121,85,0.10)]">
            {formatCurrency(offer.amountPaise, offer.currency)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <TrialBadge>No Razorpay</TrialBadge>
          <TrialBadge>OTP required</TrialBadge>
          <TrialBadge>First time only</TrialBadge>
        </div>

        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center rounded-[14px] bg-[#0f8f64] px-5 py-3 text-sm font-black text-white shadow-[0_16px_30px_rgba(15,143,100,0.22)] transition hover:bg-[#047857]"
          >
            Start {durationLabel} trial
          </button>
        )}
      </div>
    </section>
  )
}

function TrialBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#c8f4df] bg-white/78 px-2.5 py-1 text-[11px] font-black text-[#047857]">
      {children}
    </span>
  )
}

function PlanOptionCard({
  active,
  disabled,
  metrics,
  onSelect,
  plan,
  pricing,
  tag,
}: {
  active: boolean
  disabled: boolean
  metrics: PlanMetrics
  onSelect: () => void
  plan: BillingPlan
  pricing: BillingPricing | null
  tag: string | null
}) {
  const displayAmountPaise = pricing?.finalAmountPaise ?? plan.amountPaise
  const displayCurrency = pricing?.currency || plan.currency
  const compareAmount = pricing && pricing.discountAmountPaise > 0
    ? pricing.baseAmountPaise
    : metrics.compareAmountPaise
  const priceDrop = compareAmount ? compareAmount - displayAmountPaise : 0

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'relative w-full rounded-[28px] border px-5 py-6 text-left transition sm:px-6',
        active
          ? 'border-[#6b21a8] bg-[#f4eeff] shadow-[0_18px_36px_rgba(107,33,168,0.12)]'
          : 'border-purple-100 bg-white hover:border-[#d3b8ff]',
        disabled && 'cursor-not-allowed opacity-75'
      )}
    >
      {tag && (
        <span className="absolute right-5 top-0 -translate-y-1/2 rounded-lg bg-[#6b21a8] px-4 py-2 text-xs font-bold text-white shadow-[0_10px_24px_rgba(107,33,168,0.18)]">
          {tag}
        </span>
      )}

      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[1.35rem] font-semibold leading-tight tracking-[-0.01em] text-slate-950 sm:text-[1.55rem]">
            {formatPlanTitle(plan)}
          </p>
          <p className="mt-4 text-sm font-medium text-slate-500">
            Valid for {getPlanValidityDays(plan.durationMonths)} Days
          </p>
          {priceDrop > 0 && (
            <p className="mt-4 text-base font-semibold text-[#1f8f56]">
              Price drop {formatCurrency(priceDrop, displayCurrency)}
            </p>
          )}
        </div>

        <div className="shrink-0 text-right">
          {compareAmount && compareAmount > displayAmountPaise && (
            <p className="text-base font-medium text-slate-400 line-through decoration-slate-400">
              {formatCurrency(compareAmount, displayCurrency)}
            </p>
          )}
          <p className="mt-4 text-[2.05rem] font-bold leading-none tracking-[-0.03em] text-slate-950">
            {formatCurrency(displayAmountPaise, displayCurrency)}
          </p>
        </div>
      </div>
    </button>
  )
}

function CheckoutButton({
  action,
  className,
}: {
  action: CheckoutActionState
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        'flex items-center justify-center gap-2 rounded-2xl bg-[#6b21a8] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(107,33,168,0.22)] transition hover:bg-[#581c87] disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      <span>{action.label}</span>
      {action.showArrow && <ArrowRightIcon className="h-4 w-4" />}
    </button>
  )
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-100 border-t-[#6b21a8]" />
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}

function SectionHeading({
  description,
  eyebrow,
  title,
}: {
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6b21a8]">{eyebrow}</p>
      <h2 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.02em] text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

function InputField({
  disabled,
  hint,
  inputMode,
  label,
  onChange,
  placeholder,
  value,
}: {
  disabled?: boolean
  hint?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  label: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-[#4f465e]">{label}</span>
      <div className="flex h-10 items-center rounded-[14px] border border-[#e8e2ee] bg-white px-3 transition focus-within:border-[#8b3fea] disabled:opacity-70">
        {hint && <span className="mr-3 border-r border-[#eee8f4] pr-3 text-sm font-semibold text-[#9c94a9]">{hint}</span>}
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder || undefined}
          disabled={disabled}
          className="w-full min-w-0 border-0 bg-transparent px-0 py-2 text-sm font-medium text-[#211536] outline-none placeholder:text-[#c9c2d3] focus:ring-0 disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>
    </label>
  )
}

function MessageBanner({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'danger' | 'success' | 'warning'
}) {
  return (
    <div
      className={cn(
        'rounded-[14px] border px-4 py-3 text-sm',
        tone === 'danger' && 'border-rose-200 bg-rose-50 text-rose-700',
        tone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
        tone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-700'
      )}
    >
      {children}
    </div>
  )
}

function SelectionDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition',
        active ? 'border-[#6b21a8] bg-[#6b21a8]' : 'border-purple-200 bg-white'
      )}
    >
      <span className={cn('h-2 w-2 rounded-full bg-white', !active && 'opacity-0')} />
    </span>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M5.5 7.5L10 12l4.5-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M4.5 10h11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M11 5.5L15.5 10 11 14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M4.5 5.5v4.1c0 .35.14.68.39.92l5.1 5.1a1.55 1.55 0 002.2 0l3.43-3.43a1.55 1.55 0 000-2.2l-5.1-5.1a1.3 1.3 0 00-.92-.39H5.5a1 1 0 00-1 1z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
      <path d="M7.5 7.5h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M6 8V6.5a4 4 0 018 0V8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M5.5 8h9A1.5 1.5 0 0116 9.5v5A1.5 1.5 0 0114.5 16h-9A1.5 1.5 0 014 14.5v-5A1.5 1.5 0 015.5 8z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M10.8 2.9L5.7 10h4l-.5 7.1 5.1-8.2h-4l.5-6z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M7 3.5h6A1.5 1.5 0 0114.5 5v10A1.5 1.5 0 0113 16.5H7A1.5 1.5 0 015.5 15V5A1.5 1.5 0 017 3.5z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M9 14h2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M10 3.2l5 1.9v3.7c0 3.15-1.88 5.98-5 7.48-3.12-1.5-5-4.33-5-7.48V5.1l5-1.9z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M10 7.2v3.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M10 13.2h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  )
}

function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M4.46 3.21c-.3.19-.46.54-.46 1.01v15.56c0 .48.16.82.46 1.01l8.17-8.8-8.17-8.78Z" />
      <path d="M13.57 11 16.1 8.28 6.17 2.72c-.24-.14-.47-.2-.68-.2l8.08 8.48Z" />
      <path d="M13.57 13 5.49 21.48c.21 0 .44-.06.68-.2l9.93-5.56L13.57 13Z" />
      <path d="M19.49 10.14 17.22 8.87 14.48 12l2.74 3.13 2.27-1.27c.68-.38 1.05-.99 1.05-1.86s-.37-1.48-1.05-1.86Z" />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.52 12.48c-.02-2.02 1.65-2.99 1.72-3.03-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.59.78-3.29 1.99-1.4 2.43-.36 6.03 1.01 8.01.67.97 1.47 2.06 2.52 2.02 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.08-.02 1.77-.99 2.44-1.97.77-1.12 1.08-2.2 1.1-2.26-.02-.01-2.12-.81-2.14-3.2Z" />
      <path d="M14.51 6.56c.56-.68.94-1.62.83-2.56-.8.03-1.76.53-2.33 1.21-.51.59-.96 1.55-.84 2.46.89.07 1.79-.45 2.34-1.11Z" />
    </svg>
  )
}

function SuccessCompletionModal({
  eyebrowText,
  isOpen,
  message,
  helperText,
  buttonLabel,
  titleText,
  onClose,
}: {
  eyebrowText?: string
  isOpen: boolean
  message?: string
  helperText: string
  buttonLabel: string
  titleText?: string
  onClose: () => void
}) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(17,24,39,0.42)] p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[32px] bg-white p-6 text-center shadow-[0_34px_80px_rgba(76,29,149,0.20)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4eeff] text-[#6b21a8]">
          <CheckIcon className="h-7 w-7" />
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6b21a8]">
          {eyebrowText || 'Payment Completed'}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-slate-950">
          {titleText || 'Your access is ready'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {message || 'Payment confirmed successfully.'}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {helperText}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-[#6b21a8] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(107,33,168,0.22)] transition hover:bg-[#581c87]"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}

function getCheckoutPricing(plan: BillingPlan | null, quote: BillingQuoteResponse | null): BillingPricing | null {
  if (!plan) {
    return null
  }

  if (quote?.pricing) {
    return quote.pricing
  }

  return {
    baseAmountPaise: plan.amountPaise,
    discountAmountPaise: 0,
    finalAmountPaise: plan.amountPaise,
    currency: plan.currency,
  }
}

function normalizeCouponInput(value: string) {
  return value.replace(/\s/g, '').toUpperCase().slice(0, 64)
}

function getPlanMetrics(plan: BillingPlan, basePlan: BillingPlan | null): PlanMetrics {
  const safeDuration = Math.max(plan.durationMonths, 1)
  const explicitCompareAmount = getExplicitCompareAmount(plan)

  if (explicitCompareAmount && explicitCompareAmount > plan.amountPaise) {
    return {
      compareAmountPaise: explicitCompareAmount,
    }
  }

  if (!basePlan) {
    return {
      compareAmountPaise: null,
    }
  }

  const baseMonthlyPaise = Math.round(basePlan.amountPaise / Math.max(basePlan.durationMonths, 1))
  const compareAmountPaise = baseMonthlyPaise * safeDuration

  return {
    compareAmountPaise: compareAmountPaise > plan.amountPaise ? compareAmountPaise : null,
  }
}

function getSavingsPercent(
  plan: BillingPlan,
  metrics: PlanMetrics | null,
  pricing: BillingPricing | null
) {
  const compareAmountPaise = pricing && pricing.discountAmountPaise > 0
    ? pricing.baseAmountPaise
    : metrics?.compareAmountPaise
  const finalAmountPaise = pricing?.finalAmountPaise ?? plan.amountPaise

  if (!compareAmountPaise || compareAmountPaise <= finalAmountPaise) {
    return 0
  }

  return Math.max(1, Math.round(((compareAmountPaise - finalAmountPaise) / compareAmountPaise) * 100))
}

function getExplicitCompareAmount(plan: BillingPlan) {
  const rawPlan = plan as BillingPlan & {
    compareAmountPaise?: number | null
    originalAmountPaise?: number | null
    mrpAmountPaise?: number | null
  }

  return rawPlan.compareAmountPaise || rawPlan.originalAmountPaise || rawPlan.mrpAmountPaise || null
}

function formatCompactCurrency(amountPaise: number, currency: string) {
  return formatCurrency(amountPaise, currency).replace(/\.00$/, '')
}

function getPlanTag(plan: BillingPlan, popularPlanId: string) {
  if (plan.planId === popularPlanId) {
    return 'Recommended'
  }

  return null
}

function getRequestedPublicCheckoutPlan(
  plans: BillingPlan[],
  query: {
    requestedCourseId?: string
    requestedCourseSlug?: string
    requestedDurationMonths?: number | null
    requestedPlanId?: string
  }
) {
  if (!plans.length) {
    return null
  }

  if (query.requestedPlanId) {
    const planMatch = plans.find((plan) => plan.planId === query.requestedPlanId)

    if (planMatch) {
      return planMatch
    }
  }

  const courseScopedPlans = getPublicCheckoutCoursePlans(plans, query.requestedCourseId, query.requestedCourseSlug)
  const candidatePlans = courseScopedPlans.length ? courseScopedPlans : plans

  if (query.requestedDurationMonths) {
    const durationMatch = candidatePlans.find((plan) => plan.durationMonths === query.requestedDurationMonths)

    if (durationMatch) {
      return durationMatch
    }

    return null
  }

  return candidatePlans.find((plan) => plan.planId === getDefaultPlanId(candidatePlans)) || candidatePlans[0] || null
}

function getPublicCheckoutCoursePlans(plans: BillingPlan[], requestedCourseId?: string, requestedCourseSlug?: string) {
  if (requestedCourseId) {
    const courseIdMatches = plans.filter((plan) => plan.course.courseId === requestedCourseId)

    if (courseIdMatches.length) {
      return courseIdMatches
    }
  }

  const requestedCourseKey = normalizeCourseQueryKey(requestedCourseSlug || DEFAULT_PUBLIC_COURSE_SLUG)
  const courseMatches = plans.filter((plan) => {
    return [plan.course.slug, plan.course.title, plan.course.courseId]
      .some((value) => normalizeCourseQueryKey(value || '') === requestedCourseKey)
  })

  if (courseMatches.length) {
    return courseMatches
  }

  return plans.filter((plan) => isDefaultPublicCourse(plan.course))
}

function getRequestedCourseFromOptions(courses: CourseSummary[], requestedCourseId?: string, requestedCourseSlug?: string) {
  if (requestedCourseId) {
    const courseIdMatch = courses.find((course) => course.courseId === requestedCourseId)

    if (courseIdMatch) {
      return courseIdMatch
    }
  }

  if (requestedCourseSlug) {
    const requestedCourseKey = normalizeCourseQueryKey(requestedCourseSlug)
    const courseSlugMatch = courses.find((course) => {
      return [course.slug, course.title, course.courseId]
        .some((value) => normalizeCourseQueryKey(value || '') === requestedCourseKey)
    })

    if (courseSlugMatch) {
      return courseSlugMatch
    }
  }

  return null
}

function isDefaultPublicCourse(course?: CourseSummary | null) {
  if (!course) {
    return false
  }

  return [course.slug, course.title, course.courseId]
    .some((value) => normalizeCourseQueryKey(value || '') === DEFAULT_PUBLIC_COURSE_KEY)
}

function normalizeCourseQueryKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function getDefaultPlanId(plans: BillingPlan[], requestedPlanId?: string, requestedDurationMonths?: number | null) {
  if (!plans.length) {
    return ''
  }

  if (requestedPlanId && plans.some((plan) => plan.planId === requestedPlanId)) {
    return requestedPlanId
  }

  if (requestedDurationMonths) {
    const durationMatch = plans.find((plan) => plan.durationMonths === requestedDurationMonths)

    if (durationMatch) {
      return durationMatch.planId
    }
  }

  return (
    plans.find((plan) => plan.durationMonths === 12)?.planId ||
    plans.find((plan) => plan.durationMonths === 6)?.planId ||
    plans[Math.min(1, plans.length - 1)]?.planId ||
    plans[0]?.planId ||
    ''
  )
}

function sortCourseOptions(courses: CourseSummary[]) {
  return [...courses].sort((left, right) => {
    return (left.displayOrder || 0) - (right.displayOrder || 0)
  })
}

function formatPlanDuration(durationMonths: number) {
  return `${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}`
}

function formatTrialDuration(durationHours: number) {
  if (durationHours === 24) {
    return '24-hour'
  }

  return `${durationHours}-hour`
}

function formatPlanTitle(plan: BillingPlan) {
  if (plan.name?.trim()) {
    return plan.name.trim()
  }

  if (plan.durationMonths === 1) {
    return 'Monthly Pass'
  }

  if (plan.durationMonths === 12) {
    return 'Yearly Pass'
  }

  return `${formatPlanDuration(plan.durationMonths)} Pass`
}

function getPlanValidityDays(durationMonths: number) {
  if (durationMonths === 1) {
    return 31
  }

  return Math.round((durationMonths * 365) / 12)
}

function getQueryParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function getFirstQueryValue(query: Record<string, string | string[] | undefined>, keys: string[]) {
  for (const key of keys) {
    const value = getQueryParam(query[key])

    if (value) {
      return value
    }
  }

  return ''
}

function isMobileCheckoutRequest(query: Record<string, string | string[] | undefined>) {
  if (typeof window !== 'undefined' && Boolean(window.ReactNativeWebView)) {
    return true
  }

  if (hasRememberedMobileCheckoutContext()) {
    return true
  }

  if (getFirstQueryValue(query, [...MOBILE_ACCESS_TOKEN_QUERY_KEYS, ...MOBILE_REFRESH_TOKEN_QUERY_KEYS])) {
    return true
  }

  if (isTruthyQueryFlag(getQueryParam(query.mobile)) || isTruthyQueryFlag(getQueryParam(query.fromMobile))) {
    return true
  }

  return MOBILE_CONTEXT_QUERY_KEYS.some((key) => {
    const value = getQueryParam(query[key])

    return value ? MOBILE_SOURCE_VALUES.has(value.trim().toLowerCase()) : false
  })
}

function rememberMobileCheckoutContext() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(MOBILE_CHECKOUT_CONTEXT_KEY, String(Date.now()))
}

function hasRememberedMobileCheckoutContext() {
  if (typeof window === 'undefined') {
    return false
  }

  const rawTimestamp = window.sessionStorage.getItem(MOBILE_CHECKOUT_CONTEXT_KEY)
  const timestamp = Number(rawTimestamp)

  if (!Number.isFinite(timestamp)) {
    return false
  }

  return Date.now() - timestamp <= MOBILE_CHECKOUT_CONTEXT_TTL_MS
}

function isTruthyQueryFlag(value: string | undefined) {
  return value === '1' || value?.toLowerCase() === 'true'
}

function getQueryNumber(value: string | string[] | undefined) {
  const parsed = Number(getQueryParam(value))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function getCouponCodeForSubmit(value: string) {
  const normalized = normalizeCouponInput(value)
  return normalized || undefined
}

function getPaymentLinkUrl(created: PaymentLinkCreateResponse) {
  const candidates = [
    created.paymentUrl,
    created.paymentLink?.shortUrl,
    created.paymentLink?.short_url,
  ]
  const match = candidates.find((value) => typeof value === 'string' && /^https?:\/\//i.test(value))

  return typeof match === 'string' ? match : ''
}

function getPaymentErrorCode(error: unknown) {
  if (error instanceof PaymentApiError) {
    const code =
      error.body?.code ||
      error.body?.data?.code ||
      error.body?.errorCode ||
      error.body?.data?.errorCode

    return typeof code === 'string' ? code : ''
  }

  return ''
}

function getTrialEligibilityMessage(quote: TrialQuoteResponse) {
  return (
    quote.eligibility?.message ||
    quote.message ||
    getTrialFallbackMessageFromCode(quote.eligibility?.code || quote.code) ||
    'This trial is not available for this account. You can still choose a paid plan.'
  )
}

function isTrialPaidFallbackError(error: unknown) {
  return isTrialFallbackCode(getPaymentErrorCode(error))
}

function getTrialPaidFallbackMessage(error: unknown) {
  return getTrialFallbackMessageFromCode(getPaymentErrorCode(error)) || getErrorMessage(
    error,
    'This trial is not available for this account. You can still choose a paid plan.'
  )
}

function isTrialFallbackCode(code?: string) {
  return code === 'TRIAL_NOT_AVAILABLE' || code === 'ACTIVE_ACCESS_EXISTS'
}

function getTrialFallbackMessageFromCode(code?: string) {
  if (code === 'TRIAL_NOT_AVAILABLE') {
    return 'This trial is not available right now. You can still choose a paid plan.'
  }

  if (code === 'ACTIVE_ACCESS_EXISTS') {
    return 'You already have active access. Paid plans remain available if you want to extend it.'
  }

  return ''
}

function extractSessionUser(body: any): PaymentSessionUser | null {
  const candidates = [
    body?.user,
    body?.data?.user,
    body?.data?.profile,
    body?.data,
    body,
  ].filter((candidate) => candidate && typeof candidate === 'object')

  for (const candidate of candidates) {
    const phoneE164 =
      candidate.phoneE164 ||
      candidate.mobileE164 ||
      candidate.phone ||
      candidate.mobile ||
      candidate.phoneNumber ||
      candidate.profile?.phoneE164 ||
      ''
    const email = candidate.email || candidate.profile?.email || ''
    const name = candidate.name || candidate.fullName || candidate.profile?.name || ''

    if (phoneE164 || email || name) {
      return {
        email: typeof email === 'string' ? email : undefined,
        name: typeof name === 'string' ? name : undefined,
        phoneE164: typeof phoneE164 === 'string' ? phoneE164 : undefined,
      }
    }
  }

  return null
}

function maskEmail(email: string) {
  const [name, domain] = email.split('@')

  if (!name || !domain) {
    return email
  }

  const visible = name.slice(0, Math.min(2, name.length))
  return `${visible}${name.length > 2 ? '***' : ''}@${domain}`
}

function maskPhone(phoneE164: string) {
  return phoneE164.replace(/^(\+91)(\d{2})\d{4}(\d{4})$/, '$1 $2****$3')
}

function getAccountSetupErrorMessage(error: unknown, fallback: string) {
  const code = getPaymentErrorCode(error)

  if (code === 'PAYMENT_NOT_CAPTURED') {
    return 'Payment is still processing. Check status again in a moment.'
  }

  if (code === 'ACCOUNT_ALREADY_READY') {
    return 'This account is already ready. Please log in normally.'
  }

  if (code === 'GUEST_CHECKOUT_CLAIM_INVALID') {
    return 'Checkout session could not be verified. Please contact support with your payment id.'
  }

  if (code === 'EMAIL_ALREADY_IN_USE') {
    return 'This email already has an account. Use that account or choose another email.'
  }

  if (code === 'PHONE_EMAIL_MISMATCH') {
    return 'This phone number is linked to another email. Use the existing email for this phone.'
  }

  return getErrorMessage(error, fallback)
}

function validateBillingDetails(details: BillingDetails, phone: string) {
  if (!/^[0-9]{10}$/.test(phone.trim())) {
    return 'Enter a valid 10-digit mobile number.'
  }

  if (!details.email.trim()) {
    return 'Enter your email address.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) {
    return 'Enter a valid email address.'
  }

  return ''
}

function formatStoredPhoneLabel(phoneE164: string) {
  if (!phoneE164) {
    return 'your checkout phone number'
  }

  return phoneE164.replace(/^(\+91)(\d{2})\d{4}(\d{4})$/, '$1 $2****$3')
}

function getDirectPaymentLink(order: BillingOrderResponse) {
  const rawOrder = order as BillingOrderResponse & {
    paymentLink?: string
    paymentUrl?: string
    checkoutUrl?: string
    shortUrl?: string
    short_url?: string
    link?: {
      short_url?: string
      url?: string
    }
    payment?: {
      short_url?: string
      url?: string
    }
    razorpay?: BillingOrderResponse['razorpay'] & {
      short_url?: string
    }
  }
  const candidates = [
    rawOrder.paymentLink,
    rawOrder.paymentUrl,
    rawOrder.checkoutUrl,
    rawOrder.shortUrl,
    rawOrder.short_url,
    rawOrder.link?.short_url,
    rawOrder.link?.url,
    rawOrder.payment?.short_url,
    rawOrder.payment?.url,
    rawOrder.razorpay?.paymentLink,
    rawOrder.razorpay?.paymentUrl,
    rawOrder.razorpay?.checkoutUrl,
    rawOrder.razorpay?.shortUrl,
    rawOrder.razorpay?.short_url,
  ]
  const match = candidates.find((value) => typeof value === 'string' && /^https?:\/\//i.test(value))

  return typeof match === 'string' ? match : ''
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof PaymentApiError) {
    return error.message || fallback
  }

  if (error instanceof Error) {
    return error.message || fallback
  }

  return fallback
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}
