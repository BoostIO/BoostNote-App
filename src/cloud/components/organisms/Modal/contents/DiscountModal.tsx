import React from 'react'
import styled from '../../../../../shared/lib/styled'
import Countdown from 'react-countdown'
import { newTeamDiscountDays } from '../../../../lib/subscription'
import PlanTables from '../../Subscription/PlanTables'
import { useSettings } from '../../../../lib/stores/settings'
import { useModal } from '../../../../../shared/lib/stores/modal'
import { usePage } from '../../../../lib/stores/pageStore'
import Banner from '../../../../../shared/components/atoms/Banner'
import { mdiExclamation } from '@mdi/js'
import TeamSubLimit from '../../settings/TeamSubLimit'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import { TFunction } from 'i18next'
import { withTranslation, Translation } from 'react-i18next'

const DiscountModal = () => {
  const { openSettingsTab } = useSettings()
  const { closeAllModals } = useModal()
  const { team, subscription } = usePage()
  const { translate } = useI18n()

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
        <h3 className='discount__modal__title'>
          {translate(lngKeys.DiscountModalTitle)}
        </h3>
        <div className='discount__modal__description'>
          {translate(lngKeys.DiscountModalTimeRemaining)}
        </div>
        <Countdown renderer={DiscountCountdownRenderer} date={eligibilityEnd} />
        <PlanTables
          team={team}
          selectedPlan={'free'}
          discounted={true}
          freePlanFooter={
            <TeamSubLimit
              padded={false}
              onLimitClick={() => {
                openSettingsTab('teamUpgrade')
                closeAllModals()
              }}
            />
          }
          onStandardCallback={() => {
            openSettingsTab('teamUpgrade', {
              initialPlan: 'standard',
              tabState: 'form',
            })
            closeAllModals()
          }}
          onProCallback={() => {
            openSettingsTab('teamUpgrade', {
              initialPlan: 'pro',
              tabState: 'form',
            })
            closeAllModals()
          }}
          onTrialCallback={() => {
            openSettingsTab('teamUpgrade', { showTrialPopup: true })
            closeAllModals()
          }}
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
    return withTranslation()(DiscountExpired)
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

const DiscountExpired = ({ t }: { t: TFunction }) => {
  return (
    <div className='countdown__expired'>{t(lngKeys.DiscountModalExpired)}</div>
  )
}

const Container = styled.div`
  .discount__modal__header {
    text-align: center;
  }

  .discount__modal__title {
    margin: 0;
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
