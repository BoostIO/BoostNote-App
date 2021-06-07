export const stripeProPlanUnit = 8
export const stripeProJpyPlanUnit = 800
export const stripeStandardPlanUnit = 3
export const stripeStandardJpyPlanUnit = 300

export type UpgradePlans = 'standard' | 'pro'

export type CloudDiscountParameters = {
  durationInMonths: number
  percentageOff: number
}

type DiscountPlan = 'newUserStandard' | 'newUserPro' | 'migration' | 'newSpace'
export type CloudDiscounts = Record<DiscountPlan, CloudDiscountParameters>

export const discountPlans: CloudDiscounts = {
  newSpace: {
    durationInMonths: 1,
    percentageOff: 100,
  },
  newUserStandard: {
    durationInMonths: 3,
    percentageOff: 33,
  },
  newUserPro: {
    durationInMonths: 3,
    percentageOff: 50,
  },
  migration: {
    durationInMonths: 1,
    percentageOff: 100,
  },
}
