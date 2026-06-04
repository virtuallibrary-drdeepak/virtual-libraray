import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import {
  apiFetch,
  BillingPlan,
  formatCurrency,
  PublicBillingPlansResponse,
} from '@/lib/payment-client'
import { sortPricingPlans } from '@/components/v2/PricingPlanCard'

const GOOGLE_PLAY_HREF = 'https://play.google.com/store/apps/details?id=com.pushkardev123.VirtualLibrary'
const APP_STORE_HREF = 'https://apps.apple.com/'
const HERO_IMAGE = '/img/v2/hero-section-illustration.png'
const STUDY_ROOM_IMAGE = '/img/banner-right.png'
const COMMUNITY_IMAGE = '/img/Explore-Communities.jpg'

type Feature = {
  title: string
  eyebrow: string
  description: string
  icon: 'room' | 'focus' | 'revision' | 'analytics'
}

type Testimonial = {
  quote: string
  name: string
  role: string
  initials: string
}

const NAV_ITEMS = [
  { label: 'Product', id: 'product' },
  { label: 'Routine', id: 'routine' },
  { label: 'Plans', id: 'plans' },
  { label: 'Reviews', id: 'reviews' },
]

const HERO_STATS = [
  { value: '24/7', label: 'Study rooms' },
  { value: '3000+', label: 'Daily learners' },
  { value: '825+', label: 'Focusing now' },
  { value: '70%', label: 'Women learners' },
]

const FEATURES: Feature[] = [
  {
    title: 'Live study presence',
    eyebrow: 'Accountability',
    description:
      'Join active rooms throughout the day, see other learners studying, and make showing up feel natural.',
    icon: 'room',
  },
  {
    title: 'Distraction control',
    eyebrow: 'Focus',
    description:
      'Use focus mode, timers, and blocker-friendly routines to protect deep work sessions from interruptions.',
    icon: 'focus',
  },
  {
    title: 'Revision rhythm',
    eyebrow: 'Retention',
    description:
      'Keep notes, reminders, and review blocks in one place so your routine compounds across weeks.',
    icon: 'revision',
  },
  {
    title: 'Progress visibility',
    eyebrow: 'Analytics',
    description:
      'Track study hours, streaks, and consistency without turning your preparation into extra admin work.',
    icon: 'analytics',
  },
]

const INCLUDED_FEATURES = [
  '24/7 live study room access',
  'Focus tools and session timers',
  'Revision notes and reminders',
  'Rankings and progress insights',
  'Community groups and peer accountability',
  'Mobile app access after payment',
]

const ROUTINE_STEPS = [
  {
    title: 'Enter a room',
    description: 'Start with a live room that matches your study block and keeps you visible.',
  },
  {
    title: 'Protect the block',
    description: 'Use timers and focus tools to reduce phone drift while you study.',
  },
  {
    title: 'Review and repeat',
    description: 'Track the session, save revision cues, and return tomorrow with less friction.',
  },
]

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'The live rooms made consistency visible. I stopped negotiating with myself every morning and just joined.',
    name: 'Aditi R.',
    role: 'Competitive exam learner',
    initials: 'AR',
  },
  {
    quote:
      'Focus mode helped me turn short scattered study windows into proper blocks. The routine finally felt stable.',
    name: 'Rohan M.',
    role: 'College student',
    initials: 'RM',
  },
  {
    quote:
      'I liked that every plan had the same tools. I just chose the duration that matched my preparation timeline.',
    name: 'Samaira K.',
    role: 'Self-paced aspirant',
    initials: 'SK',
  },
]

export default function V2NeetPgPage() {
  const router = useRouter()
  const [pricingPlans, setPricingPlans] = useState<BillingPlan[]>([])
  const [pricingLoading, setPricingLoading] = useState(true)
  const [pricingError, setPricingError] = useState('')

  const recommendedPlanId = useMemo(() => getRecommendedPlanId(pricingPlans), [pricingPlans])

  useEffect(() => {
    let isMounted = true

    async function loadPublicPlans() {
      setPricingLoading(true)
      setPricingError('')

      try {
        const response = await apiFetch<PublicBillingPlansResponse>('/billing/plans/public', {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!isMounted) {
          return
        }

        setPricingPlans(sortPricingPlans(response.plans || []))
      } catch (error) {
        if (!isMounted) {
          return
        }

        setPricingPlans([])
        setPricingError(getErrorMessage(error, 'Unable to load prices right now. Please try again.'))
      } finally {
        if (isMounted) {
          setPricingLoading(false)
        }
      }
    }

    void loadPublicPlans()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSelectPlan(plan: BillingPlan) {
    await router.push({
      pathname: '/payment',
      query: {
        source: 'v2-neet-pg',
        planId: plan.planId,
      },
    })
  }

  function retryLoadPublicPlans() {
    setPricingLoading(true)
    setPricingError('')

    void apiFetch<PublicBillingPlansResponse>('/billing/plans/public', {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        setPricingPlans(sortPricingPlans(response.plans || []))
      })
      .catch((error) => {
        setPricingPlans([])
        setPricingError(getErrorMessage(error, 'Unable to load prices right now. Please try again.'))
      })
      .finally(() => setPricingLoading(false))
  }

  function scrollToSection(sectionId: string, offset = 76) {
    if (typeof window === 'undefined') {
      return
    }

    const target = document.getElementById(sectionId)

    if (!target) {
      return
    }

    const top = target.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth',
    })
  }

  return (
    <>
      <Head>
        <title>Virtual Library - Study Rooms and Focus Tools</title>
        <meta
          name="description"
          content="Virtual Library helps students prepare for any exam with live study rooms, focus tools, revision routines, communities, and compact access plans."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#fbfbfd] text-[#11111f]">
        <header className="sticky top-0 z-50 border-b border-[#e8e5ef] bg-white/92 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center" aria-label="Virtual Library home">
              <img src="/img/logo.svg" alt="Virtual Library" className="h-8 w-auto" />
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-semibold text-[#4d485f] transition hover:text-[#6d35df]"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden text-sm font-semibold text-[#11111f] transition hover:text-[#6d35df] sm:inline-flex"
              >
                Sign In
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection('plans')}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#6d35df] px-5 text-sm font-bold text-white shadow-[0_14px_26px_rgba(109,53,223,0.18)] transition hover:bg-[#5b25c9]"
              >
                View Plans
              </button>
            </div>
          </div>
        </header>

        <main>
          <section className="overflow-hidden bg-[linear-gradient(180deg,#f8f4ff_0%,#ffffff_100%)]">
            <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-8 sm:px-6 lg:min-h-[640px] lg:grid-cols-[0.96fr_1.04fr] lg:pb-14 lg:pt-10">
              <div className="relative z-10 max-w-2xl">
                <p className="inline-flex rounded-full border border-[#e6dcff] bg-white px-4 py-2 text-xs font-bold text-[#6d35df] shadow-[0_10px_24px_rgba(45,28,84,0.06)]">
                  Focus rooms for every serious learner
                </p>

                <h1 className="mt-6 text-[2.65rem] font-black leading-[1.04] tracking-normal text-[#11111f] sm:text-[3.7rem] lg:text-[4.35rem]">
                  Build a study routine that actually holds.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-8 text-[#625d73] sm:text-lg">
                  Virtual Library gives exam aspirants, college students, and working learners a
                  quiet system for showing up every day: live study rooms, focus tools, revision cues,
                  and accountability in one app.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => scrollToSection('plans')}
                    className="inline-flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-lg bg-[#11111f] px-6 text-sm font-bold text-white shadow-[0_18px_38px_rgba(17,17,31,0.18)] transition hover:bg-[#26233a]"
                  >
                    Choose Access
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                  <DownloadButtons />
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {HERO_STATS.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-[#e9e5f4] bg-white px-4 py-3 shadow-[0_12px_28px_rgba(33,20,70,0.05)]">
                      <p className="text-2xl font-black leading-none text-[#11111f]">{stat.value}</p>
                      <p className="mt-1 text-xs font-semibold leading-4 text-[#716b83]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto flex w-full max-w-[680px] items-center justify-center lg:max-w-none">
                <div className="absolute inset-x-6 bottom-4 top-8 rounded-[36px] bg-[#11111f] shadow-[0_34px_80px_rgba(17,17,31,0.20)]" />
                <img
                  src={HERO_IMAGE}
                  alt="Virtual Library app showing live study rooms and practice notes"
                  className="relative z-10 h-auto w-full max-w-[360px] object-contain sm:max-w-[440px] lg:max-w-[540px]"
                />
              </div>
            </div>
          </section>

          <section id="product" className="scroll-mt-20 bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6d35df]">The product</p>
                  <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-normal text-[#11111f] sm:text-5xl">
                    A focused workspace, not another noisy course page.
                  </h2>
                </div>
                <p className="max-w-2xl text-base leading-8 text-[#625d73]">
                  Use Virtual Library around whatever you are preparing for. The app is built around
                  repeatable study behavior: enter a room, protect the session, record progress, and come back.
                </p>
              </div>

              <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="overflow-hidden rounded-xl border border-[#e4dfed] bg-[#11111f] shadow-[0_28px_70px_rgba(17,17,31,0.16)]">
                  <img src={STUDY_ROOM_IMAGE} alt="Virtual Library live study room" className="h-full min-h-[300px] w-full object-cover" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                  {FEATURES.slice(0, 2).map((feature) => (
                    <FeatureCard key={feature.title} feature={feature} />
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {FEATURES.slice(2).map((feature) => (
                  <FeatureCard key={feature.title} feature={feature} />
                ))}
              </div>
            </div>
          </section>

          <section id="routine" className="scroll-mt-20 bg-[#f6f5fa] py-16 sm:py-20">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6d35df]">Routine design</p>
                <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-[#11111f] sm:text-5xl">
                  Make studying feel like a scheduled place to be.
                </h2>
                <p className="mt-5 text-base leading-8 text-[#625d73]">
                  Learners do better when the next action is obvious. Virtual Library keeps the workflow
                  simple enough to repeat daily.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {ROUTINE_STEPS.map((step, index) => (
                  <article key={step.title} className="rounded-xl border border-[#e3dfeb] bg-white p-6 shadow-[0_18px_44px_rgba(33,20,70,0.06)]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#11111f] text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <h3 className="mt-7 text-xl font-black tracking-normal text-[#11111f]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#625d73]">{step.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div className="overflow-hidden rounded-xl border border-[#e4dfed] bg-[#11111f]">
                <img src={COMMUNITY_IMAGE} alt="Virtual Library community groups" className="h-full min-h-[300px] w-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6d35df]">Community</p>
                <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-[#11111f] sm:text-5xl">
                  Prepare beside people with the same daily standard.
                </h2>
                <p className="mt-5 text-base leading-8 text-[#625d73]">
                  Communities, rankings, and shared rooms help learners stay accountable without making
                  the product feel loud or performative.
                </p>
              </div>
            </div>
          </section>

          <section id="plans" className="scroll-mt-20 bg-[#11111f] py-16 text-white sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9d86ff]">Available plans</p>
                  <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal sm:text-5xl">
                    Same tools. Choose the duration.
                  </h2>
                  <p className="mt-5 text-base leading-8 text-white/62">
                    Every plan includes the complete Virtual Library experience. Longer plans simply lower
                    the effective monthly cost.
                  </p>

                  <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.06] p-5">
                    <p className="text-sm font-black text-white">Included in every plan</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {INCLUDED_FEATURES.map((feature) => (
                        <div key={feature} className="flex items-start gap-3 text-sm leading-5 text-white/72">
                          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#63e6be]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white p-2 text-[#11111f] shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
                  {pricingLoading && (
                    <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#e7e2f5] border-t-[#6d35df]" />
                      <p className="mt-5 text-sm font-semibold text-[#625d73]">Loading current prices...</p>
                    </div>
                  )}

                  {!pricingLoading && pricingError && (
                    <div className="px-5 py-8 text-center">
                      <p className="text-sm font-semibold text-rose-700">{pricingError}</p>
                      <button
                        type="button"
                        onClick={retryLoadPublicPlans}
                        className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[#6d35df] px-5 text-sm font-bold text-white transition hover:bg-[#5b25c9]"
                      >
                        Reload prices
                      </button>
                    </div>
                  )}

                  {!pricingLoading && !pricingError && pricingPlans.length > 0 && (
                    <div className="divide-y divide-[#ece8f4]">
                      {pricingPlans.map((plan) => (
                        <PlanRow
                          key={plan.planId}
                          plan={plan}
                          recommended={plan.planId === recommendedPlanId}
                          onSelect={() => void handleSelectPlan(plan)}
                        />
                      ))}
                    </div>
                  )}

                  {!pricingLoading && !pricingError && pricingPlans.length === 0 && (
                    <div className="px-5 py-8 text-center">
                      <p className="text-sm font-semibold text-[#625d73]">No public plans are available right now.</p>
                      <button
                        type="button"
                        onClick={retryLoadPublicPlans}
                        className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[#6d35df] px-5 text-sm font-bold text-white transition hover:bg-[#5b25c9]"
                      >
                        Check again
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="reviews" className="scroll-mt-20 bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6d35df]">Learner notes</p>
                <h2 className="mt-4 text-4xl font-black tracking-normal text-[#11111f] sm:text-5xl">
                  Neutral by design. Useful across preparation styles.
                </h2>
              </div>

              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {TESTIMONIALS.map((testimonial) => (
                  <article key={testimonial.name} className="rounded-xl border border-[#e4dfed] bg-[#fbfbfd] p-6">
                    <p className="text-lg leading-none text-[#f8b400]">★★★★★</p>
                    <p className="mt-5 min-h-[120px] text-sm leading-7 text-[#504a61]">"{testimonial.quote}"</p>
                    <div className="mt-6 flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6d35df] text-xs font-black text-white">
                        {testimonial.initials}
                      </span>
                      <div>
                        <p className="text-sm font-black text-[#11111f]">{testimonial.name}</p>
                        <p className="text-xs font-semibold text-[#716b83]">{testimonial.role}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[linear-gradient(115deg,#263cff_0%,#7c35df_52%,#e10689_100%)] px-4 py-16 text-center text-white sm:px-6 sm:py-20">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-4xl font-black tracking-normal sm:text-6xl">Start with the next study block.</h2>
              <p className="mt-5 text-base leading-7 text-white/82 sm:text-lg">
                Choose access, complete checkout, and begin in the app with the same tools regardless of your exam.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => scrollToSection('plans')}
                  className="inline-flex h-12 min-w-[190px] items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-[#11111f] transition hover:bg-slate-100"
                >
                  View Available Plans
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
                <Link
                  href="/contact"
                  className="inline-flex h-12 min-w-[170px] items-center justify-center rounded-lg border border-white/22 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur transition hover:bg-white/16"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-[#070712] px-4 py-12 text-white sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
              <div>
                <img src="/img/logo.svg" alt="Virtual Library" className="h-9 w-auto brightness-0 invert" />
                <p className="mt-5 max-w-xs text-sm leading-6 text-white/58">
                  Live study rooms, focus tools, revision routines, and communities for learners preparing seriously.
                </p>
              </div>

              <FooterGroup
                title="Product"
                links={[
                  { label: 'Study rooms', href: '#product' },
                  { label: 'Focus tools', href: '#product' },
                  { label: 'Available plans', href: '#plans' },
                ]}
              />
              <FooterGroup
                title="Company"
                links={[
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Support', href: '/contact' },
                ]}
              />
              <FooterGroup
                title="Legal"
                links={[
                  { label: 'Privacy Policy', href: '/privacy-policy' },
                  { label: 'Terms of Service', href: '/terms-and-conditions' },
                  { label: 'Refund Policy', href: '/refund-policy' },
                ]}
              />
            </div>

            <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/48">
              © 2026 Virtual Library. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article className="rounded-xl border border-[#e4dfed] bg-white p-6 shadow-[0_16px_44px_rgba(33,20,70,0.05)]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f1ebff] text-[#6d35df]">
          <FeatureIcon icon={feature.icon} />
        </span>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6d35df]">{feature.eyebrow}</p>
      </div>
      <h3 className="mt-6 text-2xl font-black tracking-normal text-[#11111f]">{feature.title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#625d73]">{feature.description}</p>
    </article>
  )
}

function PlanRow({
  onSelect,
  plan,
  recommended,
}: {
  onSelect: () => void
  plan: BillingPlan
  recommended: boolean
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_84px] items-center gap-x-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_150px_124px] sm:px-5 sm:py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-black text-[#11111f]">{formatPlanTitle(plan)}</h3>
          {recommended && (
            <span className="rounded-full bg-[#fff2b8] px-2.5 py-1 text-[11px] font-black text-[#5b4300]">
              Recommended
            </span>
          )}
        </div>
        <p className="mt-1 text-sm font-semibold text-[#716b83]">{formatPlanDuration(plan.durationMonths)} access</p>
      </div>

      <div className="text-right sm:text-left">
        <p className="text-lg font-black text-[#11111f] sm:text-xl">{formatCurrency(plan.amountPaise, plan.currency)}</p>
        <p className="mt-0.5 text-xs font-semibold text-[#716b83]">{formatMonthlyEquivalent(plan)} / month</p>
      </div>

      <button
        type="button"
        onClick={onSelect}
        className={cn(
          'inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-black transition sm:h-10 sm:px-4',
          recommended
            ? 'bg-[#11111f] text-white hover:bg-[#26233a]'
            : 'bg-[#f0edf6] text-[#11111f] hover:bg-[#e4deee]'
        )}
      >
        Choose
      </button>
    </div>
  )
}

function getRecommendedPlanId(plans: BillingPlan[]) {
  if (!plans.length) {
    return ''
  }

  return (
    plans.find((plan) => plan.durationMonths === 12)?.planId ||
    plans.find((plan) => plan.durationMonths === 6)?.planId ||
    plans[Math.min(1, plans.length - 1)]?.planId ||
    plans[0]?.planId ||
    ''
  )
}

function formatPlanTitle(plan: BillingPlan) {
  if (plan.name?.trim()) {
    return plan.name.trim()
  }

  if (plan.durationMonths === 1) {
    return 'Monthly'
  }

  if (plan.durationMonths === 12) {
    return 'Annual'
  }

  return `${plan.durationMonths} months`
}

function formatPlanDuration(durationMonths: number) {
  return `${durationMonths} ${durationMonths === 1 ? 'month' : 'months'}`
}

function formatMonthlyEquivalent(plan: BillingPlan) {
  const monthlyAmountPaise = Math.round(plan.amountPaise / Math.max(plan.durationMonths, 1))
  return formatCurrency(monthlyAmountPaise, plan.currency)
}

function DownloadButtons() {
  return (
    <div className="flex h-12 items-center justify-center gap-3 rounded-lg border border-[#e7e1f4] bg-white px-5 text-sm font-bold text-[#11111f] shadow-[0_14px_30px_rgba(35,25,80,0.08)]">
      <span>Download on</span>
      <a href={GOOGLE_PLAY_HREF} target="_blank" rel="noreferrer" aria-label="Download on Google Play">
        <PlayStoreIcon className="h-5 w-5 text-[#24a148]" />
      </a>
      <a href={APP_STORE_HREF} target="_blank" rel="noreferrer" aria-label="Download on App Store">
        <AppleIcon className="h-5 w-5 text-[#11111f]" />
      </a>
    </div>
  )
}

function FooterGroup({
  links,
  title,
}: {
  links: Array<{ label: string; href: string }>
  title: string
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <div className="mt-5 space-y-3">
        {links.map((link) => (
          <a key={link.label} href={link.href} className="block text-sm text-white/56 transition hover:text-white">
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message?.trim()

    if (message && !/<(?:!doctype|html|head|body|script)\b/i.test(message) && message.length < 180) {
      return message
    }
  }

  return fallback
}

function FeatureIcon({ icon }: { icon: Feature['icon'] }) {
  switch (icon) {
    case 'room':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M4 6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v7a2.5 2.5 0 01-2.5 2.5H9l-5 4V6.5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      )
    case 'focus':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M12 8v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M5 3l-2 2M19 3l2 2M12 21a8 8 0 100-16 8 8 0 000 16z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      )
    case 'revision':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M5 5.5A2.5 2.5 0 017.5 3H20v15H7.5A2.5 2.5 0 005 20.5v-15z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M9 7h7M9 11h5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      )
    case 'analytics':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M4 17l5-5 4 4 7-8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M14 8h6v6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      )
  }
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}
