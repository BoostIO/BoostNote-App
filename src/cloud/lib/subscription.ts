import { differenceInDays } from 'date-fns'

export const freeTrialPeriodDays = 7

export const freePlanStorageMb = 100
export const standardPlanStorageMb = 1000
export const proPlanStorageMb = 10000

export const revisionHistoryStandardDays = 7
export const newTeamDiscountDays = 7

export const membersForDiscount = 4
export const freePlanMembersLimit = 1
export function isEligibleForDiscount(
  team: {
    createdAt: string
  },
  permissions: any[]
) {
  if (
    isTimeEligibleForDiscount(team) &&
    permissions.length > membersForDiscount
  ) {
    return true
  }

  return false
}

export function isTimeEligibleForDiscount(team: { createdAt: string }) {
  if (
    differenceInDays(Date.now(), new Date(team.createdAt)) <=
    newTeamDiscountDays
  ) {
    return true
  }

  return false
}
