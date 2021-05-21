import { differenceInDays } from 'date-fns'
import { SerializedTeam } from '../interfaces/db/team'

export const freePlanDocLimit = 30
export const freeTrialPeriodDays = 7
export const guestsPerMember = 3

export const freePlanStorageMb = 100
export const standardPlanStorageMb = 1000
export const proPlanStorageMb = 10000

export const revisionHistoryStandardDays = 7
export const newTeamDiscountDays = 7

export function isEligibleForDiscount(team: SerializedTeam) {
  if (
    differenceInDays(Date.now(), new Date(team.createdAt)) <=
    newTeamDiscountDays
  ) {
    return true
  }

  return false
}
