export const stripeProPlanUnit = 8
export const stripeProJpyPlanUnit = 800
export const stripeStandardPlanUnit = 3
export const stripeStandardJpyPlanUnit = 300

export type UpgradePlans = 'standard' | 'pro'

type DiscountParameters = {
  durationInMonths: number
  amountOff: number
  percentageOff: number
}

type Discounts = Record<UpgradePlans, DiscountParameters>

export const newUserDiscountPlans: Discounts = {
  standard: {
    durationInMonths: 3,
    amountOff: 1,
    percentageOff: 33,
  },
  pro: {
    durationInMonths: 3,
    amountOff: 4,
    percentageOff: 50,
  },
}
