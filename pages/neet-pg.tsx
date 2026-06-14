import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import SiteNavbar from '@/components/SiteNavbar'
import { DiscountPlanSection, type DiscountDisplayPlan } from '@/components/v2/DiscountPlanSection'
import VirtualStudyHero from '@/components/v2/VirtualStudyHero'
import {
  apiFetch,
  BillingPlan,
  CourseOptionsResponse,
  CourseSummary,
  formatCurrency,
  PublicBillingPlansResponse,
} from '@/lib/payment-client'
import { fetchBestCouponOffers, type PlanCouponOffer } from '@/lib/plan-coupon-offers'

const ECOSYSTEM_IMAGE = '/img/v2/ecosystem.png'
const GOOGLE_PLAY_HREF = 'https://play.google.com/store/apps/details?id=in.virtuallibrary.virtuallibrary&hl=en_IN'
const APP_STORE_HREF = 'https://apps.apple.com/in/app/virtual-library/id6761748966'
const DEFAULT_COURSE_SLUG = 'neet-pg'

type IconName =
  | 'video'
  | 'focus'
  | 'heart'
  | 'users'
  | 'target'
  | 'rank'
  | 'chart'
  | 'leaf'
  | 'check'
  | 'x'
  | 'phone'
  | 'clock'
  | 'spark'
  | 'chat'
  | 'stethoscope'
  | 'graduation'
  | 'microscope'
  | 'landmark'
  | 'flask'
  | 'train'
  | 'hospital'
  | 'building'
  | 'bank'
  | 'briefcase'

type Feature = {
  icon: IconName
  title: string
  description: string
}

type Audience = {
  icon: IconName
  title: string
  description?: string
  tone: string
  iconTone: string
}

type DisplayPlan = DiscountDisplayPlan

const FEATURES: Feature[] = [
  {
    icon: 'video',
    title: '24x7 Live Virtual Study Rooms',
    description: 'Study with serious aspirants anytime. Cameras on, distractions off.',
  },
  {
    icon: 'focus',
    title: 'Focus Mode App Blocker',
    description: 'Block distracting apps while studying. Stay focused with full control over your phone.',
  },
  {
    icon: 'heart',
    title: 'Live Mental Health Sessions',
    description: 'Expert led sessions to help students manage stress, burnout, anxiety, and exam pressure.',
  },
  {
    icon: 'graduation',
    title: 'Live Mentorship Sessions',
    description: 'Regular strategy sessions by toppers and seniors for planning, revision, and consistency.',
  },
  {
    icon: 'chart',
    title: 'Revision Tracker',
    description: 'Spaced repetition system with customizable reminders.',
  },
  {
    icon: 'users',
    title: 'Find Study Buddy',
    description: 'Connect with a study partner who matches your exam, schedule, and preparation rhythm.',
  },
  {
    icon: 'users',
    title: 'Female - Only Community',
    description: 'A safe and focused environment built exclusively for female aspirants.',
  },
  {
    icon: 'leaf',
    title: 'Daily Meditation & Yoga Sessions',
    description: '30 min. Morning and evening sessions to improve focus, reduce stress, and boost mental clarity.',
  },
  {
    icon: 'clock',
    title: 'Early Bird & Night Owl Groups',
    description: 'Dedicated groups for early morning and late-night learners who need schedule-based accountability.',
  },
  {
    icon: 'target',
    title: 'Goal Tracking',
    description: 'Personal progress monitoring and milestone tracking.',
  },
  {
    icon: 'chat',
    title: 'Community Support',
    description: 'Exam-specific communities for doubt discussions and sharing study materials.',
  },
]

const ALONE_POINTS = [
  'Loneliness while studying alone',
  'Inconsistent daily routine',
  'Constant phone distractions',
  'Procrastination spirals',
  'Burnout with no support',
  'No one to hold you accountable',
]

const TOGETHER_POINTS = [
  '24x7 live study rooms with real aspirants',
  'Daily rankings, streaks & accountability',
  'Built-in focus mode & app blocker',
  'Peer support & Find Study partners',
  'Doubt discussions & study material sharing',
  'Mentors, psychiatrists & wellness sessions',
  'Exam-specific WhatsApp & Telegram communities',
]

const AUDIENCES: Audience[] = [
  {
    icon: 'stethoscope',
    title: 'NEET PG aspirants',
    description: 'Preparing for NEET PG 2027, 2028 & 2029',
    tone: 'bg-[#fff4df]',
    iconTone: 'text-[#6d35df]',
  },
  {
    icon: 'graduation',
    title: 'INI-CET Aspirants',
    tone: 'bg-[#e7fae7]',
    iconTone: 'text-[#6d35df]',
  },
  {
    icon: 'microscope',
    title: 'FMGE Aspirants',
    tone: 'bg-[#fff2e3]',
    iconTone: 'text-[#6d35df]',
  },
  {
    icon: 'landmark',
    title: 'MBBS Students',
    description: '1st Year to Internship',
    tone: 'bg-[#e8ddff]',
    iconTone: 'text-[#6d35df]',
  },
  {
    icon: 'flask',
    title: 'USMLE & PLAB Aspirants',
    tone: 'bg-[#fbffc9]',
    iconTone: 'text-[#6d35df]',
  },
  {
    icon: 'hospital',
    title: 'NEET MDS Aspirants',
    tone: 'bg-[#e1e1e1]',
    iconTone: 'text-[#6d35df]',
  },
  {
    icon: 'heart',
    title: 'NEET SS Aspirants',
    tone: 'bg-[#fff3df]',
    iconTone: 'text-[#6d35df]',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Choose Your Plan',
    description: 'Select a subscription that fits your preparation timeline.',
    tone: 'bg-[linear-gradient(145deg,#fff7e8,#fff1da)]',
    href: '#plans',
    cta: 'View plans',
    external: false,
  },
  {
    number: '02',
    title: 'Verify & Pay',
    description: 'Complete phone verification and secure Razorpay payment.',
    tone: 'bg-[linear-gradient(145deg,#efffea,#e6fbe0)]',
    href: '/payment?source=home',
    cta: 'Open payment',
    external: false,
  },
  {
    number: '03',
    title: 'Start Learning',
    description: 'Download the app and join thousands of focused aspirants.',
    tone: 'bg-[linear-gradient(145deg,#eee7ff,#ddd2ff)]',
    href: GOOGLE_PLAY_HREF,
    cta: 'Get the app',
    external: true,
  },
]

const TESTIMONIALS = [
  {
    quote:
      'Virtual Library helped me stay consistent throughout my preparation. I never felt alone during my INI-CET journey. The accountability and study environment made a huge difference in my performance.',
    name: 'Dr. Kritika Handa',
    exam: 'INI-CET, May 2026',
    rank: 'AIR 32',
  },
  {
    quote:
      "Virtual Library supported me through some of the toughest days of preparation. I'm truly grateful that I joined at the right time. The community and accountability helped me stay on track when it mattered most.",
    name: 'Dr. Linda S. Rubi',
    exam: 'INI-CET, May 2026',
    rank: 'AIR 83',
  },
  {
    quote:
      'It would have been much harder to get through the NEET PG journey without Virtual Library. It played a major role in helping me maintain consistency and stay focused throughout my preparation.',
    name: 'Dr. Arushi',
    exam: 'NEET PG, 2025',
    rank: 'AIR 1189',
  },
]

const HOME_FAQS = [
  {
    question: 'What is Virtual Library?',
    answer: [
      'A self-study and accountability platform designed to help aspirants stay consistent, focused, and motivated.',
    ],
  },
  {
    question: 'How do I start using the Virtual Library app?',
    answer: [
      "Select a plan, complete your subscription, download the app, and log in using the same details you used during payment. That's it - you'll be ready to start studying.",
    ],
  },
  {
    question: 'Who can join?',
    answer: [
      'Anyone can join, including NEET PG, INI-CET, FMGE, USMLE, PLAB, NEET MDS, NEET SS aspirants, and MBBS students.',
    ],
  },
  {
    question: 'How do the 24x7 Study Rooms work?',
    answer: [
      'You can join live study rooms anytime and study alongside serious aspirants from across India in a focused, productive environment.',
    ],
  },
  {
    question: 'What are Daily Rankings?',
    answer: [
      'Daily rankings are leaderboards based on study hours and consistency. They help you stay accountable and make progress visible.',
    ],
  },
  {
    question: 'How does the App Blocker work?',
    answer: [
      "Virtual Library's Focus Mode blocks distracting apps during study sessions so you can study without interruptions.",
      'Solo Focus Mode: Create your own study session, such as 2 hours. Once the session starts, selected distracting apps remain blocked until the session ends.',
      'Group Focus Mode: Create a focus room and share the code with friends or your study group. Anyone who joins the room will have distracting apps blocked for the duration of the session, helping everyone stay accountable together.',
    ],
  },
  {
    question: 'Can I use coaching apps or classes during Focus Mode?',
    answer: [
      'Yes. Before starting a session, you can add coaching apps and other study resources to your Allow List so they remain accessible during Focus Mode.',
    ],
  },
  {
    question: 'Is it compulsory to turn the camera on?',
    answer: [
      'No. Keeping your camera on is completely optional.',
      'However, many members choose to keep their cameras on as it helps improve accountability, reduce distractions, and create a more library-like study environment.',
    ],
  },
  {
    question: 'What is the Revision Tracker?',
    answer: [
      'Revision Tracker is a smart revision system with spaced repetition reminders to help you retain concepts and revise on time.',
    ],
  },
  {
    question: 'What are Mentorship Sessions?',
    answer: [
      'Mentorship Sessions are regular sessions by toppers and seniors covering study strategy, revision planning, time management, and consistency.',
    ],
  },
  {
    question: 'What are Mental Health Sessions?',
    answer: [
      'Mental Health Sessions are conducted by psychiatrists to help manage stress, burnout, anxiety, motivation, and overall well-being during preparation.',
    ],
  },
  {
    question: 'Is there a Girls-Only Community?',
    answer: [
      'Yes. Dedicated study rooms and groups are available for female aspirants.',
    ],
  },
  {
    question: 'How do I join the WhatsApp and Telegram communities?',
    answer: [
      'After subscribing, you will receive all the necessary instructions and links to join the Virtual Library WhatsApp and Telegram communities.',
    ],
  },
  {
    question: 'Is Virtual Library a coaching platform?',
    answer: [
      'No. Virtual Library is a self-study ecosystem and does not provide lectures, courses, or study material.',
    ],
  },
  {
    question: 'Can I try Virtual Library before purchasing?',
    answer: [
      'Yes. You can explore the free features of the app before deciding to subscribe.',
    ],
  },
  {
    question: 'Can Virtual Library guarantee a rank?',
    answer: [
      'No. However, it helps improve consistency, focus, accountability, and study discipline - key factors for exam success.',
    ],
  },
  {
    question: 'Why should I join Virtual Library?',
    answer: [
      'Because staying consistent is easier when you have accountability, community support, focus tools, mentorship, mental health support, and a structured study environment - all in one place.',
    ],
  },
]

const FALLBACK_PLANS: DisplayPlan[] = [
  {
    key: 'one-month',
    title: '1 Month',
    durationMonths: 1,
    price: '₹699',
    originalPrice: '₹999',
    monthlyPrice: '₹699/month',
    billingText: 'Billed monthly',
    savingsLabel: 'SAVE 30%',
    valuePill: '≈ ₹23/day',
    savingsText: 'You save ₹300 vs regular price!',
    href: '/payment?source=home&durationMonths=1',
    featured: true,
  },
  {
    key: 'six-months',
    title: '6 Months',
    durationMonths: 6,
    price: '₹1,999',
    originalPrice: '₹3,000',
    monthlyPrice: '₹333/month',
    billingText: 'Billed ₹1,999',
    savingsLabel: 'SAVE 33%',
    valuePill: '≈ ₹333/Month',
    savingsText: 'Most chosen for focused prep cycles.',
    href: '/payment?source=home&durationMonths=6',
    badge: 'MOST POPULAR',
  },
  {
    key: 'twelve-months',
    title: '12 Months',
    durationMonths: 12,
    price: '₹2,999',
    originalPrice: '₹5,000',
    monthlyPrice: '₹250/month',
    billingText: 'Billed ₹2,999',
    savingsLabel: 'SAVE 40%',
    valuePill: '≈ ₹250/Month',
    savingsText: 'Built for long preparation timelines.',
    href: '/payment?source=home&durationMonths=12',
  },
  {
    key: 'twenty-four-months',
    title: '24 Months',
    durationMonths: 24,
    price: '₹3,999',
    originalPrice: '₹7,000',
    monthlyPrice: '₹167/month',
    billingText: 'Billed ₹3,999',
    savingsLabel: 'SAVE 42%',
    valuePill: '≈ ₹167/Month — Max Savings',
    savingsText: 'Maximum value for repeat exam cycles.',
    href: '/payment?source=home&durationMonths=24',
  },
]

export default function Home() {
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [planCouponOffers, setPlanCouponOffers] = useState<Record<string, PlanCouponOffer | null>>({})
  const [couponPreviewLoading, setCouponPreviewLoading] = useState(false)
  const [copiedCouponPlanId, setCopiedCouponPlanId] = useState('')
  const [availableCourses, setAvailableCourses] = useState<CourseSummary[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [pricingLoading, setPricingLoading] = useState(true)
  const [pricingError, setPricingError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadPlans() {
      setPricingLoading(true)
      setCouponPreviewLoading(false)
      setPlanCouponOffers({})

      try {
        const [response, courseResponse] = await Promise.all([
          apiFetch<PublicBillingPlansResponse>('/billing/plans/public', {
            headers: {
              Accept: 'application/json',
            },
          }),
          apiFetch<CourseOptionsResponse>('/courses/options', {
            skipAuth: true,
            headers: {
              Accept: 'application/json',
            },
          }).catch(() => null),
        ])

        if (!isMounted) {
          return
        }

        const nextPlans = sortPlans(response.plans || [])
        setPlans(nextPlans)
        setAvailableCourses(sortCourseOptions(courseResponse?.courses || []))
        setPricingError('')
        setPricingLoading(false)

        if (nextPlans.length) {
          setCouponPreviewLoading(true)
          const offers = await fetchBestCouponOffers(nextPlans)

          if (isMounted) {
            setPlanCouponOffers(offers)
          }
        }
      } catch (error) {
        if (!isMounted) {
          return
        }

        setPlans([])
        setPlanCouponOffers({})
        setPricingError(getErrorMessage(error))
      } finally {
        if (isMounted) {
          setPricingLoading(false)
          setCouponPreviewLoading(false)
        }
      }
    }

    void loadPlans()

    return () => {
      isMounted = false
    }
  }, [])

  const courseOptions = useMemo(() => mergeCourseOptions(availableCourses, getCourseOptionsFromPlans(plans)), [availableCourses, plans])
  const selectedCourse = useMemo(
    () => getSelectedCourseOption(courseOptions, selectedCourseId),
    [courseOptions, selectedCourseId]
  )

  useEffect(() => {
    if (!courseOptions.length) {
      return
    }

    setSelectedCourseId((currentCourseId) => {
      if (courseOptions.some((course) => course.courseId === currentCourseId)) {
        return currentCourseId
      }

      return getDefaultCourseId(courseOptions)
    })
  }, [courseOptions])

  const displayPlans = useMemo(() => {
    if (!plans.length) {
      return FALLBACK_PLANS.map((fallback) => withCheckoutCourse(fallback, selectedCourse))
    }

    const selectedCoursePlans = getPlansForCourse(plans, selectedCourseId)
    const recommendedPlanId = getRecommendedPlanId(selectedCoursePlans)
    const livePlansByDuration = new Map<number, BillingPlan>()

    selectedCoursePlans.forEach((plan) => {
      const existingPlan = livePlansByDuration.get(plan.durationMonths)

      if (!existingPlan || plan.amountPaise < existingPlan.amountPaise) {
        livePlansByDuration.set(plan.durationMonths, plan)
      }
    })

    return Array.from(livePlansByDuration.values()).map((plan) => {
      return getDisplayPlanFromBillingPlan(plan, plan.planId === recommendedPlanId, selectedCourse, planCouponOffers[plan.planId])
    })
  }, [planCouponOffers, plans, selectedCourse, selectedCourseId])

  async function handleCopyCoupon(planId: string, code: string) {
    if (!code) {
      return
    }

    try {
      await navigator.clipboard?.writeText(code)
      setCopiedCouponPlanId(planId)
      window.setTimeout(() => {
        setCopiedCouponPlanId((current) => (current === planId ? '' : current))
      }, 1600)
    } catch {
      setCopiedCouponPlanId('')
    }
  }

  return (
    <>
      <Head>
        <title>Virtual Library - Study Consistently From Home</title>
        <meta
          name="description"
          content="Join Virtual Library for 24/7 live study rooms, focus tools, rankings, study partners, and accountability for serious aspirants."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen overflow-x-hidden bg-[#f7f6fb] text-[#171322]">
        <SiteNavbar />
        <main>
          <VirtualStudyHero
            eyebrowText="India's Premier NEET-PG platform"
            googlePlayHref={GOOGLE_PLAY_HREF}
            appStoreHref={APP_STORE_HREF}
          />
          <FeatureSection />
          <TogetherSection />
          <AudienceSection />
          <SafetySection />
          <PocketSection />
          <StudyEcosystemSection />
          <DiscountPlanSection
            copiedCouponPlanId={copiedCouponPlanId}
            couponPreviewLoading={couponPreviewLoading}
            displayPlans={displayPlans}
            onCopyCoupon={handleCopyCoupon}
            pricingError={pricingError}
            pricingLoading={pricingLoading}
          />
          <StepsSection />
          <TestimonialsSection />
          <HomeFaqSection />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>
    </>
  )
}

function FeatureSection() {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null)

  return (
    <section id="features" className="scroll-mt-20 bg-[linear-gradient(180deg,#ffffff_0%,#fbf9ff_100%)] py-16 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mx-auto max-w-[18rem] text-[1.65rem] font-extrabold leading-tight tracking-normal text-[#090713] sm:max-w-3xl sm:text-5xl">
            Everything You Need to Succeed
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-[#8a6fb8] sm:text-lg sm:leading-8">
            All features designed to help you maintain consistency, focus, and accountability
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const isExpanded = expandedFeature === index

            return (
              <button
                key={feature.title}
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`feature-description-${index}`}
                onClick={() => setExpandedFeature(isExpanded ? null : index)}
                className="group w-full rounded-[22px] border border-[#e5deee] bg-white/95 p-5 text-left ring-1 ring-white/70 transition duration-300 hover:-translate-y-1 hover:border-[#c7b3ff] sm:min-h-[252px] sm:cursor-default sm:rounded-[28px] sm:p-7"
              >
                <div className="flex items-center gap-4 sm:block">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] bg-[#7c3aed] text-white ring-1 ring-[#7c3aed] transition group-hover:scale-105 sm:h-14 sm:w-14 sm:rounded-[20px]">
                    <Icon name={feature.icon} className="h-[21px] w-[21px] sm:h-6 sm:w-6" />
                  </span>

                  <div className="min-w-0 flex-1 sm:mt-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[0.98rem] font-extrabold leading-5 tracking-normal text-[#090713] sm:text-lg sm:leading-6">
                        {feature.title}
                      </h3>
                      <ChevronDownIcon
                        className={`h-5 w-5 shrink-0 text-[#7c3aed] transition-transform duration-300 sm:hidden ${isExpanded ? 'rotate-180' : ''
                          }`}
                      />
                    </div>

                    <p
                      id={`feature-description-${index}`}
                      className={`overflow-hidden text-sm font-medium leading-6 text-[#76629b] transition-all duration-300 sm:mt-4 sm:max-h-none sm:opacity-100 ${isExpanded ? 'mt-3 max-h-32 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TogetherSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fbf8ff_44%,#f3edff_100%)] py-14 sm:py-20">
      <div className="absolute left-1/2 top-24 h-56 w-[38rem] -translate-x-1/2 rounded-full bg-[#8b5cf6]/14 blur-3xl" />
      <div className="absolute -left-24 bottom-10 h-48 w-48 rounded-full bg-[#6d35df]/12 blur-3xl" />
      <div className="absolute -right-24 top-36 h-48 w-48 rounded-full bg-[#b79cff]/16 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex h-8 items-center justify-center rounded-full bg-[#e8ddff] px-5 text-[0.72rem] font-bold uppercase tracking-normal text-[#6d35df] shadow-[0_12px_30px_rgba(109,53,223,0.12)] ring-1 ring-white/70">
            Why we're different
          </p>
          <h2 className="mx-auto mt-5 max-w-xl text-[1.55rem] font-extrabold leading-tight tracking-normal text-[#090713] sm:text-5xl">
            Studying alone vs studying together
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-6 text-[#8a6fb8] sm:text-lg sm:leading-8">
            The difference isn't the syllabus. It's the environment around it.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-2 lg:gap-8">
          <ComparisonCard
            title="Studying at home, alone"
            points={ALONE_POINTS}
            icon="x"
            className="border-[#eee7f4] bg-[linear-gradient(145deg,#ffffff_0%,#fffafa_58%,#fff4f1_100%)] text-[#ff4b4b] shadow-[0_28px_80px_rgba(52,38,88,0.13)]"
          />
          <ComparisonCard
            title="With Virtual Library"
            points={TOGETHER_POINTS}
            icon="check"
            className="border-white/14 bg-[radial-gradient(circle_at_88%_92%,rgba(190,163,255,0.98)_0%,rgba(126,65,231,0.96)_37%,rgba(35,25,84,0.98)_68%,#11162d_100%)] text-white shadow-[0_34px_90px_rgba(91,48,196,0.34)]"
            dark
          />
        </div>

        <div className="mt-9 text-center">
          <a
            href="#plans"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8c8ff] bg-white px-7 text-sm font-bold text-[#6d35df] shadow-[0_18px_44px_rgba(109,53,223,0.14)] transition hover:-translate-y-0.5 hover:border-[#6d35df] hover:shadow-[0_24px_58px_rgba(109,53,223,0.20)]"
          >
            Join now
          </a>
        </div>
      </div>
    </section>
  )
}

function AudienceSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f3edff_0%,#fbf8ff_100%)] py-12 sm:py-20 lg:py-24">
      <div className="absolute left-1/2 top-16 h-56 w-[34rem] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
      <div className="absolute -left-28 bottom-10 h-52 w-52 rounded-full bg-[#6d35df]/10 blur-3xl" />
      <div className="absolute -right-28 top-28 h-52 w-52 rounded-full bg-[#b59cff]/18 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-12">
          <div className="mx-auto max-w-3xl text-center lg:sticky lg:top-28 lg:mx-0 lg:text-left">
            <p className="inline-flex h-8 items-center justify-center rounded-[12px] bg-[#e4d8ff] px-5 text-[0.72rem] font-bold uppercase tracking-normal text-[#6d35df] shadow-[0_12px_30px_rgba(109,53,223,0.12)] ring-1 ring-white/70">
              WHO IT'S FOR
            </p>
            <h2 className="mx-auto mt-5 max-w-xl text-[1.65rem] font-extrabold leading-tight tracking-normal text-[#090713] sm:text-5xl lg:mx-0 lg:text-[2.9rem]">
              Built for every stage of your Medical Journey
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-[#8a6fb8] sm:text-lg sm:leading-8 lg:mx-0">
              If you're studying long hours from home, this is your ecosystem.
            </p>
            <p className="mt-8 hidden max-w-md text-base font-medium leading-7 text-[#8a6fb8] lg:block">
              This is a self-study platform - so your exam doesn't matter. If you still want a focused environment, accountability, and consistency in your studies, Virtual Library welcomes you.
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-3xl gap-4 sm:mt-2 md:grid-cols-2 lg:mx-0 lg:max-w-none">
            {AUDIENCES.map((audience, index) => (
              <article
                key={audience.title}
                className={`group flex min-h-[76px] items-center gap-4 rounded-[22px] border border-[#e9e1f6] bg-white/95 px-4 py-4 ring-1 ring-white/80 transition duration-300 hover:-translate-y-0.5 hover:border-[#d8c9ff] sm:min-h-[92px] sm:rounded-[24px] sm:px-5 ${index === AUDIENCES.length - 1 ? 'md:col-span-2' : ''}`}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[#eadfff] bg-white text-[#7c3aed] transition group-hover:scale-105 group-hover:border-[#d8c9ff] sm:h-12 sm:w-12 sm:rounded-[16px]"
                >
                  <Icon name={audience.icon} className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[0.95rem] font-extrabold leading-5 tracking-normal text-[#090713] sm:text-base">
                    {audience.title}
                  </h3>
                  {audience.description && (
                    <p className="mt-1 text-xs font-semibold leading-5 text-[#8a6fb8] sm:text-sm">
                      {audience.description}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-9 max-w-2xl text-center text-sm font-medium leading-6 text-[#8a6fb8] sm:text-base sm:leading-7 lg:hidden">
          This is a self-study platform - so your exam doesn't matter. If you still want a focused environment, accountability, and consistency in your studies, Virtual Library welcomes you.
        </p>
      </div>
    </section>
  )
}

function SafetySection() {
  return (
    <section className="relative overflow-hidden bg-[#f3edff] px-4 py-12 sm:px-6 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-16 h-56 w-[34rem] -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <p className="inline-flex h-8 items-center justify-center rounded-[12px] bg-[#e1d5ff] px-5 text-[0.72rem] font-bold tracking-normal text-[#6d35df] shadow-[0_12px_30px_rgba(109,53,223,0.10)] ring-1 ring-white/70">
            Community & Safety
          </p>
          <h2 className="mx-auto mt-5 max-w-xl text-[1.75rem] font-extrabold leading-tight tracking-normal text-[#090713] sm:text-5xl lg:mx-0 lg:text-[2.85rem]">
            A Safe and Supportive Virtual Library
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-[#817394] sm:text-lg sm:leading-8 lg:mx-0">
            Our Virtual Library provides a secure and welcoming space for everyone. With 64% of our members being female, we emphasize privacy and ensure a safe environment for all users.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:max-w-md">
            {[
              { label: 'Female members', value: '64%', tone: 'bg-[#7c35df]' },
              { label: 'Male members', value: '36%', tone: 'bg-[#9c7ce8]' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[18px] border border-white/70 bg-white/74 px-4 py-4 text-left shadow-[0_14px_34px_rgba(59,43,101,0.07)]"
              >
                <span className={`block h-2 w-9 rounded-full ${stat.tone}`} />
                <p className="mt-4 text-2xl font-extrabold leading-none text-[#090713]">{stat.value}</p>
                <p className="mt-2 text-xs font-bold leading-5 text-[#817394]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[560px] lg:mx-0 lg:ml-auto">
          <div className="relative mx-auto aspect-square max-w-[360px] sm:max-w-[430px] lg:max-w-[460px]">
            <div
              className="h-full w-full rounded-full shadow-[0_26px_70px_rgba(109,53,223,0.18)]"
              style={{
                background: 'conic-gradient(#7c35df 0deg 230.4deg, #9c7ce8 230.4deg 360deg)',
              }}
              aria-label="Gender split: 64% Female and 36% Male"
              role="img"
            >
              <span className="absolute left-[25%] top-[38%] text-lg font-extrabold text-white sm:text-2xl">
                36%
              </span>
              <span className="absolute right-[22%] top-[51%] text-lg font-extrabold text-white sm:text-2xl">
                64%
              </span>
            </div>

            <div className="absolute left-[16%] top-[-4%] hidden h-[29%] w-px bg-[#090713] md:block">
              <span className="absolute -top-7 -left-4 text-sm font-bold text-[#090713]">Male</span>
              <span className="absolute bottom-0 left-[-3px] h-1.5 w-1.5 rounded-full bg-[#090713]" />
            </div>
            <div className="absolute bottom-[-7%] right-[25%] hidden h-[27%] w-px bg-[#090713] md:block">
              <span className="absolute bottom-[-1.55rem] -left-6 text-sm font-bold text-[#090713]">Female</span>
              <span className="absolute top-0 left-[-3px] h-1.5 w-1.5 rounded-full bg-[#090713]" />
            </div>
          </div>

          <div className="mt-9 flex justify-center gap-4 text-sm font-bold text-[#090713] md:hidden">
            <span>Male 36%</span>
            <span>Female 64%</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function PocketSection() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-12 sm:px-6 sm:py-16 lg:py-14">
      <div className="mx-auto max-w-4xl xl:max-w-5xl">
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#11172f] px-5 py-9 text-white shadow-[0_30px_78px_rgba(33,22,82,0.30)] ring-1 ring-[#d9ccff]/20 sm:rounded-[32px] sm:px-9 sm:py-12 lg:grid lg:grid-cols-[1fr_0.82fr] lg:items-center lg:gap-10 lg:px-12 lg:py-12 xl:gap-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-95"
            style={{
              background:
                'radial-gradient(circle at 78% 16%, rgba(124,58,237,0.48), transparent 34%), radial-gradient(circle at 18% 4%, rgba(255,255,255,0.12), transparent 30%), linear-gradient(135deg, #11172f 0%, #24164f 48%, #151a33 100%)',
            }}
          />
          <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-white/45" />

          <div className="relative mx-auto max-w-3xl lg:mx-0 lg:max-w-none">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/12 px-4 py-2 text-xs font-bold text-[#eee8ff] shadow-[0_16px_36px_rgba(0,0,0,0.16)] backdrop-blur">
              <Icon name="spark" className="h-4 w-4 text-[#cbbdff]" />
              India's largest online study ecosystem
            </p>

            <h2 className="mt-6 max-w-2xl text-[1.9rem] font-extrabold leading-[1.28] tracking-normal sm:text-4xl sm:leading-tight lg:max-w-xl lg:text-[2.45rem] xl:text-[2.65rem]">
              You'll never have to study alone again.
            </h2>

            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/64 sm:text-base sm:leading-7 lg:max-w-xl">
              Live sessions, study buddy groups, emotional support, and a productive environment built
              around the psychology of consistency.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {[
                { icon: 'users' as IconName, label: 'Study buddies' },
                { icon: 'chat' as IconName, label: 'Doubt circles' },
                { icon: 'heart' as IconName, label: 'Mental wellness' },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 text-xs font-bold text-white/76 shadow-[0_12px_28px_rgba(0,0,0,0.12)] backdrop-blur"
                >
                  <Icon name={chip.icon} className="h-4 w-4 text-[#d5cbff]" />
                  {chip.label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:mt-0 lg:max-w-none lg:gap-3 xl:gap-4">
            {[
              { value: '3,000+', label: 'Serious Aspirants' },
              { value: '1.2M+', label: 'Hours studied together' },
              { value: '20+', label: 'Competitive Exams' },
              { value: '60%+', label: 'Female members' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[18px] border border-white/10 bg-white/[0.075] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_18px_44px_rgba(0,0,0,0.14)] backdrop-blur sm:rounded-[24px] lg:p-5 xl:p-6"
              >
                <p className="text-3xl font-extrabold tracking-normal text-white lg:text-[2rem] xl:text-4xl">{stat.value}</p>
                <p className="mt-2 text-xs font-bold leading-5 text-white/52">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StudyEcosystemSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fbf8ff_42%,#eee8ff_100%)] px-4 py-12 sm:px-6 sm:py-20 lg:py-14">
      <div className="pointer-events-none absolute left-1/2 top-20 h-52 w-[30rem] -translate-x-1/2 rounded-full bg-[#8b5cf6]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(109,53,223,0.07))]" />

      <div className="relative mx-auto max-w-5xl text-center lg:grid lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-10 lg:text-left xl:gap-12">
        <div>
          <h2 className="mx-auto max-w-[21rem] text-[2rem] font-extrabold leading-tight tracking-normal text-[#090713] sm:max-w-3xl sm:text-5xl lg:mx-0 lg:max-w-[29rem] lg:text-[2.55rem] xl:text-[2.8rem]">
            Carry your study ecosystem in your pocket
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg font-medium leading-7 text-[#8a6fb8] sm:text-2xl sm:leading-9 lg:mx-0 lg:max-w-[28rem] lg:text-lg lg:leading-7">
            Everything you need to learn — organized, synced, and always within reach.
          </p>
        </div>

        <div className="relative mx-auto mt-9 max-w-4xl sm:mt-12 lg:mt-0 lg:max-w-none">
          <div className="pointer-events-none absolute inset-x-10 bottom-5 h-20 rounded-full bg-[#6d35df]/18 blur-3xl lg:inset-x-12 lg:h-16" />
          <img
            src={ECOSYSTEM_IMAGE}
            alt="Virtual Library app screens for study rooms, focus mode, and sessions"
            className="relative mx-auto w-full max-w-[760px] object-contain drop-shadow-[0_28px_38px_rgba(42,25,91,0.16)] sm:max-w-[820px] lg:max-w-[560px] xl:max-w-[620px]"
          />
        </div>
      </div>
    </section>
  )
}

function StepsSection() {
  return (
    <section id="steps" className="scroll-mt-20 bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mx-auto max-w-[22rem] text-[1.8rem] font-extrabold leading-tight tracking-normal text-[#090713] sm:max-w-3xl sm:text-5xl">
            Start Studying In 3 Steps
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-6 text-[#8a6fb8] sm:text-lg sm:leading-8">
            Get started in minutes and join thousands of focused NEET-PG aspirants.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:gap-6">
          {STEPS.map((step) => {
            const cardClassName = `${step.tone} group relative flex min-h-[188px] flex-col overflow-hidden rounded-[24px] border border-white/80 p-7 text-left shadow-[0_18px_44px_rgba(48,32,88,0.08)] ring-1 ring-[#eee7fb] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(82,48,170,0.14)] sm:min-h-[226px] sm:rounded-[28px] sm:p-8`
            const cardContent = (
              <>
                <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/80" />
                <p className="text-[3.2rem] font-extrabold leading-none tracking-normal text-[#c7a9ee] sm:text-[4rem]">
                  {step.number}
                </p>
                <h3 className="mt-4 text-xl font-extrabold tracking-normal text-[#090713] sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-sm flex-1 text-sm font-medium leading-6 text-[#4d465a] sm:text-base sm:leading-7">
                  {step.description}
                </p>
                <span className="mt-5 inline-flex h-9 w-fit items-center gap-2 rounded-full bg-white/80 px-4 text-xs font-extrabold text-[#6d35df] shadow-[0_12px_28px_rgba(72,48,120,0.08)] transition group-hover:bg-[#6d35df] group-hover:text-white">
                  {step.cta}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </>
            )

            if (step.external) {
              return (
                <a
                  key={step.number}
                  href={step.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cardClassName}
                >
                  {cardContent}
                </a>
              )
            }

            if (step.href.startsWith('#')) {
              return (
                <a key={step.number} href={step.href} className={cardClassName}>
                  {cardContent}
                </a>
              )
            }

            return (
              <Link key={step.number} href={step.href} className={cardClassName}>
                {cardContent}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#fbf8ff_100%)] py-12 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-20 h-48 w-[32rem] -translate-x-1/2 rounded-full bg-[#8b5cf6]/8 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex h-8 items-center justify-center rounded-[13px] bg-[#e5dcff] px-4 text-xs font-bold uppercase tracking-normal text-[#6d35df] shadow-[0_12px_28px_rgba(109,53,223,0.10)] ring-1 ring-white/70">
            SUCCESS STORIES
          </p>
          <h2 className="mx-auto mt-4 max-w-[22rem] text-[2rem] font-extrabold leading-tight tracking-normal text-[#090713] sm:max-w-3xl sm:text-4xl lg:text-[2.7rem]">
            Loved by Doctors across India
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base font-medium leading-7 text-[#707483] sm:text-lg">
            Real students. Real consistency. Real rank improvements.
          </p>
        </div>

        <div className="mx-auto mt-9 grid max-w-3xl gap-4 lg:max-w-none lg:grid-cols-3 lg:gap-5">
          {TESTIMONIALS.map((testimonial) => (
            <article
              key={testimonial.name}
              className="relative flex min-h-[300px] flex-col overflow-hidden rounded-[18px] border border-[#b995ff] bg-white px-5 py-5 text-left shadow-[0_16px_42px_rgba(48,32,88,0.08)] ring-1 ring-white/80 sm:px-6 lg:min-h-[360px]"
            >
              <span className="absolute left-5 top-3 text-5xl font-extrabold leading-none text-[#e1d4ff]">
                &ldquo;
              </span>

              <div className="relative flex flex-1 flex-col pt-7">
                <p className="text-[0.95rem] font-semibold leading-7 text-[#171322] sm:text-base">
                  &quot;{testimonial.quote}&quot;
                </p>

                <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-start">
                  <div>
                    <p className="text-base font-extrabold text-[#6d35df]">{testimonial.name}</p>
                    <p className="mt-0.5 text-xs font-bold uppercase tracking-normal text-[#9a91a8]">
                      {testimonial.exam}
                    </p>
                  </div>
                  <span className="inline-flex h-8 w-fit items-center justify-center rounded-full border border-[#bad8ff] bg-[#eff7ff] px-3 text-xs font-extrabold text-[#6d35df] shadow-[0_10px_24px_rgba(109,53,223,0.08)]">
                    {testimonial.rank}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-3xl rounded-[22px] bg-[#fff4df] px-5 py-5 shadow-[0_14px_34px_rgba(48,32,88,0.07)] ring-1 ring-[#f5e6c7] lg:max-w-none lg:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-extrabold tracking-normal text-[#ffb703]">★★★★★</p>
              <p className="mt-1 text-base font-medium text-[#4d465a]">
                <span className="font-extrabold text-[#090713]">4.9/5</span> from 2,400+ reviews
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold leading-6 text-[#4d465a]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#8b5cf6]/20 bg-white text-[#6d35df]">
                <Icon name="check" className="h-4 w-4" />
              </span>
              86% students improve consistency in 21 days
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomeFaqSection() {
  const initialFaqCount = 8
  const [expandedFaq, setExpandedFaq] = useState(0)
  const [showAllFaqs, setShowAllFaqs] = useState(false)
  const visibleFaqs = showAllFaqs ? HOME_FAQS : HOME_FAQS.slice(0, initialFaqCount)

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-white px-4 py-12 scroll-mt-24 sm:px-6 sm:py-20"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-44 w-[32rem] -translate-x-1/2 rounded-full bg-[#8b5cf6]/8 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-12">
        <div className="lg:sticky lg:top-28">
          <p className="inline-flex h-8 items-center justify-center rounded-[13px] bg-[#e5dcff] px-4 text-xs font-bold uppercase tracking-normal text-[#6d35df] shadow-[0_12px_28px_rgba(109,53,223,0.10)] ring-1 ring-white/70">
            FAQs
          </p>
          <h2 className="mt-4 max-w-xl text-[2rem] font-extrabold leading-tight tracking-normal text-[#090713] sm:text-4xl lg:text-[2.65rem]">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 max-w-md text-base font-medium leading-7 text-[#7f7898] sm:text-lg">
            A short guide to how Virtual Library works, what you get, and how to begin studying after subscribing.
          </p>
        </div>

        <div className="rounded-[26px] border border-[#e4dcf4] bg-[#fbfaff] p-2 shadow-[0_22px_70px_rgba(48,32,88,0.08)] sm:p-3">
          <div className="space-y-2">
            {visibleFaqs.map((faq, index) => {
              const isExpanded = expandedFaq === index

              return (
                <article
                  key={faq.question}
                  className={`overflow-hidden rounded-[20px] border bg-white transition duration-300 ${isExpanded
                    ? 'border-[#8b5cf6]/55 shadow-[0_16px_42px_rgba(82,48,170,0.11)]'
                    : 'border-[#ede7f8] shadow-[0_8px_24px_rgba(48,32,88,0.04)] hover:border-[#d9ccfb]'
                    }`}
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedFaq(isExpanded ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                  >
                    <span className="text-[0.98rem] font-bold leading-6 text-[#171322] sm:text-base">
                      {faq.question}
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition duration-300 ${isExpanded
                        ? 'border-[#7c3aed] bg-[#7c3aed] text-white'
                        : 'border-[#e5dcff] bg-[#f7f3ff] text-[#6d35df]'
                        }`}
                    >
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-3 px-4 pb-5 pt-0 text-sm font-medium leading-6 text-[#6f6a80] sm:px-5 sm:text-[0.95rem]">
                        {faq.answer.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="mt-3 border-t border-[#ece5f8] px-1 pt-3">
            <button
              type="button"
              onClick={() => {
                setShowAllFaqs((current) => !current)
                setExpandedFaq(0)
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-[#171322] px-5 text-sm font-bold text-white shadow-[0_16px_34px_rgba(23,19,34,0.12)] transition hover:-translate-y-0.5 hover:bg-[#2b2242] sm:w-auto sm:bg-[#7c3aed] sm:hover:bg-[#6d35df]"
            >
              {showAllFaqs ? 'Show fewer FAQs' : `Read more FAQs (${HOME_FAQS.length - initialFaqCount})`}
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform duration-300 ${showAllFaqs ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f5f1ff_100%)] px-4 py-12 sm:px-6 sm:py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[24px] bg-[#151a35] px-5 py-9 text-center text-white shadow-[0_30px_74px_rgba(26,18,52,0.28)] ring-1 ring-white/10 sm:rounded-[30px] sm:px-12 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.36),transparent_40%)]"
        />
        <p className="relative text-xs font-bold uppercase tracking-normal text-[#c8b9ff]">Your rank is waiting.</p>
        <h2 className="relative mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-normal sm:text-5xl">
          Start studying <span className="text-[#7c3aed]">consistently</span> today.
        </h2>
        <p className="relative mx-auto mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/66 sm:text-base">
          Join the ecosystem that turns intention into 7+ hours of focused study every single day.
        </p>
        <div className="relative mx-auto mt-7 grid max-w-lg gap-3">
          <a
            href="#plans"
            className="inline-flex h-12 items-center justify-center gap-3 rounded-[14px] bg-[#7c3aed] px-5 text-sm font-bold text-white shadow-[0_18px_44px_rgba(124,58,237,0.28)] transition hover:-translate-y-0.5 hover:bg-[#6d35df]"
          >
            Join Virtual Library Now
            <ArrowRightIcon className="h-5 w-5" />
          </a>
          <div className="grid grid-cols-[minmax(0,1fr)_4.5rem] overflow-hidden rounded-[14px] bg-white text-[#171322] ring-1 ring-white/10 sm:grid-cols-[minmax(0,1fr)_6rem]">
            <a
              href={GOOGLE_PLAY_HREF}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 min-w-0 items-center justify-center gap-2 border-r border-[#e5deee] px-3 text-sm font-bold transition hover:bg-[#f8f5ff]"
            >
              <span className="truncate">Google Play</span>
              <PlayStoreIcon className="h-5 w-5 shrink-0" />
            </a>
            <a
              href={APP_STORE_HREF}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center text-[#8a8a8a] transition hover:bg-[#f8f5ff] hover:text-[#171322]"
              aria-label="Download on App Store"
            >
              <AppleIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function SiteFooter() {
  const companyLinks = [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/rankings', label: 'Rankings' },
  ]
  const legalLinks = [
    { href: '/terms-and-conditions', label: 'Terms & Conditions' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/refund-policy', label: 'Refund Policy' },
  ]
  const socialLinks = [
    { href: 'https://www.instagram.com/dr.deepak_aanjna/', label: 'Instagram', icon: 'instagram' },
    { href: 'https://www.youtube.com/@Virtuallibrary.neetpg26', label: 'YouTube', icon: 'youtube' },
  ]

  return (
    <footer className="bg-[#f1f1f3] px-4 py-10 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-9 lg:grid-cols-[1.25fr_0.72fr_0.72fr_1fr] lg:items-start">
          <div className="max-w-sm">
            <img src="/img/logo.svg" alt="Virtual Library" className="h-9 w-auto" />
            <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-[#8a8791]">
              India's 24x7 virtual study ecosystem for serious aspirants.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-bold text-[#8a8791] shadow-[0_10px_24px_rgba(48,32,88,0.06)] transition hover:-translate-y-0.5 hover:text-[#6d35df]"
                >
                  {link.icon === 'instagram' ? (
                    <InstagramIcon className="h-[18px] w-[18px]" />
                  ) : (
                    <YouTubeIcon className="h-[18px] w-[18px]" />
                  )}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-normal text-[#8a8791]">Company</h3>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-[#171322]">
              {companyLinks.map((link) => (
                <a key={link.href} href={link.href} className="transition hover:text-[#6d35df]">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-normal text-[#8a8791]">Legal</h3>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-[#171322]">
              {legalLinks.map((link) => (
                <a key={link.href} href={link.href} className="transition hover:text-[#6d35df]">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-normal text-[#8a8791]">Get the app</h3>
            <p className="mt-4 text-sm font-medium leading-6 text-[#6a6378]">
              Join rooms, focus sessions, and rankings from your phone.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a
                href={GOOGLE_PLAY_HREF}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white px-3 text-sm font-bold text-[#171322] shadow-[0_10px_24px_rgba(48,32,88,0.06)] transition hover:-translate-y-0.5 hover:text-[#6d35df]"
              >
                <PlayStoreIcon className="h-5 w-5 shrink-0" />
                Play
              </a>
              <a
                href={APP_STORE_HREF}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-white px-3 text-sm font-bold text-[#171322] shadow-[0_10px_24px_rgba(48,32,88,0.06)] transition hover:-translate-y-0.5 hover:text-[#6d35df]"
              >
                <AppleIcon className="h-5 w-5 text-[#8a8a8a]" />
                iOS
              </a>
            </div>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-[#cfcdd4] pt-5 text-xs font-medium text-[#4d465a] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 Virtual Library. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {[...legalLinks, { href: '/contact', label: 'Support' }].map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-[#6d35df]">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function SectionHeader({
  description,
  eyebrow,
  title,
}: {
  description: string
  eyebrow: string
  title: string
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase text-[#6d35df]">{eyebrow}</p>
      <h2 className="mx-auto mt-3 max-w-[20rem] text-[1.75rem] font-extrabold leading-tight tracking-normal text-[#171322] sm:max-w-3xl sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#625b73] sm:text-base">
        {description}
      </p>
    </div>
  )
}

function ComparisonCard({
  className,
  dark = false,
  icon,
  points,
  title,
}: {
  className: string
  dark?: boolean
  icon: IconName
  points: string[]
  title: string
}) {
  return (
    <article
      className={`${className} relative overflow-hidden rounded-[28px] border p-7 ring-1 ring-white/75 sm:rounded-[34px] sm:p-8`}
    >
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/80" />
      {dark && (
        <div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-white/14 blur-2xl" />
      )}
      <h3 className={`relative text-xl font-extrabold tracking-normal ${dark ? 'text-white' : 'text-[#090713]'}`}>
        {title}
      </h3>
      <div className="relative mt-6 space-y-4">
        {points.map((point) => (
          <div key={point} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-[0_8px_20px_rgba(20,12,42,0.12)] ${dark ? 'bg-white/18 text-white ring-1 ring-white/20' : 'bg-[#ffe7e7] text-[#ff4b4b] ring-1 ring-[#ffd5d5]'
                }`}
            >
              <Icon name={icon} className="h-3.5 w-3.5" />
            </span>
            <p className={`text-sm font-semibold leading-6 ${dark ? 'text-white/88' : 'text-[#403447]'}`}>
              {point}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}

function sortPlans(plans: BillingPlan[]) {
  return [...plans].sort((left, right) => {
    if ((left.course.displayOrder || 0) !== (right.course.displayOrder || 0)) {
      return (left.course.displayOrder || 0) - (right.course.displayOrder || 0)
    }

    if (left.durationMonths !== right.durationMonths) {
      return left.durationMonths - right.durationMonths
    }

    return left.amountPaise - right.amountPaise
  })
}

function getCourseOptionsFromPlans(plans: BillingPlan[]) {
  const courses = new Map<string, CourseSummary>()

  plans.forEach((plan) => {
    if (!plan.course?.courseId || courses.has(plan.course.courseId)) {
      return
    }

    courses.set(plan.course.courseId, plan.course)
  })

  return sortCourseOptions(Array.from(courses.values()))
}

function mergeCourseOptions(primaryCourses: CourseSummary[], fallbackCourses: CourseSummary[]) {
  const courses = new Map<string, CourseSummary>()

  primaryCourses.forEach((course) => {
    if (course.courseId) {
      courses.set(course.courseId, course)
    }
  })

  fallbackCourses.forEach((course) => {
    if (course.courseId && !courses.has(course.courseId)) {
      courses.set(course.courseId, course)
    }
  })

  return sortCourseOptions(Array.from(courses.values()))
}

function sortCourseOptions(courses: CourseSummary[]) {
  return [...courses].sort((left, right) => {
    if ((left.displayOrder || 0) !== (right.displayOrder || 0)) {
      return (left.displayOrder || 0) - (right.displayOrder || 0)
    }

    return left.title.localeCompare(right.title)
  })
}

function getDefaultCourseId(courses: CourseSummary[]) {
  return courses.find(isDefaultCourse)?.courseId || courses[0]?.courseId || ''
}

function getSelectedCourseOption(courses: CourseSummary[], selectedCourseId: string) {
  return courses.find((course) => course.courseId === selectedCourseId) || courses.find(isDefaultCourse) || courses[0] || null
}

function getPlansForCourse(plans: BillingPlan[], selectedCourseId: string) {
  const selectedCoursePlans = selectedCourseId
    ? plans.filter((plan) => plan.course.courseId === selectedCourseId)
    : []

  if (selectedCoursePlans.length) {
    return selectedCoursePlans
  }

  const defaultCoursePlans = plans.filter((plan) => isDefaultCourse(plan.course))

  return defaultCoursePlans.length ? defaultCoursePlans : plans
}

function getRecommendedPlanId(plans: BillingPlan[]) {
  if (!plans.length) {
    return ''
  }

  return (
    plans.find((plan) => plan.durationMonths === 6)?.planId ||
    plans.find((plan) => plan.durationMonths === 12)?.planId ||
    plans[Math.min(1, plans.length - 1)]?.planId ||
    plans[0]?.planId ||
    ''
  )
}

function getDisplayPlanFromBillingPlan(
  plan: BillingPlan,
  isRecommended: boolean,
  selectedCourse: CourseSummary | null,
  offer?: PlanCouponOffer | null
): DisplayPlan {
  const offerPricing = offer?.pricing
  const displayAmountPaise = offerPricing?.finalAmountPaise ?? plan.amountPaise
  const savingsPercent = offer ? offer.discountPercent : getPlanSavingsPercent(plan.durationMonths)
  const originalAmountPaise = offerPricing && offerPricing.discountAmountPaise > 0
    ? offerPricing.baseAmountPaise
    : getOriginalAmountPaise(plan.amountPaise, savingsPercent)
  const savingsAmountPaise = Math.max(originalAmountPaise - displayAmountPaise, 0)
  const price = formatCurrencyCompact(displayAmountPaise, plan.currency)
  const monthlyEquivalent = formatMonthlyEquivalent(plan, displayAmountPaise)

  return {
    key: plan.planId,
    title: plan.name?.trim() || formatPlanTitle(plan.durationMonths),
    durationMonths: plan.durationMonths,
    price,
    originalPrice: formatCurrencyCompact(originalAmountPaise, plan.currency),
    monthlyPrice: `${monthlyEquivalent}/month`,
    billingText: plan.durationMonths === 1 ? 'Billed monthly' : `Billed ${price}`,
    savingsLabel: `SAVE ${savingsPercent}%`,
    valuePill:
      plan.durationMonths === 1
        ? `≈ ${formatDailyEquivalent(plan)}/day`
        : `≈ ${monthlyEquivalent}/Month${plan.durationMonths >= 24 ? ' — Max Savings' : ''}`,
    savingsText: savingsAmountPaise
      ? `You save ${formatCurrencyCompact(savingsAmountPaise, plan.currency)} vs regular price!`
      : 'Complete Virtual Library access for your selected duration.',
    href: buildPaymentHref(plan.durationMonths, selectedCourse || plan.course, plan.planId),
    badge: isRecommended ? 'MOST POPULAR' : undefined,
    couponCode: offer?.coupon.code,
    featured: false,
  }
}

function withCheckoutCourse(plan: DisplayPlan, selectedCourse: CourseSummary | null) {
  return {
    ...plan,
    href: buildPaymentHref(plan.durationMonths, selectedCourse),
  }
}

function buildPaymentHref(durationMonths: number, selectedCourse: CourseSummary | null, planId?: string) {
  const params = new URLSearchParams({
    source: 'home',
    durationMonths: String(durationMonths),
  })

  if (planId) {
    params.set('planId', planId)
  }

  if (selectedCourse?.courseId) {
    params.set('courseId', selectedCourse.courseId)
  } else {
    params.set('courseSlug', selectedCourse?.slug || DEFAULT_COURSE_SLUG)
  }

  return `/payment?${params.toString()}`
}

function isDefaultCourse(course?: CourseSummary | null) {
  if (!course) {
    return false
  }

  return [course.slug, course.title, course.courseId]
    .some((value) => normalizeCourseKey(value || '') === 'neetpg')
}

function normalizeCourseKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function formatPlanTitle(durationMonths: number) {
  return `${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}`
}

function formatMonthlyEquivalent(plan: BillingPlan, amountPaise = plan.amountPaise) {
  const monthlyAmountPaise = Math.round(amountPaise / Math.max(plan.durationMonths, 1))
  return formatCurrencyCompact(monthlyAmountPaise, plan.currency)
}

function formatDailyEquivalent(plan: BillingPlan) {
  const days = plan.durationMonths === 1 ? 30 : Math.round((plan.durationMonths * 365) / 12)
  return formatCurrencyCompact(Math.round(plan.amountPaise / Math.max(days, 1)), plan.currency)
}

function formatCurrencyCompact(amountPaise: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amountPaise / 100)
}

function getPlanSavingsPercent(durationMonths: number) {
  if (durationMonths >= 24) {
    return 42
  }

  if (durationMonths >= 12) {
    return 40
  }

  if (durationMonths >= 6) {
    return 33
  }

  return 30
}

function getOriginalAmountPaise(amountPaise: number, savingsPercent: number) {
  const divisor = 1 - savingsPercent / 100

  if (divisor <= 0) {
    return amountPaise
  }

  return Math.round(amountPaise / divisor / 100) * 100
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'Unable to load current prices.'
}

function Icon({ className, name }: { className?: string; name: IconName }) {
  const props = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  }

  switch (name) {
    case 'video':
      return (
        <svg {...props}>
          <path d="M4.5 7.5A2.5 2.5 0 017 5h7a2.5 2.5 0 012.5 2.5v9A2.5 2.5 0 0114 19H7a2.5 2.5 0 01-2.5-2.5v-9z" />
          <path d="M16.5 9.5l3.5-2v9l-3.5-2" />
        </svg>
      )
    case 'focus':
      return (
        <svg {...props}>
          <path d="M12 8v4l2.5 2.5" />
          <path d="M5 3L3 5M19 3l2 2M12 21a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...props}>
          <path d="M20.4 5.6a5 5 0 00-7.1 0L12 6.9l-1.3-1.3a5 5 0 00-7.1 7.1L12 21l8.4-8.3a5 5 0 000-7.1z" />
        </svg>
      )
    case 'users':
      return (
        <svg {...props}>
          <path d="M16 19v-1.5A3.5 3.5 0 0012.5 14h-5A3.5 3.5 0 004 17.5V19" />
          <path d="M10 10.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 19v-1.2a3 3 0 00-2.2-2.9M16.5 4a3 3 0 010 5.8" />
        </svg>
      )
    case 'target':
      return (
        <svg {...props}>
          <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
          <path d="M12 17a5 5 0 100-10 5 5 0 000 10zM12 13a1 1 0 100-2 1 1 0 000 2z" />
        </svg>
      )
    case 'rank':
      return (
        <svg {...props}>
          <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 01-10 0V4z" />
          <path d="M17 6h3a3 3 0 01-3 3M7 6H4a3 3 0 003 3" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...props}>
          <path d="M4 19V5M4 19h16" />
          <path d="M8 16v-5M12 16V8M16 16v-3" />
        </svg>
      )
    case 'leaf':
      return (
        <svg {...props}>
          <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14z" />
          <path d="M5 19c3.5-4.5 7-7.5 14-14" />
        </svg>
      )
    case 'check':
      return (
        <svg {...props}>
          <path d="M5 12.5l4 4L19 7" />
        </svg>
      )
    case 'x':
      return (
        <svg {...props}>
          <path d="M7 7l10 10M17 7L7 17" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...props}>
          <path d="M9 2.8h6A2.2 2.2 0 0117.2 5v14A2.2 2.2 0 0115 21.2H9A2.2 2.2 0 016.8 19V5A2.2 2.2 0 019 2.8z" />
          <path d="M10.5 18h3" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...props}>
          <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    case 'spark':
      return (
        <svg {...props}>
          <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3z" />
          <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z" />
        </svg>
      )
    case 'chat':
      return (
        <svg {...props}>
          <path d="M4.5 6.8A3.3 3.3 0 017.8 3.5h8.4a3.3 3.3 0 013.3 3.3v5.9a3.3 3.3 0 01-3.3 3.3H10l-5.5 4.5V6.8z" />
          <path d="M8 8.5h8M8 12h5" />
        </svg>
      )
    case 'stethoscope':
      return (
        <svg {...props}>
          <path d="M6 4v4a4 4 0 008 0V4" />
          <path d="M4.5 4h3M12.5 4h3M10 12v2.5A3.5 3.5 0 0013.5 18H15" />
          <path d="M19 18a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'graduation':
      return (
        <svg {...props}>
          <path d="M3 9l9-4 9 4-9 4-9-4z" />
          <path d="M7 11v4.5c3.2 2 6.8 2 10 0V11" />
          <path d="M19 10.2V16" />
        </svg>
      )
    case 'microscope':
      return (
        <svg {...props}>
          <path d="M9 3h5v3H9zM10.5 6v6.5a2 2 0 004 0V6" />
          <path d="M5 21h14M8 21a7 7 0 007-7M12 17h5" />
        </svg>
      )
    case 'landmark':
      return (
        <svg {...props}>
          <path d="M4 10h16L12 4 4 10zM6 10v8M10 10v8M14 10v8M18 10v8M4 20h16" />
        </svg>
      )
    case 'flask':
      return (
        <svg {...props}>
          <path d="M9 3h6M10 3v5.5L5.8 17a2.6 2.6 0 002.3 3.8h7.8a2.6 2.6 0 002.3-3.8L14 8.5V3" />
          <path d="M8 16h8" />
        </svg>
      )
    case 'train':
      return (
        <svg {...props}>
          <path d="M7 4h10a3 3 0 013 3v8a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3z" />
          <path d="M8 8h8M8 12h8M8 21l2-3M16 18l2 3" />
          <path d="M8.5 15h.01M15.5 15h.01" />
        </svg>
      )
    case 'hospital':
      return (
        <svg {...props}>
          <path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
          <path d="M9 21v-5h6v5M12 7v6M9 10h6" />
        </svg>
      )
    case 'building':
      return (
        <svg {...props}>
          <path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
          <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M3 21h18" />
        </svg>
      )
    case 'bank':
      return (
        <svg {...props}>
          <path d="M4 10h16L12 5 4 10zM6 10v7M10 10v7M14 10v7M18 10v7M4 19h16" />
          <path d="M9 14h6" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg {...props}>
          <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7" />
          <path d="M5 7h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
          <path d="M3 12h18M12 12v2" />
        </svg>
      )
  }
}

function PlayStoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#34a853" d="M4.46 3.21c-.3.19-.46.54-.46 1.01v15.56c0 .48.16.82.46 1.01l8.17-8.8-8.17-8.78Z" />
      <path fill="#4285f4" d="M13.57 11 16.1 8.28 6.17 2.72c-.24-.14-.47-.2-.68-.2l8.08 8.48Z" />
      <path fill="#fbbc04" d="M13.57 13 5.49 21.48c.21 0 .44-.06.68-.2l9.93-5.56L13.57 13Z" />
      <path fill="#ea4335" d="M19.49 10.14 17.22 8.87 14.48 12l2.74 3.13 2.27-1.27c.68-.38 1.05-.99 1.05-1.86s-.37-1.48-1.05-1.86Z" />
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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.8" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M21.3 7.2a3 3 0 00-2.1-2.1C17.35 4.6 12 4.6 12 4.6s-5.35 0-7.2.5a3 3 0 00-2.1 2.1A31.2 31.2 0 002.2 12a31.2 31.2 0 00.5 4.8 3 3 0 002.1 2.1c1.85.5 7.2.5 7.2.5s5.35 0 7.2-.5a3 3 0 002.1-2.1c.5-1.85.5-4.8.5-4.8s0-2.95-.5-4.8zM10.1 15.5v-7l5.7 3.5-5.7 3.5z" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className={className}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}
