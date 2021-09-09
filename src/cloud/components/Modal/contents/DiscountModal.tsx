import React, { useMemo } from 'react'
import styled from '../../../../design/lib/styled'
import Countdown from 'react-countdown'
import {
  newTeamDiscountDays,
  isTimeEligibleForDiscount,
} from '../../../lib/subscription'
import PlanTables from '../../Subscription/PlanTables'
import { useSettings } from '../../../lib/stores/settings'
import { useModal } from '../../../../design/lib/stores/modal'
import { usePage } from '../../../lib/stores/pageStore'
import Banner from '../../../../design/components/atoms/Banner'
import { mdiExclamation } from '@mdi/js'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import { Translation } from 'react-i18next'

const DiscountModal = () => {
  const { openSettingsTab } = useSettings()
  const { closeAllModals } = useModal()
  const { team, subscription } = usePage()
  const { translate } = useI18n()

  const isTimeEligible = useMemo(() => {
    if (team == null) {
      return false
    }
    return isTimeEligibleForDiscount(team)
  }, [team])

  if (team == null) {
    return null
  }

  if (subscription != null) {
    return (
      <Container className='discount__modal'>
        <Banner variant='danger' iconPath={mdiExclamation}>
          {translate(lngKeys.DiscountModalAlreadySubscribed)}
        </Banner>
      </Container>
    )
  }

  const eligibilityEnd = new Date(team.createdAt)
  eligibilityEnd.setDate(eligibilityEnd.getDate() + newTeamDiscountDays)

  return (
    <Container className='discount__modal'>
      <header className='discount__modal__header'>
        <div className='discount__modal__title'>
          {translate(lngKeys.DiscountModalTitle)}
        </div>
        {isTimeEligible ? (
          <>
            <div className='discount__modal__description'>
              {translate(lngKeys.DiscountModalTimeRemaining)}
            </div>
            <Countdown
              renderer={DiscountCountdownRenderer}
              date={eligibilityEnd}
            />
          </>
        ) : (
          <div className='discount__modal__description'>
            {translate(lngKeys.DiscountModalExpired)}
          </div>
        )}
        <PlanTables
          team={team}
          selectedPlan={'free'}
          discounted={isTimeEligible}
          onStandardCallback={
            isTimeEligible
              ? () => {
                  openSettingsTab('teamUpgrade', {
                    initialPlan: 'standard',
                    tabState: 'form',
                  })
                  closeAllModals()
                }
              : undefined
          }
          onProCallback={
            isTimeEligible
              ? () => {
                  openSettingsTab('teamUpgrade', {
                    initialPlan: 'pro',
                    tabState: 'form',
                  })
                  closeAllModals()
                }
              : undefined
          }
        />
      </header>
    </Container>
  )
}

const DiscountCountdownRenderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: {
  days: number
  hours: number
  minutes: number
  seconds: number
  completed: boolean
}) => {
  if (completed) {
    return null
  }

  return (
    <Translation>
      {(t, {}) => (
        <div className='countdown'>
          <div className='countdown__column'>
            <div className='countdown__number'>{days}</div>
            <span className='countdown__description'>
              {t(lngKeys.GeneralDays)}
            </span>
          </div>
          <div className='countdown__column'>
            <div className='countdown__number'>{hours}</div>
            <span className='countdown__description'>
              {t(lngKeys.GeneralHours)}
            </span>
          </div>
          <div className='countdown__column'>
            <div className='countdown__number'>{minutes}</div>
            <span className='countdown__description'>
              {t(lngKeys.GeneralMinutes)}
            </span>
          </div>
          <div className='countdown__column'>
            <div className='countdown__number'>{seconds}</div>
            <span className='countdown__description'>
              {t(lngKeys.GeneralSeconds)}
            </span>
          </div>
        </div>
      )}
    </Translation>
  )
}

const Container = styled.div`
  .discount__modal__subtitle {
    span {
      font-size: ${({ theme }) => theme.sizes.fonts.md}px;
      display: inline-block;
      margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    margin-bottom: ${({ theme }) => theme.sizes.spaces.md}px;
  }

  .plans {
    justify-content: center;

    .plan__item {
      padding: ${({ theme }) => theme.sizes.spaces.sm}px
        ${({ theme }) => theme.sizes.spaces.md}px;
      width: 50%;
      max-width: 420px;
      border: 1px solid ${({ theme }) => theme.colors.border.main};

      .plan__item__footer {
        margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
        position: relative;
      }
    }
    .plan__item--free {
      display: none;
    }

    .plan__item--pro {
      margin-left: ${({ theme }) => theme.sizes.spaces.md}px;
    }

    .plan__item__footer {
      height: auto;
    }
  }

  .discount__modal__header {
    text-align: center;
  }

  .discount__modal__title {
    margin: 0;
    margin-top: ${({ theme }) => theme.sizes.spaces.md}px;
    font-size: ${({ theme }) => theme.sizes.fonts.l}px;
  }

  .discount__modal__header > * + .discount__modal__header > * {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .discount__modal__description {
    margin: ${({ theme }) => theme.sizes.spaces.df}px 0;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: ${({ theme }) => theme.sizes.fonts.md};
  }

  .countdown {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: top;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xl}px;
  }

  .countdown__column {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 0 0 auto;
  }

  .countdown__column + .countdown__column {
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .countdown__number {
    background: #000;
    color: #fff;
    width: 70px;
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
    text-align: center;
    padding: ${({ theme }) => theme.sizes.spaces.sm}px
      ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .countdown__description {
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    text-transform: uppercase;
    font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
  }
`

export default DiscountModal
