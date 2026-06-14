import Link from 'next/link'
import { useRouter } from 'next/router'
import type { MouseEvent } from 'react'
import type { CourseSummary } from '@/lib/payment-client'

export type DiscountDisplayPlan = {
  key: string
  title: string
  durationMonths: number
  price: string
  originalPrice: string
  monthlyPrice: string
  billingText: string
  savingsLabel: string
  valuePill: string
  savingsText: string
  href: string
  badge?: string
  featured?: boolean
  couponCode?: string
}

export function DiscountPlanSection({
  copiedCouponPlanId,
  couponPreviewLoading,
  courseOptions = [],
  displayPlans,
  onCopyCoupon,
  onCourseChange,
  pricingError,
  pricingLoading,
  selectedCourseId = '',
}: {
  copiedCouponPlanId: string
  couponPreviewLoading: boolean
  courseOptions?: CourseSummary[]
  displayPlans: DiscountDisplayPlan[]
  onCopyCoupon: (planId: string, code: string) => void
  onCourseChange?: (courseId: string) => void
  pricingError: string
  pricingLoading: boolean
  selectedCourseId?: string
}) {
  const router = useRouter()

  function handlePlanClick(event: MouseEvent<HTMLAnchorElement>, plan: DiscountDisplayPlan) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }

    event.preventDefault()

    const documentWithTransition = document as Document & {
      startViewTransition?: (callback: () => void | Promise<unknown>) => { finished: Promise<void> }
    }
    const root = document.documentElement
    const finishTransition = () => {
      window.setTimeout(() => root.classList.remove('payment-route-transitioning'), 260)
    }
    const navigate = () => router.push(plan.href)

    root.classList.add('payment-route-transitioning')

    if (documentWithTransition.startViewTransition) {
      const transition = documentWithTransition.startViewTransition(navigate)
      void transition.finished.finally(finishTransition)
      return
    }

    window.setTimeout(() => {
      void navigate().finally(finishTransition)
    }, 120)
  }

  return (
    <section
      id="plans"
      className="relative scroll-mt-20 overflow-hidden bg-white py-12 sm:py-16"
    >
      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          html.payment-route-transitioning main {
            opacity: 0.97;
            transform: translateY(2px);
            transition: opacity 180ms ease, transform 180ms ease;
          }

          ::view-transition-old(root),
          ::view-transition-new(root) {
            animation-duration: 320ms;
            animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
          }
        }
      `}</style>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex h-8 items-center justify-center rounded-full bg-[#eee7ff] px-4 text-xs font-black uppercase tracking-normal text-[#6d35df] ring-1 ring-[#dacdff]">
            Limited time offer
          </p>
          <h2 className="mx-auto mt-4 max-w-[22rem] text-[2rem] font-extrabold leading-tight tracking-normal text-[#090713] sm:max-w-3xl sm:text-5xl">
            Choose Your Plan
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base font-medium leading-7 text-[#8a6fb8] sm:text-xl sm:leading-8">
            One subscription. Unlimited focused study time, accountability and community.
          </p>
        </div>

        {courseOptions.length > 0 && onCourseChange && (
          <div className="mx-auto mt-6 max-w-md">
            <label className="block text-left">
              <span className="mb-2 block text-sm font-bold text-[#786f89]">
                Preparing for
              </span>
              <span className="relative block">
                <select
                  value={selectedCourseId}
                  onChange={(event) => onCourseChange(event.target.value)}
                  className="h-[52px] w-full appearance-none rounded-[18px] border border-[#e4daf2] bg-white px-4 py-3 pr-11 text-base font-extrabold text-[#171322] shadow-[0_14px_34px_rgba(48,32,88,0.08)] outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#ede7ff]"
                >
                  {courseOptions.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.title || 'Virtual Library Access'}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7c3aed]" />
              </span>
            </label>
          </div>
        )}

        <div className="mt-3 min-h-5 text-center text-xs font-bold text-[#786f89]">
          {pricingLoading && 'Checking latest checkout prices...'}
          {!pricingLoading && couponPreviewLoading && 'Checking available coupons...'}
          {!pricingLoading && pricingError && pricingError}
        </div>

        <div className="mx-auto mt-7 grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {displayPlans.map((plan) => (
            <DiscountPlanCard
              copied={copiedCouponPlanId === plan.key}
              key={plan.key}
              onCopyCoupon={onCopyCoupon}
              onPlanClick={handlePlanClick}
              onPrefetch={(href) => void router.prefetch(href)}
              plan={plan}
            />
          ))}
        </div>

        {displayPlans.length > 0 && (
          <div className="mx-auto mt-6 max-w-xl text-center">
          <p className="text-sm font-semibold text-[#8a6fb8]">
            Select a plan above to continue
          </p>
          </div>
        )}
      </div>
    </section>
  )
}

function DiscountPlanCard({
  copied,
  onCopyCoupon,
  onPlanClick,
  onPrefetch,
  plan,
}: {
  copied: boolean
  onCopyCoupon: (planId: string, code: string) => void
  onPlanClick: (event: MouseEvent<HTMLAnchorElement>, plan: DiscountDisplayPlan) => void
  onPrefetch: (href: string) => void
  plan: DiscountDisplayPlan
}) {
  const isPopular = Boolean(plan.badge)

  return (
    <article
      className={`relative flex min-h-full flex-col rounded-[20px] border bg-white p-4 shadow-[0_10px_30px_rgba(48,32,88,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(82,48,170,0.12)] ${
        isPopular ? 'border-[#ff5a72]' : 'border-[#e4d8f5]'
      }`}
    >
      {isPopular && (
        <span className="absolute left-1/2 top-0 inline-flex -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff4f6d] px-3 py-1 text-[10px] font-black uppercase tracking-normal text-white shadow-[0_10px_20px_rgba(255,71,104,0.22)]">
          Most Popular
        </span>
      )}

      <div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                isPopular ? 'border-[#ff7a1a]' : 'border-[#7c35df]'
              }`}
              aria-hidden="true"
            >
              <span className={`h-2 w-2 rounded-full ${isPopular ? 'bg-[#ff7a1a]' : 'bg-[#7c35df]'}`} />
            </span>
            <h3 className="min-w-0 text-lg font-black leading-6 tracking-normal text-[#11111f]">
              {plan.title}
            </h3>
            <span className="shrink-0 rounded-full border border-[#9ce8c8] bg-[#dffbea] px-2 py-0.5 text-[10px] font-black uppercase tracking-normal text-[#00a071]">
              {plan.savingsLabel}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-5 text-[#70677f]">
              {plan.monthlyPrice}
            </p>
            <p className="truncate text-xs font-bold text-[#70677f]">
              {plan.billingText}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs font-bold text-[#a39baa] line-through">
              {plan.originalPrice}
            </p>
            <p className="mt-0.5 text-2xl font-black tracking-normal text-[#11111f] xl:text-[1.55rem]">
              {plan.price}
            </p>
          </div>
        </div>

        {plan.couponCode && (
          <button
            type="button"
            onClick={() => onCopyCoupon(plan.key, plan.couponCode || '')}
            className="mt-2 flex w-full items-center gap-2 rounded-[12px] border border-[#ece6f7] bg-[#fbfffd] px-3 py-2 text-left transition hover:border-[#9ce8c8] sm:mt-3 sm:rounded-[14px] sm:py-2.5"
            aria-label={`Use coupon ${plan.couponCode}`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00a071] text-white sm:h-7 sm:w-7">
              <CheckmarkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-black leading-4 text-[#5d546f]">
                USE: <span className="text-[#009c70]">{plan.couponCode}</span>
              </span>
              <span className="mt-0.5 hidden text-[11px] font-semibold text-[#9a91a8] sm:block">
                {copied ? 'Copied' : 'Tap to copy'}
              </span>
            </span>
          </button>
        )}

      </div>

      <Link
        href={plan.href}
        onClick={(event) => onPlanClick(event, plan)}
        onMouseEnter={() => onPrefetch(plan.href)}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-[#7c35df] px-4 text-sm font-black text-white shadow-[0_18px_32px_rgba(124,53,223,0.22)] transition hover:bg-[#6828c9]"
      >
        Continue
        <ArrowRightIcon className="h-4 w-4" />
      </Link>

    </article>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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
