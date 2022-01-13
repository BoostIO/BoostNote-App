export const stripeProPlanUnit = 10
export const stripeProJpyPlanUnit = 1000
export const stripeStandardPlanUnit = 6
export const stripeStandardJpyPlanUnit = 600

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
