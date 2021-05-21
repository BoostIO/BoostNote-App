import { formatDistanceToNow } from 'date-fns'
import React, { useMemo } from 'react'
import { useMediaQuery } from 'react-responsive'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import { SerializedTeam } from '../../../interfaces/db/team'
import { UpgradePlans } from '../../../lib/stripe'
import {
  freePlanDocLimit,
  freePlanStorageMb,
  proPlanStorageMb,
  revisionHistoryStandardDays,
  standardPlanStorageMb,
} from '../../../lib/subscription'
import cc from 'classcat'
import Button from '../../../../shared/components/atoms/Button'
import Link from '../../../../shared/components/atoms/Link'
import styled from '../../../../shared/lib/styled'

interface PlanTablesProps {
  team: SerializedTeam
  subscription?: SerializedSubscription
  selectedPlan: UpgradePlans | 'free'
  discounted?: boolean
  onFreeCallback?: () => void
  onStandardCallback?: () => void
  onProCallback?: () => void
  onTrialCallback?: () => void
}

const PlanTables = ({
  team,
  selectedPlan,
  onFreeCallback,
  onTrialCallback,
  onStandardCallback,
  onProCallback,
  subscription,
  discounted,
}: PlanTablesProps) => {
  const isTabletOrMobile = useMediaQuery({ maxWidth: 1080 })

  const freeTrialContent = useMemo(() => {
    if (subscription != null) {
      if (subscription.status !== 'trialing') {
        return null
      }

      const trialEndDate = new Date(subscription.currentPeriodEnd * 1000)
      return (
        <p>
          <span className='check'>&#x2713;</span> In free trial (
          {formatDistanceToNow(trialEndDate, { includeSeconds: false })} left)
        </p>
      )
    }

    if (!team.trial || onTrialCallback == null) {
      return null
    }

    return (
      <p>
        <Link
          href='#'
          onClick={(e: any) => {
            e.preventDefault()
            onTrialCallback()
          }}
        >
          7 days free trial
        </Link>
      </p>
    )
  }, [subscription, team, onTrialCallback])

  return (
    <Container className={cc(['plans', isTabletOrMobile && 'plans--mobile'])}>
      <div className='plans__header'>
        <div className='plan__item'>
          <div className='plan__item__price'></div>
          <div className='plan__item__description'></div>
        </div>
      </div>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  overflow: auto;

  .plans__header {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    flex: 1 1 auto;
  }

  &.plans--mobile .plans__header {
    flex-wrap: wrap;
    width: 100%;
    flex: 0 0 auto;
  }
`

export default PlanTables
