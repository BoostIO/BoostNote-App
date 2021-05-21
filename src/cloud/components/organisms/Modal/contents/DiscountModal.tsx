import React from 'react'
import styled from '../../../../../shared/lib/styled'
import { SerializedTeam } from '../../../../interfaces/db/team'
import Countdown from 'react-countdown'
import { newTeamDiscountDays } from '../../../../lib/subscription'
import PlanTables from '../../Subscription/PlanTables'

interface DiscountModalProps {
  team: SerializedTeam
}

const DiscountModal = ({ team }: DiscountModalProps) => {
  const eligibilityEnd = new Date(team.createdAt)
  eligibilityEnd.setDate(eligibilityEnd.getDate() + newTeamDiscountDays)

  return (
    <Container className='discount__modal'>
      <header className='discount__modal__header'>
        <h3 className='discount__modal__title'>
          Subscribe now to receive a three months discount!
        </h3>
        <div className='discount__modal__description'>Time remaining</div>
        <Countdown renderer={DiscountCountdown} date={eligibilityEnd} />
        <PlanTables team={team} selectedPlan={'free'} discounted={true} />
      </header>
    </Container>
  )
}

const DiscountCountdown = ({
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
    return (
      <div className='countdown__expired'>
        Your eligibility for a discount has expired
      </div>
    )
  }

  return (
    <div className='countdown'>
      <div className='countdown__column'>
        <div className='countdown__number'>{days}</div>
        <span className='countdown__description'>days</span>
      </div>
      <div className='countdown__column'>
        <div className='countdown__number'>{hours}</div>
        <span className='countdown__description'>hours</span>
      </div>
      <div className='countdown__column'>
        <div className='countdown__number'>{minutes}</div>
        <span className='countdown__description'>minutes</span>
      </div>
      <div className='countdown__column'>
        <div className='countdown__number'>{seconds}</div>
        <span className='countdown__description'>seconds</span>
      </div>
    </div>
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
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
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
