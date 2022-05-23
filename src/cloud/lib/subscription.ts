import { differenceInDays, isBefore, add } from 'date-fns'
import { SerializedDoc } from '../interfaces/db/doc'
import { SerializedSubscription } from '../interfaces/db/subscription'
import { SerializedTeam } from '../interfaces/db/team'
import { SerializedUserTeamPermissions } from '../interfaces/db/userTeamPermissions'
import { filterIter } from './utils/iterator'

export const freePlanDocLimit = Infinity
export const freeTrialPeriodDays = 7

export const freePlanStorageMb = 1000
export const standardPlanStorageMb = 1000
export const proPlanStorageMb = 10000

export const revisionHistoryFreeDays = 7
export const revisionHistoryStandardDays = 7
export const newTeamDiscountDays = 7

export const freePlanMembersLimit = 9999

export const freePlanUploadSizeMb = 10
export const paidPlanUploadSizeMb = 200

export const freePlanSmartViewPerDashboardLimit = 4
export const freePlanDashboardPerUserPerTeamLimit = 1

export const initialTrialLength = { days: 14 }
export const legacyCutoff = new Date(process.env.LEGACY_CUTOFF || Date.now())

export function isTimeEligibleForDiscount(team: {
  createdAt: string
  trial: boolean
}) {
  return (
    differenceInDays(Date.now(), new Date(team.createdAt)) <
      newTeamDiscountDays && team.trial
  )
}

export function teamIsReadonly(
  team: SerializedTeam,
  subscription?: SerializedSubscription
) {
  if (subscription == null) {
    return remainingTrialInfo(team).remaining < 1
  }

  return subscription.status === 'inactive'
}

export function remainingTrialInfo(team: SerializedTeam) {
  const createDate = new Date(team.createdAt)
  createDate.setUTCHours(0, 0, 0, 0)
  const startDate = isBefore(createDate, legacyCutoff)
    ? legacyCutoff
    : createDate
  startDate.setUTCHours(0, 0, 0, 0)
  const endDate = add(startDate, initialTrialLength)
  endDate.setUTCHours(0, 0, 0, 0)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  if (!team.trial) {
    return {
      remaining: 0,
      max: initialTrialLength.days,
      end: endDate,
    }
  }

  return {
    remaining: Math.max(0, differenceInDays(endDate, today)),
    max: initialTrialLength.days,
    end: endDate,
  }
}

export function didTeamReachPlanLimit(
  permissions: SerializedUserTeamPermissions[],
  subscription?: SerializedSubscription
): boolean {
  if (subscription != null && subscription.status !== 'inactive') {
    return false
  }

  if (
    ((permissions || []) as any[]).filter((p) => p.role !== 'viewer').length >=
    freePlanMembersLimit
  ) {
    return true
  }

  return false
}

export function canCreatePrivateFolders(
  subscription?: SerializedSubscription
): boolean {
  return subscription != null && subscription.plan === 'pro'
}

export function canCreateDoc(
  docs: SerializedDoc[],
  subscription?: SerializedSubscription
): boolean {
  return (
    subscription != null ||
    filterIter((doc) => doc.generated === false, docs).length < freePlanDocLimit
  )
}
