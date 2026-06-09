import {
  apiFetch,
  AvailableBillingCoupon,
  AvailableBillingCouponsResponse,
  BillingPlan,
  BillingPricing,
} from '@/lib/payment-client'

export type PlanCouponOffer = {
  coupon: AvailableBillingCoupon
  pricing: BillingPricing
  discountPercent: number
}

export async function fetchBestCouponOffers(plans: BillingPlan[]): Promise<Record<string, PlanCouponOffer | null>> {
  const entries = await Promise.all(
    plans.map(async (plan) => {
      try {
        const response = await apiFetch<AvailableBillingCouponsResponse>(
          `/billing/coupons/available?planId=${encodeURIComponent(plan.planId)}`,
          {
            headers: {
              Accept: 'application/json',
            },
            skipAuth: true,
          }
        )

        return [plan.planId, getBestCouponOffer(plan, response.coupons || [])] as const
      } catch {
        return [plan.planId, null] as const
      }
    })
  )

  return entries.reduce<Record<string, PlanCouponOffer | null>>((offers, [planId, offer]) => {
    offers[planId] = offer
    return offers
  }, {})
}

function getBestCouponOffer(plan: BillingPlan, coupons: AvailableBillingCoupon[]) {
  return coupons.reduce<PlanCouponOffer | null>((bestOffer, coupon) => {
    const pricing = getCouponPricing(plan, coupon)

    if (!pricing || pricing.discountAmountPaise <= 0 || pricing.finalAmountPaise >= pricing.baseAmountPaise) {
      return bestOffer
    }

    const discountPercent = Math.max(
      1,
      Math.round((pricing.discountAmountPaise / Math.max(pricing.baseAmountPaise, 1)) * 100)
    )
    const offer = {
      coupon,
      pricing,
      discountPercent,
    }

    if (!bestOffer || pricing.finalAmountPaise < bestOffer.pricing.finalAmountPaise) {
      return offer
    }

    return bestOffer
  }, null)
}

function getCouponPricing(plan: BillingPlan, coupon: AvailableBillingCoupon): BillingPricing | null {
  const backendPricing = coupon.pricing

  if (
    backendPricing &&
    isFiniteNumber(backendPricing.baseAmountPaise) &&
    isFiniteNumber(backendPricing.discountAmountPaise) &&
    isFiniteNumber(backendPricing.finalAmountPaise) &&
    backendPricing.discountAmountPaise > 0 &&
    backendPricing.finalAmountPaise < backendPricing.baseAmountPaise
  ) {
    return {
      ...backendPricing,
      currency: backendPricing.currency || plan.currency,
    }
  }

  const discountAmountPaise = getFallbackCouponDiscountPaise(plan, coupon)

  if (!discountAmountPaise || discountAmountPaise <= 0) {
    return null
  }

  return {
    baseAmountPaise: plan.amountPaise,
    discountAmountPaise,
    finalAmountPaise: Math.max(0, plan.amountPaise - discountAmountPaise),
    currency: plan.currency,
  }
}

function getFallbackCouponDiscountPaise(plan: BillingPlan, coupon: AvailableBillingCoupon) {
  const valueCoupon = coupon as AvailableBillingCoupon & { discountPercentage?: number }
  const discountType = coupon.discountType?.toUpperCase()
  const discountValue = getFiniteNumber(coupon.discountValue)
  const legacyPercentage = getFiniteNumber(valueCoupon.discountPercentage)
  const maxDiscountPaise = getFiniteNumber(coupon.maxDiscountPaise)

  if (
    discountType === 'PERCENT' ||
    discountType === 'PERCENTAGE' ||
    (!discountType && discountValue > 0 && discountValue <= 100) ||
    legacyPercentage > 0
  ) {
    const percentage = Math.min(100, legacyPercentage > 0 ? legacyPercentage : discountValue)
    const uncappedDiscount = Math.round((plan.amountPaise * percentage) / 100)
    return Math.min(plan.amountPaise, maxDiscountPaise > 0 ? Math.min(uncappedDiscount, maxDiscountPaise) : uncappedDiscount)
  }

  if (discountValue > 0) {
    const discountAmountPaise = discountValue < 1000 ? discountValue * 100 : discountValue
    return Math.min(plan.amountPaise, Math.round(discountAmountPaise))
  }

  return 0
}

function getFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
